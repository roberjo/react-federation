import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, DollarSign, TrendingUp, CheckCircle, XCircle, Pause, Play } from 'lucide-react'
import type { AuthState } from '@federation/shared/types'
import TradePlanStore from '../stores/TradePlanStore'

interface TradePlanDetailProps {
  auth?: AuthState
  store: TradePlanStore
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly'
}

const statusColors: Record<string, string> = {
  active: 'bg-success-50 text-success-700 border-success-200',
  paused: 'bg-warning-50 text-warning-700 border-warning-200',
  completed: 'bg-info-50 text-info-700 border-info-200',
  cancelled: 'bg-danger-50 text-danger-700 border-danger-200'
}

// Use useState to force re-render when store changes (instead of observer)
// mobx-react-lite's observer causes React null errors in Module Federation
function TradePlanDetail({ auth, store }: TradePlanDetailProps) {
  const [, forceUpdate] = useState({})
  
  // Subscribe to store changes manually using MobX reaction
  // mobx-react-lite's observer causes React null errors in Module Federation
  useEffect(() => {
    let disposer: (() => void) | null = null
    let interval: NodeJS.Timeout | null = null
    
    // Import reaction dynamically to avoid React null issues
    import('mobx').then((mobx) => {
      disposer = mobx.reaction(
        () => ({
          selectedTradePlan: store.selectedTradePlan,
          isLoading: store.isLoading,
          error: store.error
        }),
        () => {
          forceUpdate({})
        }
      )
    }).catch(() => {
      // Fallback: poll for changes if reaction fails
      interval = setInterval(() => {
        forceUpdate({})
      }, 100)
    })
    
    return () => {
      if (disposer) disposer()
      if (interval) clearInterval(interval)
    }
  }, [store])
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    // Don't fetch if id is invalid (e.g., "trade-plans" from route mismatch)
    if (id && id !== 'trade-plans' && id !== 'create' && auth?.token) {
      store.setAuthToken(auth.token)
      store.fetchTradePlanById(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, auth?.token]) // Only depend on id and auth.token, not store (store is stable)

  const plan = store.selectedTradePlan

  if (store.isLoading && !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-dark-600">Loading trade plan...</div>
      </div>
    )
  }

  if (store.error && !plan) {
    return (
      <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
        <p className="text-danger-700">Error: {store.error}</p>
        <Link
          to=".."
          className="mt-4 inline-block px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600"
        >
          Back to Plans
        </Link>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-6 bg-warning-50 border border-warning-200 rounded-lg">
        <p className="text-warning-700">Trade plan not found</p>
        <Link
          to=".."
          className="mt-4 inline-block px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Back to Plans
        </Link>
      </div>
    )
  }

  const totalAllocation = Object.values(plan.allocations).reduce((sum, val) => sum + val, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-semibold text-dark-900">{plan.name}</h2>
            <span
              className={`px-3 py-1 text-sm font-medium rounded border ${
                statusColors[plan.status] || statusColors.active
              }`}
            >
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </span>
          </div>
          {plan.description && (
            <p className="text-dark-600">{plan.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {(auth?.hasRole?.('trader') || auth?.hasRole?.('admin')) && (
            <>
              <Link
                to={`${plan.id}/edit`}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Edit Plan
              </Link>
              {plan.status === 'active' && (
                <button
                  onClick={async () => {
                    if (confirm('Pause this trade plan?')) {
                      await store.pauseTradePlan(plan.id)
                      await store.fetchTradePlanById(plan.id!)
                    }
                  }}
                  className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              {plan.status === 'paused' && (
                <button
                  onClick={async () => {
                    await store.resumeTradePlan(plan.id)
                    await store.fetchTradePlanById(plan.id!)
                  }}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}
            </>
          )}
          <Link
            to=".."
            className="px-4 py-2 border border-dark-300 text-dark-700 rounded-lg hover:bg-dark-50"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center gap-2 text-dark-600 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm">Trade Amount</span>
          </div>
          <div className="text-2xl font-bold text-dark-900">
            ${plan.tradeAmount.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center gap-2 text-dark-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Frequency</span>
          </div>
          <div className="text-2xl font-bold text-dark-900">
            {frequencyLabels[plan.frequency]}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center gap-2 text-dark-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Trades Executed</span>
          </div>
          <div className="text-2xl font-bold text-dark-900">
            {plan.totalTradesExecuted || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center gap-2 text-dark-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Total Invested</span>
          </div>
          <div className="text-2xl font-bold text-dark-900">
            ${(plan.totalAmountInvested || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Client Information</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-dark-600">Client Name</div>
              <div className="text-base font-medium text-dark-900">{plan.clientName}</div>
            </div>
            <div>
              <div className="text-sm text-dark-600">Client ID</div>
              <div className="text-base font-medium text-dark-900">{plan.clientId}</div>
            </div>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Schedule</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-dark-600">Start Date</div>
              <div className="text-base font-medium text-dark-900">
                {new Date(plan.startDate).toLocaleDateString()}
              </div>
            </div>
            {plan.endDate && (
              <div>
                <div className="text-sm text-dark-600">End Date</div>
                <div className="text-base font-medium text-dark-900">
                  {new Date(plan.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {plan.nextTradeDate && (
              <div>
                <div className="text-sm text-dark-600">Next Trade Date</div>
                <div className="text-base font-medium text-primary-600">
                  {new Date(plan.nextTradeDate).toLocaleDateString()}
                </div>
              </div>
            )}
            {plan.lastTradeDate && (
              <div>
                <div className="text-sm text-dark-600">Last Trade Date</div>
                <div className="text-base font-medium text-dark-900">
                  {new Date(plan.lastTradeDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Securities and Allocations */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Securities & Allocation</h3>
        <div className="space-y-4">
          {plan.securities.map((security) => {
            const allocation = plan.allocations[security.symbol] || 0
            const amount = (plan.tradeAmount * allocation) / 100
            return (
              <div key={security.symbol} className="border border-dark-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-dark-900">{security.symbol}</div>
                    <div className="text-sm text-dark-600">{security.name}</div>
                    {security.assetType && (
                      <div className="text-xs text-dark-500 mt-1">
                        {security.assetType.charAt(0).toUpperCase() + security.assetType.slice(1)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-dark-900">{allocation.toFixed(2)}%</div>
                    <div className="text-sm text-dark-600">${amount.toFixed(2)} per trade</div>
                  </div>
                </div>
                <div className="w-full bg-dark-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${allocation}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="pt-2 border-t flex justify-between items-center">
            <span className="text-sm font-medium text-dark-700">Total Allocation:</span>
            <span
              className={`text-sm font-bold ${
                Math.abs(totalAllocation - 100) < 0.01 ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {totalAllocation.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Execution Settings */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Execution Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {plan.autoExecute ? (
              <CheckCircle className="w-5 h-5 text-success-600" />
            ) : (
              <XCircle className="w-5 h-5 text-dark-400" />
            )}
            <span className="text-dark-700">
              Auto-execute trades: {plan.autoExecute ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {plan.minTradeAmount && (
            <div className="text-sm text-dark-600">
              Minimum trade amount: ${plan.minTradeAmount.toLocaleString()}
            </div>
          )}
          {plan.maxTradeAmount && (
            <div className="text-sm text-dark-600">
              Maximum trade amount: ${plan.maxTradeAmount.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Plan Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-dark-600">Created</div>
            <div className="text-dark-900 font-medium">
              {new Date(plan.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-dark-600">Last Updated</div>
            <div className="text-dark-900 font-medium">
              {new Date(plan.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-dark-600">Created By</div>
            <div className="text-dark-900 font-medium">{plan.createdBy}</div>
          </div>
          <div>
            <div className="text-dark-600">Plan ID</div>
            <div className="text-dark-900 font-medium font-mono text-xs">{plan.id}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradePlanDetail

