import { observer } from 'mobx-react-lite';
import { TrendingUp, Plus, Filter, Download } from 'lucide-react';
import { Button } from '../components/ui/button';

const TradePlans = observer(() => {
  const mockTrades = [
    { id: 1, name: 'Bull Call Spread - AAPL', status: 'Active', profit: '+$2,340', date: '2024-01-15' },
    { id: 2, name: 'Iron Condor - SPY', status: 'Pending', profit: '+$1,200', date: '2024-01-14' },
    { id: 3, name: 'Covered Call - MSFT', status: 'Active', profit: '+$890', date: '2024-01-13' },
    { id: 4, name: 'Protective Put - TSLA', status: 'Closed', profit: '-$450', date: '2024-01-12' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            Trade Plans
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your trading strategies
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Trade Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades', value: '127', color: 'primary' },
          { label: 'Active', value: '43', color: 'success' },
          { label: 'Pending', value: '12', color: 'warning' },
          { label: 'Total P&L', value: '+$23.4K', color: 'primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Trade List */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Trades</h2>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Trade Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Profit/Loss
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
              {mockTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{trade.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      trade.status === 'Active' ? 'bg-success-light text-success' :
                      trade.status === 'Pending' ? 'bg-warning-light text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      trade.profit.startsWith('+') ? 'text-success' : 'text-destructive'
                    }`}>
                      {trade.profit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{trade.date}</td>
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

export default TradePlans;
