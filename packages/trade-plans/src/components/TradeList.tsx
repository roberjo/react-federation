import { useEffect, useState } from 'react'
import type { AuthState, Trade } from '@federation/shared/types'
import axios from 'axios'

interface TradeListProps {
  auth?: AuthState
}

export default function TradeList({ auth }: TradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrades() {
      try {
        setLoading(true)
        const apiClient = axios.create({
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
          headers: {
            'Authorization': auth?.token ? `Bearer ${auth.token}` : undefined,
            'Content-Type': 'application/json'
          }
        })

        const response = await apiClient.get('/trades')
        setTrades(response.data.trades || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trades')
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [auth?.token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading trades...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-danger-50 border border-danger-200 rounded-lg">
        <p className="text-danger-700">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-dark-900">Trades</h2>
        {(auth?.hasGroup?.('traders') || auth?.hasGroup?.('admins')) && (
          <a
            href="/trade-plans/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Create Trade
          </a>
        )}
      </div>

      {trades.length === 0 ? (
        <div className="p-6 bg-white rounded-lg shadow-card text-center">
          <p className="text-dark-600">No trades found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-dark-200">
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">
                    {trade.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                    {trade.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trade.status === 'executed' 
                        ? 'bg-success-50 text-success-600' 
                        : trade.status === 'pending'
                        ? 'bg-warning-50 text-warning-600'
                        : 'bg-danger-50 text-danger-600'
                    }`}>
                      {trade.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

