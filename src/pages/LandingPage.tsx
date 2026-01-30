import { useNavigate } from 'react-router-dom';
import { Shield, Award, Globe, ChevronRight } from 'lucide-react';

/**
 * Page d'accueil (Landing Page)
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-small">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-800" />
              <span className="text-h4 font-bold text-primary-900">PKI Souverain</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-body text-neutral-700 hover:text-primary-800 transition-fast">
                Fonctionnalités
              </a>
              <a href="#about" className="text-body text-neutral-700 hover:text-primary-800 transition-fast">
                À propos
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-body font-semibold text-primary-800 hover:text-primary-900 transition-fast"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-primary-800 text-white rounded-button hover:bg-primary-700 transition-fast font-semibold"
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Shield className="h-20 w-20 mx-auto text-primary-200" />
          </div>
          
          <h1 className="text-display mb-6">
            Votre Identité Numérique<br />
            Souveraine et Sécurisée
          </h1>
          
          <p className="text-body-large text-primary-100 mb-8 max-w-2xl mx-auto">
            Une plateforme nationale de certification numérique conforme aux standards X.509 internationaux
          </p>
          
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-800 rounded-button hover:bg-primary-50 transition-fast font-semibold text-h5 shadow-medium"
          >
            Commencer Maintenant
            <ChevronRight className="ml-2 h-6 w-6" />
          </button>
          
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <div className="text-h3 font-bold">✓</div>
              <div className="text-body-small mt-2">Sécurité garantie</div>
            </div>
            <div>
              <div className="text-h3 font-bold">✓</div>
              <div className="text-body-small mt-2">Souveraineté</div>
            </div>
            <div>
              <div className="text-h3 font-bold">✓</div>
              <div className="text-body-small mt-2">Confiance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 text-center mb-12 text-neutral-900">
            Une Infrastructure de Confiance Nationale
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral-50 rounded-card p-8 border border-neutral-200 hover:shadow-medium transition-normal">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-primary-800" />
              </div>
              <h3 className="text-h4 mb-4 text-neutral-900">Sécurité de Niveau Bancaire</h3>
              <p className="text-body text-neutral-700">
                Cryptographie RSA 4096 bits et algorithmes de chiffrement certifiés pour une protection maximale de vos données.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-50 rounded-card p-8 border border-neutral-200 hover:shadow-medium transition-normal">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-primary-800" />
              </div>
              <h3 className="text-h4 mb-4 text-neutral-900">Conformité X.509</h3>
              <p className="text-body text-neutral-700">
                Standard international reconnu pour les certificats numériques, garantissant l'interopérabilité mondiale.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-50 rounded-card p-8 border border-neutral-200 hover:shadow-medium transition-normal">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-primary-800" />
              </div>
              <h3 className="text-h4 mb-4 text-neutral-900">Infrastructure Souveraine</h3>
              <p className="text-body text-neutral-700">
                100% nationale, sans dépendance à des autorités étrangères. Vos données restent sous contrôle local.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 mb-6 text-neutral-900">
            Obtenez votre certificat numérique
          </h2>
          <p className="text-body-large text-neutral-700 mb-8">
            Rejoignez les milliers d'utilisateurs qui ont déjà sécurisé leur identité numérique
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-primary-800 text-white rounded-button hover:bg-primary-700 transition-fast font-semibold text-h5"
          >
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-body-small">
              © 2025 PKI Souverain. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-body-small">
              <a href="#" className="hover:text-white transition-fast">Mentions légales</a>
              <a href="#" className="hover:text-white transition-fast">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}