import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';

const Unauthorized = observer(() => {
  const { authStore } = useStores();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive-light flex items-center justify-center">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-2">
          You don't have permission to access this resource.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Your current groups: {authStore.groups.join(', ') || 'None'}
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default Unauthorized;
