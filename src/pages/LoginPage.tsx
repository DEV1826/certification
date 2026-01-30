import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';  // ← DÉPEND de api.ts
import { useAuthStore } from '../stores/authStore';  // ← DÉPEND de authStore.ts
import Input from '../components/Input';  // ← DÉPEND de Input.tsx
import Button from '../components/Button';  // ← DÉPEND de Button.tsx
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirige si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      // On ne navigue pas ici, le useEffect s'en charge après setUser
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="bg-white rounded-card p-8 shadow-medium w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 mx-auto text-primary-800 mb-4" />
          <h1 className="text-h2">Connexion</h1>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="votre@email.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="bg-danger-50 text-danger-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-body-small text-neutral-600 mt-6">
          Pas encore de compte ?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-primary-800 font-semibold hover:underline"
          >
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  );
}