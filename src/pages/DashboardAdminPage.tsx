import { useEffect, useState } from 'react';
import { adminService } from '../services/api';  // ← DÉPEND de api.ts
import { useAuthStore } from '../stores/authStore';  // ← DÉPEND de authStore.ts
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { Link } from 'react-router-dom';

export default function DashboardAdminPage() {
  const user = useAuthStore((state) => state.user);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInitModal, setShowInitModal] = useState(false);
  const [busyInit, setBusyInit] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeCA = async () => {
    setShowInitModal(true);
  };

  const confirmInitialize = async () => {
    setBusyInit(true);
    try {
      await adminService.initializeCA();
      loadDashboard();  // Recharger
      addToast({ type: 'success', message: "AC Racine initialisée avec succès !" });
      setShowInitModal(false);
    } catch (error: any) {
      addToast({ type: 'error', message: error?.message || "Erreur lors de l'initialisation" });
    } finally {
      setBusyInit(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <header className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-h2 font-bold text-red-800">Tableau de bord - Admin</h1>
        <p className="text-body-small text-neutral-600">
          Connecté en tant que <span className="font-semibold">{user?.email}</span>
        </p>
      </header>
      <main className="max-w-7xl mx-auto p-8">
        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/stats" className="block px-4 py-6 rounded-xl bg-red-100 text-red-800 font-semibold text-center shadow hover:bg-red-200 transition">📊 Statistiques</Link>
          <Link to="/admin/generate-ca" className="block px-4 py-6 rounded-xl bg-orange-100 text-orange-800 font-semibold text-center shadow hover:bg-orange-200 transition">🏢 Générer CA</Link>
          <Link to="/admin/sign-csr" className="block px-4 py-6 rounded-xl bg-yellow-100 text-yellow-800 font-semibold text-center shadow hover:bg-yellow-200 transition">✍️ Signer une CSR</Link>
          <Link to="/admin/generate-crl" className="block px-4 py-6 rounded-xl bg-pink-100 text-pink-800 font-semibold text-center shadow hover:bg-pink-200 transition">🔄 Générer/Faire pivoter la CRL</Link>
          <Link to="/admin/revoke-certificate" className="block px-4 py-6 rounded-xl bg-purple-100 text-purple-800 font-semibold text-center shadow hover:bg-purple-200 transition">❌ Révoquer un certificat</Link>
          <Link to="/admin/download-crl" className="block px-4 py-6 rounded-xl bg-gray-100 text-gray-800 font-semibold text-center shadow hover:bg-gray-200 transition">📥 Télécharger la CRL</Link>
        </div>
        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Utilisateurs" value={dashboard?.totalUsers} />
          <StatCard label="Demandes en attente" value={dashboard?.pendingRequests} />
          <StatCard label="Certificats actifs" value={dashboard?.activeCertificates} />
        </div>
        {/* État AC */}
        <div className="bg-white rounded-card p-8 border shadow">
          <h2 className="text-h3 mb-4 text-red-800">État de l'Autorité de Certification</h2>
          {dashboard?.caStatus?.isInitialized ? (
            <div>
              <p><strong>Statut :</strong> <span className="text-green-700">✅ Active</span></p>
              <p><strong>Nom :</strong> {dashboard.caStatus.caName}</p>
              <p><strong>Valide jusqu'au :</strong> {dashboard.caStatus.validUntil}</p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-red-700">⚠️ L'AC n'est pas encore initialisée</p>
              <Button onClick={handleInitializeCA}>
                Initialiser l'Autorité de Certification
              </Button>
            </div>
          )}

          <Modal open={showInitModal} title="Initialiser l'AC Racine" onClose={() => setShowInitModal(false)}
            footer={
              <>
                <Button onClick={() => setShowInitModal(false)} variant="secondary">Annuler</Button>
                <Button onClick={confirmInitialize} className="ml-2" disabled={busyInit}>{busyInit ? 'Traitement...' : 'Confirmer'}</Button>
              </>
            }
          >
            <p>Initialiser l'AC Racine ? Cette action est irréversible.</p>
            <p className="text-sm text-neutral-600 mt-2">Un nouvel ensemble de clés et certificats root sera créé.</p>
          </Modal>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="bg-white rounded-card p-6 border">
      <div className="text-h1 text-primary-800">{value || 0}</div>
      <div className="text-body-small text-neutral-600">{label}</div>
    </div>
  );
}