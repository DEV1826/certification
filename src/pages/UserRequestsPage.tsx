import { useEffect, useState } from 'react';
import { userService } from '../services/api';

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService.getMyRequests()
      .then(setRequests)
      .catch(() => setError('Erreur lors du chargement des demandes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-h3 font-semibold mb-4">Suivi de mes demandes</h2>
      {loading ? (
        <div className="text-neutral-500">Chargement...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-neutral-500">Aucune demande trouvée.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow p-4 border border-neutral-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-primary-900">{r.commonName}</div>
                  <div className="text-sm text-neutral-600">{r.organization}</div>
                  <div className="text-xs text-neutral-400">Soumis le: {r.submittedAt?.slice(0,10)}</div>
                </div>
                <div className="text-sm font-medium text-neutral-700">{r.status}</div>
              </div>
              {r.documents && r.documents.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-semibold mb-2">Pièces jointes</div>
                  <ul className="space-y-1">
                    {r.documents.map((d:string) => (
                      <li key={d} className="flex items-center justify-between">
                        <div className="text-sm text-neutral-700">{d}</div>
                        <a className="text-primary-800 underline" href={`/api/user/certificate-requests/${r.id}/documents/${encodeURIComponent(d)}`} target="_blank" rel="noreferrer">Télécharger</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}