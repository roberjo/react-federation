import { observer } from 'mobx-react-lite';
import { useStores } from '../hooks/useStores';
import { TrendingUp, UserCheck, DollarSign, Users, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULE_ACCESS } from '../config/oktaConfig';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
}

const stats: StatCard[] = [
  { title: 'Active Trades', value: '127', change: '+12%', icon: TrendingUp, trend: 'up' },
  { title: 'Pending Verifications', value: '43', change: '-8%', icon: UserCheck, trend: 'down' },
  { title: 'Annuity Sales', value: '$2.4M', change: '+23%', icon: DollarSign, trend: 'up' },
  { title: 'Active Clients', value: '1,834', change: '+5%', icon: Users, trend: 'up' },
];

const Dashboard = observer(() => {
  const { authStore } = useStores();

  const modules = [
    {
      name: 'Trade Plans',
      description: 'Create and manage trading strategies and plans',
      icon: TrendingUp,
      path: '/trade-plans',
      color: 'primary',
      requiredGroups: MODULE_ACCESS.tradePlans,
    },
    {
      name: 'Client Verification',
      description: 'Verify client identities and compliance documentation',
      icon: UserCheck,
      path: '/client-verification',
      color: 'success',
      requiredGroups: MODULE_ACCESS.clientVerification,
    },
    {
      name: 'Annuity Sales',
      description: 'Manage annuity products, quotes, and sales pipeline',
      icon: DollarSign,
      path: '/annuity-sales',
      color: 'warning',
      requiredGroups: MODULE_ACCESS.annuitySales,
    },
  ];

  const accessibleModules = modules.filter(module =>
    authStore.hasAnyGroup(module.requiredGroups)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {authStore.userName}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-elevated transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.path}
                to={module.path}
                className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-elevated transition-all interactive-lift group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${module.color}-light flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${module.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
          <button className="text-sm text-primary hover:text-primary-hover font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Trade plan created', module: 'Trade Plans', time: '2 hours ago' },
            { action: 'Client verified', module: 'Verification', time: '4 hours ago' },
            { action: 'Quote generated', module: 'Annuity Sales', time: '5 hours ago' },
            { action: 'Report generated', module: 'Analytics', time: '1 day ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.module}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Dashboard;

