import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield } from 'lucide-react';
import { authService } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.register({ email, password, firstName, lastName });
      setUser(user);
      // On ne navigue pas ici, le useEffect s'en charge après setUser
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // Redirige après inscription si connecté (après setUser)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <Shield className="h-10 w-10 text-primary-800 mb-2" />
          <h2 className="text-h3 font-bold text-primary-900">Créer un compte</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Prénom" value={firstName} onChange={setFirstName} required />
          <Input label="Nom" value={lastName} onChange={setLastName} required />
          <Input label="Email" type="email" value={email} onChange={setEmail} required />
          <Input label="Mot de passe" type="password" value={password} onChange={setPassword} required />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" loading={loading} className="w-full">S'inscrire</Button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-neutral-700">Déjà un compte ? </span>
          <button className="text-primary-800 hover:underline text-sm" onClick={() => navigate('/login')}>Se connecter</button>
        </div>
      </div>
    </div>
  );
}
