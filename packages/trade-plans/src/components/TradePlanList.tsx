import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, TrendingUp, Pause, Play, X, Edit, Trash2 } from 'lucide-react'
import type { AuthState, TradePlan, TradeFrequency } from '@federation/shared/types'
import TradePlanStore from '../stores/TradePlanStore'

interface TradePlanListProps {
  auth?: AuthState
  store: TradePlanStore
}

const frequencyLabels: Record<TradeFrequency, string> = {
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
function TradePlanList({ auth, store }: TradePlanListProps) {
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
          tradePlans: store.tradePlans,
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
  useEffect(() => {
    if (auth?.token) {
      store.setAuthToken(auth.token)
    }
    store.fetchTradePlans().catch((error) => {
      console.error('[TradePlanList] Error fetching trade plans:', error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]) // Only depend on auth.token, not store (store is stable)

  const handlePause = async (plan: TradePlan) => {
    if (confirm(`Pause trade plan "${plan.name}"?`)) {
      try {
        await store.pauseTradePlan(plan.id)
        await store.fetchTradePlans()
      } catch (error) {
        alert('Failed to pause trade plan')
      }
    }
  }

  const handleResume = async (plan: TradePlan) => {
    try {
      await store.resumeTradePlan(plan.id)
      await store.fetchTradePlans()
    } catch (error) {
      alert('Failed to resume trade plan')
    }
  }

  const handleCancel = async (plan: TradePlan) => {
    if (confirm(`Cancel trade plan "${plan.name}"? This action cannot be undone.`)) {
      try {
        await store.cancelTradePlan(plan.id)
        await store.fetchTradePlans()
      } catch (error) {
        alert('Failed to cancel trade plan')
      }
    }
  }

  const handleDelete = async (plan: TradePlan) => {
    if (confirm(`Delete trade plan "${plan.name}"? This action cannot be undone.`)) {
      try {
        await store.deleteTradePlan(plan.id)
      } catch (error) {
        alert('Failed to delete trade plan')
      }
    }
  }

  if (store.isLoading && store.tradePlans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-dark-600">Loading trade plans...</div>
      </div>
    )
  }

  if (store.error && store.tradePlans.length === 0) {
    return (
      <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
        <p className="text-danger-700">Error: {store.error}</p>
        <button
          onClick={() => store.fetchTradePlans()}
          className="mt-4 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-dark-900">Dollar Cost Averaging Plans</h2>
          <p className="text-dark-600 mt-1">Manage automated investment plans for clients</p>
        </div>
        {(auth?.hasRole?.('trader') || auth?.hasRole?.('admin')) && (
            <Link
              to="create"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Create Trade Plan
            </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-dark-600">Total Plans</div>
          <div className="text-2xl font-bold text-dark-900 mt-1">{store.tradePlans.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-dark-600">Active Plans</div>
          <div className="text-2xl font-bold text-success-600 mt-1">
            {store.tradePlans.filter(p => p.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-dark-600">Total Invested</div>
          <div className="text-2xl font-bold text-dark-900 mt-1">
            ${store.tradePlans.reduce((sum, p) => sum + (p.totalAmountInvested || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="text-sm text-dark-600">Pending Plans</div>
          <div className="text-2xl font-bold text-warning-600 mt-1">
            {store.tradePlans.filter(p => p.status === 'paused').length}
          </div>
        </div>
      </div>

      {/* Trade Plans Table */}
      {store.tradePlans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-12 text-center">
          <TrendingUp className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-900 mb-2">No Trade Plans</h3>
          <p className="text-dark-600 mb-6">Get started by creating your first dollar cost averaging plan</p>
          {store.error && (
            <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-700 text-sm">Error: {store.error}</p>
            </div>
          )}
          {(auth?.hasRole?.('trader') || auth?.hasRole?.('admin')) && (
            <Link
              to="create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <TrendingUp className="w-4 h-4" />
              Create Trade Plan
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Plan Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Securities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Next Trade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {store.tradePlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-dark-50">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`${plan.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {plan.name}
                        </Link>
                        {plan.description && (
                          <p className="text-xs text-dark-500 mt-1">{plan.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-dark-900">{plan.clientName}</div>
                      <div className="text-xs text-dark-500">{plan.clientId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {plan.securities.slice(0, 3).map((security) => (
                          <span
                            key={security.symbol}
                            className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                          >
                            {security.symbol}
                          </span>
                        ))}
                        {plan.securities.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-dark-100 text-dark-600 rounded">
                            +{plan.securities.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-900">
                        ${plan.tradeAmount.toLocaleString()}
                      </div>
                      {plan.totalAmountInvested && (
                        <div className="text-xs text-dark-500">
                          ${plan.totalAmountInvested.toLocaleString()} invested
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-dark-600">
                        <Calendar className="w-4 h-4" />
                        {frequencyLabels[plan.frequency]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          statusColors[plan.status] || statusColors.active
                        }`}
                      >
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {plan.nextTradeDate
                        ? new Date(plan.nextTradeDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/trade-plans/${plan.id}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Details"
                        >
                          View
                        </Link>
                        {(auth?.hasRole?.('trader') || auth?.hasRole?.('admin')) && (
                          <>
                        <Link
                          to={`${plan.id}/edit`}
                          className="text-info-600 hover:text-info-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                            {plan.status === 'active' && (
                              <button
                                onClick={() => handlePause(plan)}
                                className="text-warning-600 hover:text-warning-700"
                                title="Pause"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            {plan.status === 'paused' && (
                              <button
                                onClick={() => handleResume(plan)}
                                className="text-success-600 hover:text-success-700"
                                title="Resume"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {plan.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancel(plan)}
                                className="text-danger-600 hover:text-danger-700"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(plan)}
                              className="text-danger-600 hover:text-danger-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TradePlanList

