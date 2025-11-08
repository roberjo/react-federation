import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';
import { Button } from '../components/ui/button';
import { TrendingUp, Shield, Zap } from 'lucide-react';

const Login = observer(() => {
  const { authStore } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authStore.isAuthenticated, navigate]);

  const handleLogin = async () => {
    await authStore.login();
    if (authStore.isAuthenticated) {
      navigate('/', { replace: true });
    }
  };

  const isMockMode = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_AUTH === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl shadow-elevated p-8 border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="w-9 h-9 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">FinServe Portal</h1>
            <p className="text-muted-foreground">
              Enterprise platform for financial services
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Trade Planning</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage sophisticated trading strategies
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-light flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Client Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Streamlined KYC and compliance workflows
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Annuity Sales</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive annuity product management
                </p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold shadow-lg"
            size="lg"
          >
            {isMockMode ? 'Continue to Demo' : 'Sign in with Okta'}
          </Button>

          {isMockMode && (
            <p className="text-xs text-center text-muted-foreground mt-4">
              Demo mode - No Okta credentials required
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Secure authentication powered by Okta
        </p>
      </div>
    </div>
  );
});

export default Login;

