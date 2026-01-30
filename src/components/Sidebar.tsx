import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const userLinks = [
  { to: '/dashboard', label: 'Tableau de bord' },
  { to: '/certificates', label: 'Mes certificats' },
  { to: '/generate-csr', label: 'Nouvelle demande' },
  { to: '/requests', label: 'Suivi de demande' },
  { to: '/revoke-certificate', label: 'Révoquer un certificat' },
  { to: '/download-crl', label: 'Télécharger la CRL' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard Admin' },
  { to: '/admin/stats', label: 'Statistiques' },
  { to: '/admin/requests', label: 'Gérer demandes' },
  { to: '/admin/generate-ca', label: 'Générer CA' },
  { to: '/admin/sign-csr', label: 'Signer une CSR' },
  { to: '/admin/generate-crl', label: 'Générer/Faire pivoter la CRL' },
  { to: '/admin/revoke-certificate', label: 'Révoquer un certificat' },
  { to: '/admin/download-crl', label: 'Télécharger la CRL' },
];

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen p-6">
      <div className="mb-4 text-h4 font-bold text-primary-900">PKI Souverain</div>
      {user?.role === 'ADMIN' ? (
        <div className="mb-6 px-3 py-2 rounded bg-red-50 text-red-700 font-semibold text-center text-body-small border border-red-200">
          Espace Administrateur
        </div>
      ) : (
        <div className="mb-6 px-3 py-2 rounded bg-blue-50 text-blue-700 font-semibold text-center text-body-small border border-blue-200">
          Espace Utilisateur
        </div>
      )}
      <nav className="flex flex-col space-y-2 mb-8">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-2 rounded transition-fast font-medium ${location.pathname === link.to ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 hover:bg-neutral-100'}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto w-full px-4 py-2 bg-red-100 text-red-700 rounded transition-fast font-medium hover:bg-red-200"
      >
        Déconnexion
      </button>
    </aside>
  );
}
