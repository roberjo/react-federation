import { observer } from 'mobx-react-lite';
import { DollarSign, Plus, Filter, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '../components/ui/button';

const AnnuitySales = observer(() => {
  const mockSales = [
    { id: 1, product: 'Fixed Annuity Plus', client: 'Sarah Williams', amount: '$125,000', status: 'Closed', date: '2024-01-15' },
    { id: 2, product: 'Variable Growth Plan', client: 'Michael Chen', amount: '$89,500', status: 'In Progress', date: '2024-01-14' },
    { id: 3, product: 'Income Protector', client: 'Lisa Anderson', amount: '$200,000', status: 'Quoted', date: '2024-01-13' },
    { id: 4, product: 'Legacy Builder', client: 'Robert Taylor', amount: '$150,000', status: 'In Progress', date: '2024-01-12' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            Annuity Sales
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage annuity products and sales pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: '$2.4M', icon: DollarSign, color: 'primary', trend: '+23%' },
          { label: 'Active Quotes', value: '34', icon: Target, color: 'warning', trend: '+12%' },
          { label: 'Closed Deals', value: '87', icon: TrendingUp, color: 'success', trend: '+18%' },
          { label: 'Active Clients', value: '156', icon: Users, color: 'primary', trend: '+9%' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-lg border border-border p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${stat.color}`} />
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <span className="text-xs font-medium text-success">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Pipeline */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Sales Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{sale.product}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{sale.client}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{sale.amount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      sale.status === 'Closed' ? 'bg-success-light text-success' :
                      sale.status === 'In Progress' ? 'bg-warning-light text-warning' :
                      'bg-primary-light text-primary'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{sale.date}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

export default AnnuitySales;
