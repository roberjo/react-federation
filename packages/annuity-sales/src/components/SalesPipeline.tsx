import type { AuthState } from '@federation/shared/types'

interface AnnuityOpportunity {
  id: string
  client: string
  product: string
  annualPremium: number
  stage: 'Discovery' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost'
  probability: number
  owner: string
  updatedAt: string
}

const opportunities: AnnuityOpportunity[] = [
  {
    id: 'AN-3421',
    client: 'Evergreen Retirement Fund',
    product: 'Fixed Indexed Annuity',
    annualPremium: 1200000,
    stage: 'Negotiation',
    probability: 0.7,
    owner: 'J. Ramirez',
    updatedAt: '2025-11-07T11:30:00.000Z',
  },
  {
    id: 'AN-3418',
    client: 'Horizon Benefit Advisors',
    product: 'Immediate Annuity',
    annualPremium: 890000,
    stage: 'Proposal Sent',
    probability: 0.5,
    owner: 'C. Chen',
    updatedAt: '2025-11-06T16:05:00.000Z',
  },
  {
    id: 'AN-3416',
    client: 'Summit Wealth Partners',
    product: 'Deferred Income Annuity',
    annualPremium: 1560000,
    stage: 'Discovery',
    probability: 0.3,
    owner: 'L. Carter',
    updatedAt: '2025-11-05T09:40:00.000Z',
  },
  {
    id: 'AN-3409',
    client: 'Beacon Family Offices',
    product: 'Variable Annuity',
    annualPremium: 2100000,
    stage: 'Won',
    probability: 1,
    owner: 'J. Ramirez',
    updatedAt: '2025-11-02T14:20:00.000Z',
  },
]

const stageColors: Record<AnnuityOpportunity['stage'], string> = {
  Discovery: 'bg-muted text-muted-foreground',
  'Proposal Sent': 'bg-primary-50 text-primary-600',
  Negotiation: 'bg-warning-light text-warning-foreground',
  Won: 'bg-success-50 text-success-600',
  Lost: 'bg-danger-50 text-danger-600',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

interface SalesPipelineProps {
  auth?: AuthState
}

export default function SalesPipeline({ auth }: SalesPipelineProps) {
  const pipelineValue = opportunities.reduce(
    (total, opp) => total + opp.annualPremium * opp.probability,
    0,
  )
  const wonValue = opportunities
    .filter((opp) => opp.stage === 'Won')
    .reduce((total, opp) => total + opp.annualPremium, 0)
  const avgProbability =
    opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length

  const canCreateQuote = auth?.hasGroup?.('sales-agents') || auth?.hasGroup?.('admins')

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{formatCurrency(pipelineValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Probability adjusted across open deals</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Closed YTD</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{formatCurrency(wonValue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recognized premium booked this quarter</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Average Win Probability</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{Math.round(avgProbability * 100)}%</p>
          <p className="mt-1 text-xs text-muted-foreground">Across {opportunities.length} active opportunities</p>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-white shadow-card">
        <div className="flex flex-col gap-4 border-b border-border bg-dark-50/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Annuity Sales Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Track premium potential, sales stage, and owner accountability.
            </p>
          </div>

          {canCreateQuote && (
            <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Create New Quote
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-dark-50/80 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Opportunity</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Annual Premium</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Probability</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70 bg-white text-sm text-foreground">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="transition hover:bg-dark-50/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{opp.client}</div>
                    <div className="text-xs text-muted-foreground">{opp.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{opp.product}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(opp.annualPremium)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${stageColors[opp.stage]}`}>
                      {opp.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="font-medium text-foreground">{Math.round(opp.probability * 100)}%</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.round(opp.probability * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{opp.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(opp.updatedAt).toLocaleString()}
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

