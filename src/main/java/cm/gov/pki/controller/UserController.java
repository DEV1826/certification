package cm.gov.pki.controller;

import cm.gov.pki.dto.AuthDTO;
import cm.gov.pki.entity.User;
import cm.gov.pki.entity.Certificate;
import cm.gov.pki.entity.CertificateRequest;
import cm.gov.pki.repository.CertificateRepository;
import cm.gov.pki.repository.CertificateRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/user")
public class UserController {

	private static final Logger log = LoggerFactory.getLogger(UserController.class);

	private final CertificateRepository certificateRepository;
    private final CertificateRequestRepository certificateRequestRepository;

    @Autowired
    public UserController(CertificateRepository certificateRepository, CertificateRequestRepository certificateRequestRepository) {
        this.certificateRepository = certificateRepository;
        this.certificateRequestRepository = certificateRequestRepository;
    }

	@GetMapping("/me")
	public ResponseEntity<AuthDTO.UserDTO> me(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
			return ResponseEntity.status(401).build();
		}

		User user = (User) authentication.getPrincipal();

		AuthDTO.UserDTO dto = new AuthDTO.UserDTO();
		dto.setId(user.getId());
		dto.setEmail(user.getEmail());
		dto.setFirstName(user.getFirstName());
		dto.setLastName(user.getLastName());
		dto.setRole(user.getRole().name());
		dto.setIsActive(user.getIsActive());
		dto.setEmailVerified(user.getEmailVerified());
		dto.setCreatedAt(user.getCreatedAt());
		dto.setLastLogin(user.getLastLogin());

		return ResponseEntity.ok(dto);
	}

	/**
	 * Récupère les certificats de l'utilisateur connecté
	 */
	@GetMapping("/certificates")
	public ResponseEntity<?> getMyCertificates(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
			return ResponseEntity.status(401).build();
		}
		User user = (User) authentication.getPrincipal();
		var certs = certificateRepository.findByUserOrderByIssuedAtDesc(user);
		// Mapper vers un DTO simplifié pour éviter d'exposer tout l'objet
		var result = certs.stream().map(cert -> new CertificateDTO(cert)).toList();
		return ResponseEntity.ok(result);
	}

    /**
     * Soumettre une nouvelle demande de certificat
     * Accepte un CSR (texte) et des pièces justificatives en multipart
     */
    @PostMapping(value = "/certificate-requests", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitCertificateRequest(
            Authentication authentication,
            @RequestParam(name = "commonName", required = false) String commonName,
            @RequestParam(name = "organization", required = false) String organization,
            @RequestParam(name = "organizationalUnit", required = false) String organizationalUnit,
            @RequestParam(name = "locality", required = false) String locality,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "country", required = false) String country,
            @RequestParam(name = "email", required = false) String email,
            @RequestParam(name = "csr", required = false) String csr,
            @RequestPart(name = "csrFile", required = false) org.springframework.web.multipart.MultipartFile csrFile,
            @RequestPart(name = "documents", required = false) MultipartFile[] documents
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();

        CertificateRequest req = new CertificateRequest();
        req.setUser(user);
        req.setCommonName(commonName == null ? user.getFirstName() + " " + user.getLastName() : commonName);
        req.setOrganization(organization);
        // If CSR text not provided but a CSR file was uploaded, try to read it

        // Validation stricte : un CSR (texte ou fichier) est obligatoire
        if ((csr == null || csr.isBlank()) && (csrFile == null || csrFile.isEmpty())) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Un CSR est requis (texte ou fichier)"));
        }
        // Si CSR texte absent mais fichier présent, lire le fichier
        if ((csr == null || csr.isBlank()) && csrFile != null && !csrFile.isEmpty()) {
            try {
                long csrSize = csrFile.getSize();
                if (csrSize > 200 * 1024) { // 200KB limit for CSR
                    return ResponseEntity.status(400).body(java.util.Map.of("error", "CSR trop volumineux (>200KB)"));
                }
                String contentType = csrFile.getContentType();
                // Accept text/* and some common CSR mime types
                if (contentType != null && !(contentType.startsWith("text/") || contentType.equals("application/pkcs10") || contentType.equals("application/x-pem-file") || contentType.equals("application/octet-stream"))) {
                    log.warn("Type MIME inattendu pour CSR: {}", contentType);
                }
                try (java.io.InputStream in = csrFile.getInputStream()) {
                    csr = new String(in.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            } catch (java.io.IOException ex) {
                log.warn("Impossible de lire le fichier CSR", ex);
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Impossible de lire le fichier CSR"));
            }
        }
        req.setCsrContent(csr);
        // If the user provided an email override, validate it; otherwise use profile email
        if (email != null && !email.isBlank()) {
            String emailTrim = email.trim();
            if (!emailTrim.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Email invalide"));
            }
            req.setEmail(emailTrim);
        } else {
            req.setEmail(user.getEmail());
        }

        // Set subject fields
        req.setOrganization(organization);
        req.setOrganizationalUnit(organizationalUnit);
        req.setLocality(locality);
        req.setState(state);
        req.setCountry(country);

        // Basic required field validation (CN, O, L, C, email)
        if (req.getCommonName() == null || req.getCommonName().isBlank()) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Common Name (CN) est requis"));
        }
        if (req.getOrganization() == null || req.getOrganization().isBlank()) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Organisation (O) est requise"));
        }
        if (req.getLocality() == null || req.getLocality().isBlank()) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Ville (L) est requise"));
        }
        if (req.getCountry() == null || !req.getCountry().matches("^[A-Za-z]{2}$")) {
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Pays (C) doit être un code ISO 2 lettres"));
        }

        req.setStatus("PENDING");
        req.setSubmittedAt(java.time.LocalDateTime.now());

        // Validation des fichiers fournis (types autorisés et taille max)
        final long MAX_FILE_SIZE = 5L * 1024L * 1024L; // 5MB
        final java.util.List<String> ALLOWED_TYPES = java.util.List.of("application/pdf", "image/png", "image/jpeg", "image/jpg", "image/gif", "text/plain");

        if (documents != null && documents.length > 0) {
            java.util.List<String> invalid = new java.util.ArrayList<>();
            for (MultipartFile f : documents) {
                if (f.isEmpty()) continue;
                String ct = f.getContentType();
                long sz = f.getSize();
                if (ct == null || !ALLOWED_TYPES.contains(ct.toLowerCase())) {
                    invalid.add(f.getOriginalFilename() == null ? "file" : f.getOriginalFilename());
                } else if (sz > MAX_FILE_SIZE) {
                    invalid.add(f.getOriginalFilename() == null ? "file" : f.getOriginalFilename());
                }
            }
            if (!invalid.isEmpty()) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Fichiers non valides (type/taille)", "files", invalid));
            }
        }

        req = certificateRequestRepository.save(req);

        // Sauvegarder physiquement les fichiers si fournis
        if (documents != null && documents.length > 0) {
            try {
                java.nio.file.Path base = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", "certificate_requests", req.getId().toString());
                java.nio.file.Files.createDirectories(base);
                java.util.List<String> saved = new java.util.ArrayList<>();
                for (MultipartFile f : documents) {
                    if (f.isEmpty()) continue;
                    String original = f.getOriginalFilename();
                    String baseName = (original == null) ? "file" : java.nio.file.Paths.get(original).getFileName().toString();
                    String safeBase = baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
                    String safeName = java.util.UUID.randomUUID().toString() + "_" + safeBase;
                    java.nio.file.Path target = base.resolve(safeName);
                    try (java.io.InputStream in = f.getInputStream()) {
                        java.nio.file.Files.copy(in, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                    }
                    saved.add(safeName);
                }
                // Stocker la liste des fichiers dans la colonne documents (CSV)
                if (!saved.isEmpty()) {
                    req.setDocuments(String.join(",", saved));
                    // Enregistrer aussi dans notes la liste pour référence
                    req.setNotes(String.join(",", saved));
                    req = certificateRequestRepository.save(req);
                }
            } catch (java.io.IOException ex) {
                // En cas d'erreur d'E/S, supprimer la demande créée pour éviter les orphelins
                log.error("Erreur lors de l'enregistrement des fichiers de la demande {}", req.getId(), ex);
                try {
                    certificateRequestRepository.delete(req);
                } catch (Exception delEx) {
                    log.warn("Impossible de supprimer la demande après échec de sauvegarde des fichiers {}", req.getId(), delEx);
                }
                return ResponseEntity.status(500).body(java.util.Map.of("error", "Erreur lors de l'enregistrement des fichiers"));
            } catch (RuntimeException ex) {
                log.error("Erreur inattendue lors du traitement des fichiers de la demande {}", req.getId(), ex);
                return ResponseEntity.status(500).body(java.util.Map.of("error", "Erreur inattendue"));
            }
        }

        return ResponseEntity.ok(Map.of("requestId", req.getId().toString(), "status", req.getStatus()));
    }

    // DTO simplifié pour l'exposition API
    public static class CertificateDTO {
        public String id;
        public String serialNumber;
        public String subjectDN;
        public String issuerDN;
        public String status;
        public String notBefore;
        public String notAfter;
        public String certificatePem;

        public CertificateDTO(Certificate cert) {
            this.id = cert.getId().toString();
            this.serialNumber = cert.getSerialNumber();
            this.subjectDN = cert.getSubjectDN();
            this.issuerDN = cert.getIssuerDN();
            this.status = cert.getStatus().name();
            this.notBefore = cert.getNotBefore() != null ? cert.getNotBefore().toString() : null;
            this.notAfter = cert.getNotAfter() != null ? cert.getNotAfter().toString() : null;
            this.certificatePem = cert.getCertificatePem();
        }
    }

    // Récupérer les demandes de certificat de l'utilisateur
    @GetMapping("/certificate-requests")
    public ResponseEntity<?> getMyRequests(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        var reqs = certificateRequestRepository.findByUserOrderBySubmittedAtDesc(user);
        var dto = reqs.stream().map(r -> new CertificateRequestDTO(r)).toList();
        return ResponseEntity.ok(dto);
    }

    // Télécharger une pièce jointe
    @GetMapping("/certificate-requests/{id}/documents/{filename}")
    public ResponseEntity<?> downloadDocument(Authentication authentication, @PathVariable("id") java.util.UUID id, @PathVariable("filename") String filename) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User user = (User) authentication.getPrincipal();
        var opt = certificateRequestRepository.findByIdAndUser(id, user);
        if (opt.isEmpty()) return ResponseEntity.status(404).build();
        var req = opt.get();
        if (req.getDocuments() == null || !java.util.Arrays.asList(req.getDocuments().split(",")).contains(filename)) {
            return ResponseEntity.status(404).build();
        }
        java.nio.file.Path path = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploads", "certificate_requests", id.toString(), filename);
        if (!java.nio.file.Files.exists(path)) return ResponseEntity.status(404).build();
        try {
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(path.toUri());
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (java.net.MalformedURLException ex) {
            log.error("URL invalide pour le fichier {} du téléchargement {}", filename, id, ex);
            return ResponseEntity.status(400).body(java.util.Map.of("error", "Nom de fichier invalide"));
        } catch (RuntimeException ex) {
            log.error("Erreur lors du chargement de la ressource {} pour la demande {}", filename, id, ex);
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Erreur serveur"));
        }
    }

    // DTO pour les demandes
    public static class CertificateRequestDTO {
        public String id;
        public String commonName;
        public String organization;
        public String organizationalUnit;
        public String locality;
        public String state;
        public String country;
        public String email;
        public String status;
        public String submittedAt;
        public String[] documents;

        public CertificateRequestDTO(CertificateRequest r) {
            this.id = r.getId().toString();
            this.commonName = r.getCommonName();
            this.organization = r.getOrganization();
            this.organizationalUnit = r.getOrganizationalUnit();
            this.locality = r.getLocality();
            this.state = r.getTokenUsedAt() != null ? null : null; // placeholder if needed
            this.country = r.getCountry();
            this.email = r.getEmail();
            this.status = r.getStatus();
            this.submittedAt = r.getSubmittedAt() != null ? r.getSubmittedAt().toString() : null;
            this.documents = r.getDocuments() != null ? r.getDocuments().split(",") : new String[0];
        }
    }
}

