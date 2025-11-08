import type { AuthState } from '@federation/shared/types'

interface VerificationCase {
  id: string
  clientName: string
  riskLevel: 'Low' | 'Medium' | 'High'
  status: 'Pending Review' | 'Awaiting Documents' | 'In Progress' | 'Approved'
  submittedAt: string
  assignedTo: string
  documentsReceived: number
}

const verificationCases: VerificationCase[] = [
  {
    id: 'KYC-1042',
    clientName: 'Acme Capital LLC',
    riskLevel: 'High',
    status: 'Pending Review',
    submittedAt: '2025-11-07T14:20:00.000Z',
    assignedTo: 'S. Patel',
    documentsReceived: 5,
  },
  {
    id: 'KYC-1041',
    clientName: 'Greenleaf Advisors',
    riskLevel: 'Medium',
    status: 'In Progress',
    submittedAt: '2025-11-06T09:15:00.000Z',
    assignedTo: 'M. Johnson',
    documentsReceived: 7,
  },
  {
    id: 'KYC-1039',
    clientName: 'Horizon Wealth Group',
    riskLevel: 'Low',
    status: 'Awaiting Documents',
    submittedAt: '2025-11-05T20:45:00.000Z',
    assignedTo: 'Unassigned',
    documentsReceived: 4,
  },
  {
    id: 'KYC-1037',
    clientName: 'Summit Trust Co.',
    riskLevel: 'High',
    status: 'Approved',
    submittedAt: '2025-11-04T12:10:00.000Z',
    assignedTo: 'D. Morales',
    documentsReceived: 9,
  },
]

const riskColors: Record<VerificationCase['riskLevel'], string> = {
  High: 'bg-danger-50 text-danger-600',
  Medium: 'bg-warning-50 text-warning-600',
  Low: 'bg-success-50 text-success-600',
}

const statusColors: Record<VerificationCase['status'], string> = {
  'Pending Review': 'bg-primary-50 text-primary-600',
  'Awaiting Documents': 'bg-warning-50 text-warning-600',
  'In Progress': 'bg-dark-100 text-dark-700',
  Approved: 'bg-success-50 text-success-600',
}

interface VerificationQueueProps {
  auth?: AuthState
}

export default function VerificationQueue({ auth }: VerificationQueueProps) {
  const totalCases = verificationCases.length
  const pendingHighRisk = verificationCases.filter(
    (item) => item.riskLevel === 'High' && item.status !== 'Approved',
  ).length
  const awaitingDocuments = verificationCases.filter(
    (item) => item.status === 'Awaiting Documents',
  ).length

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Active KYC Cases</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{totalCases}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all risk profiles</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">High Risk Pending</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{pendingHighRisk}</p>
          <p className="mt-1 text-xs text-muted-foreground">Require escalation within 4 hours</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Awaiting Documents</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{awaitingDocuments}</p>
          <p className="mt-1 text-xs text-muted-foreground">Clients contacted daily at 9am</p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-white shadow-card">
        <div className="flex flex-col gap-4 border-b border-border bg-dark-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Verification Queue</h2>
            <p className="text-sm text-muted-foreground">
              Prioritized by risk and dependency status
            </p>
          </div>

          {(auth?.hasGroup?.('compliance-officers') || auth?.hasGroup?.('admins')) && (
            <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Escalate Oldest Case
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-50/80">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Docs</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70 bg-white text-sm text-foreground">
              {verificationCases.map((item) => (
                <tr key={item.id} className="transition hover:bg-dark-50/40">
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{item.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.status === 'Awaiting Documents' ? 'Awaiting compliance upload' : 'Ready for analyst review'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${riskColors[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.assignedTo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.documentsReceived}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(item.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

