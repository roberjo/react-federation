import { observer } from 'mobx-react-lite';
import { UserCheck, Plus, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const ClientVerification = observer(() => {
  const mockVerifications = [
    { id: 1, client: 'John Smith', type: 'KYC', status: 'Pending', date: '2024-01-15', risk: 'Low' },
    { id: 2, client: 'Jane Doe', type: 'AML', status: 'Approved', date: '2024-01-14', risk: 'Low' },
    { id: 3, client: 'Acme Corp', type: 'Business Verification', status: 'Pending', date: '2024-01-13', risk: 'Medium' },
    { id: 4, client: 'Bob Johnson', type: 'Identity Check', status: 'Rejected', date: '2024-01-12', risk: 'High' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-success" />
            </div>
            Client Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage KYC, AML, and compliance verifications
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New Verification
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Verifications', value: '234', icon: UserCheck, color: 'primary' },
          { label: 'Pending', value: '43', icon: Clock, color: 'warning' },
          { label: 'Approved', value: '178', icon: CheckCircle, color: 'success' },
          { label: 'Rejected', value: '13', icon: XCircle, color: 'destructive' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card rounded-lg border border-border p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Verification Queue */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Verification Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Verification Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk Level
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
              {mockVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{verification.client}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{verification.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      verification.status === 'Approved' ? 'bg-success-light text-success' :
                      verification.status === 'Pending' ? 'bg-warning-light text-warning' :
                      'bg-destructive-light text-destructive'
                    }`}>
                      {verification.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      verification.risk === 'Low' ? 'bg-success-light text-success' :
                      verification.risk === 'Medium' ? 'bg-warning-light text-warning' :
                      'bg-destructive-light text-destructive'
                    }`}>
                      {verification.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{verification.date}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Review</Button>
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

export default ClientVerification;
