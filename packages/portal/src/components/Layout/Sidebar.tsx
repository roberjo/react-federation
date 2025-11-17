import { observer } from 'mobx-react-lite';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, UserCheck, DollarSign, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStores } from '../../hooks/useStores';
import { useState } from 'react';
import { MODULE_ACCESS } from '../../config/oktaConfig';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  requiredGroups?: ReadonlyArray<string>; // Legacy group-based access
  requiredRoles?: ReadonlyArray<string>; // Primary RBAC based on JWT roles
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    // No role requirement - accessible to all authenticated users
  },
  {
    name: 'Trade Plans',
    path: '/trade-plans',
    icon: TrendingUp,
    requiredRoles: MODULE_ACCESS.tradePlans, // RBAC based on JWT roles
  },
  {
    name: 'Client Verification',
    path: '/client-verification',
    icon: UserCheck,
    requiredRoles: MODULE_ACCESS.clientVerification, // RBAC based on JWT roles
  },
  {
    name: 'Annuity Sales',
    path: '/annuity-sales',
    icon: DollarSign,
    requiredRoles: MODULE_ACCESS.annuitySales, // RBAC based on JWT roles
  },
];

export const Sidebar = observer(() => {
  const { authStore } = useStores();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Filter nav items based on RBAC roles from JWT claims
  // Only show modules the user has required roles for
  const visibleNavItems = navItems.filter(item => {
    // If no role requirements, show to all authenticated users
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true
    }
    // Check if user has any of the required roles from JWT claims
    return authStore.hasAnyRole(item.requiredRoles)
  });

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground text-lg">FinServe Portal</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-sidebar-active text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'
                    }`}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
            {authStore.userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {authStore.userName}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {authStore.userEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

