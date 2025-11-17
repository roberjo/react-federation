import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { AuthState, CreateTradePlanRequest, Security, TradeFrequency } from '@federation/shared/types'
import TradePlanStore from '../stores/TradePlanStore'

interface TradePlanFormProps {
  auth?: AuthState
  store: TradePlanStore
}

const frequencyOptions: { value: TradeFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
]

const commonSecurities: Security[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', assetType: 'etf' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetType: 'etf' },
  { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', assetType: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', assetType: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', assetType: 'stock' }
]

function TradePlanForm({ auth: _auth, store }: TradePlanFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [formData, setFormData] = useState<CreateTradePlanRequest>({
    clientId: '',
    clientName: '',
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    frequency: 'monthly',
    tradeAmount: 0,
    totalAmount: undefined,
    securities: [],
    allocations: {},
    autoExecute: true,
    minTradeAmount: undefined,
    maxTradeAmount: undefined
  })

  const [selectedSecurities, setSelectedSecurities] = useState<Security[]>([])
  const [allocationValues, setAllocationValues] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEdit && id) {
      store.fetchTradePlanById(id).then((plan) => {
        if (plan) {
          setFormData({
            clientId: plan.clientId,
            clientName: plan.clientName,
            name: plan.name,
            description: plan.description || '',
            startDate: plan.startDate.split('T')[0],
            endDate: plan.endDate?.split('T')[0] || '',
            frequency: plan.frequency,
            tradeAmount: plan.tradeAmount,
            totalAmount: plan.totalAmount,
            securities: plan.securities,
            allocations: plan.allocations,
            autoExecute: plan.autoExecute ?? true,
            minTradeAmount: plan.minTradeAmount,
            maxTradeAmount: plan.maxTradeAmount
          })
          setSelectedSecurities(plan.securities)
          setAllocationValues(plan.allocations)
        }
      })
    }
  }, [id, isEdit, store])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required'
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    if (formData.tradeAmount <= 0) {
      newErrors.tradeAmount = 'Trade amount must be greater than 0'
    }
    if (selectedSecurities.length === 0) {
      newErrors.securities = 'At least one security is required'
    }
    if (selectedSecurities.length > 0) {
      const totalAllocation = Object.values(allocationValues).reduce((sum, val) => sum + val, 0)
      if (Math.abs(totalAllocation - 100) > 0.01) {
        newErrors.allocations = `Total allocation must equal 100% (currently ${totalAllocation.toFixed(2)}%)`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSecurityToggle = (security: Security) => {
    if (selectedSecurities.find(s => s.symbol === security.symbol)) {
      const updated = selectedSecurities.filter(s => s.symbol !== security.symbol)
      setSelectedSecurities(updated)
      const updatedAllocations = { ...allocationValues }
      delete updatedAllocations[security.symbol]
      setAllocationValues(updatedAllocations)
    } else {
      setSelectedSecurities([...selectedSecurities, security])
      // Auto-allocate equally
      const equalAllocation = 100 / (selectedSecurities.length + 1)
      const updatedAllocations: Record<string, number> = {}
      selectedSecurities.forEach(s => {
        updatedAllocations[s.symbol] = equalAllocation
      })
      updatedAllocations[security.symbol] = equalAllocation
      setAllocationValues(updatedAllocations)
    }
  }

  const handleAllocationChange = (symbol: string, value: number) => {
    setAllocationValues({
      ...allocationValues,
      [symbol]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData: CreateTradePlanRequest = {
        ...formData,
        securities: selectedSecurities,
        allocations: allocationValues
      }

      if (isEdit && id) {
        await store.updateTradePlan({ ...submitData, id })
      } else {
        await store.createTradePlan(submitData)
      }

      navigate('..')
    } catch (error: any) {
      alert(error.message || 'Failed to save trade plan')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-dark-900">
          {isEdit ? 'Edit Trade Plan' : 'Create Trade Plan'}
        </h2>
        <p className="text-dark-600 mt-1">
          {isEdit ? 'Update your dollar cost averaging plan' : 'Set up a new automated investment plan'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 border-b pb-2">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.name ? 'border-danger-500' : 'border-dark-300'
                }`}
                placeholder="e.g., Retirement DCA Plan"
              />
              {errors.name && <p className="text-danger-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Client ID *
              </label>
              <input
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.clientId ? 'border-danger-500' : 'border-dark-300'
                }`}
                placeholder="e.g., CLIENT-001"
              />
              {errors.clientId && <p className="text-danger-600 text-sm mt-1">{errors.clientId}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.clientName ? 'border-danger-500' : 'border-dark-300'
              }`}
              placeholder="e.g., John Doe"
            />
            {errors.clientName && <p className="text-danger-600 text-sm mt-1">{errors.clientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-dark-300 rounded-lg"
              rows={3}
              placeholder="Optional description of the trade plan"
            />
          </div>
        </div>

        {/* Term and Frequency */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 border-b pb-2">Term & Frequency</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.startDate ? 'border-danger-500' : 'border-dark-300'
                }`}
              />
              {errors.startDate && <p className="text-danger-600 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.endDate ? 'border-danger-500' : 'border-dark-300'
                }`}
              />
              {errors.endDate && <p className="text-danger-600 text-sm mt-1">{errors.endDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as TradeFrequency })}
                className="w-full px-3 py-2 border border-dark-300 rounded-lg"
              >
                {frequencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trade Amount */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 border-b pb-2">Trade Amount</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Amount Per Trade ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.tradeAmount || ''}
                onChange={(e) => setFormData({ ...formData, tradeAmount: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.tradeAmount ? 'border-danger-500' : 'border-dark-300'
                }`}
                placeholder="1000.00"
              />
              {errors.tradeAmount && <p className="text-danger-600 text-sm mt-1">{errors.tradeAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">
                Total Planned Amount ($) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.totalAmount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalAmount: e.target.value ? parseFloat(e.target.value) : undefined
                  })
                }
                className="w-full px-3 py-2 border border-dark-300 rounded-lg"
                placeholder="10000.00"
              />
            </div>
          </div>
        </div>

        {/* Securities Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 border-b pb-2">Securities</h3>

          {errors.securities && (
            <p className="text-danger-600 text-sm">{errors.securities}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {commonSecurities.map((security) => {
              const isSelected = selectedSecurities.find(s => s.symbol === security.symbol)
              return (
                <button
                  key={security.symbol}
                  type="button"
                  onClick={() => handleSecurityToggle(security)}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-dark-300 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium text-dark-900">{security.symbol}</div>
                  <div className="text-xs text-dark-600">{security.name}</div>
                </button>
              )
            })}
          </div>

          {/* Allocation */}
          {selectedSecurities.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-dark-700">
                Allocation (%) - Must total 100%
              </label>
              {selectedSecurities.map((security) => (
                <div key={security.symbol} className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-dark-700">{security.symbol}</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={allocationValues[security.symbol] || 0}
                    onChange={(e) =>
                      handleAllocationChange(security.symbol, parseFloat(e.target.value) || 0)
                    }
                    className="flex-1 px-3 py-2 border border-dark-300 rounded-lg"
                  />
                  <div className="w-12 text-sm text-dark-600">%</div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-dark-700">Total:</span>
                <span
                  className={`text-sm font-bold ${
                    Math.abs(Object.values(allocationValues).reduce((sum, val) => sum + val, 0) - 100) < 0.01
                      ? 'text-success-600'
                      : 'text-danger-600'
                  }`}
                >
                  {Object.values(allocationValues).reduce((sum, val) => sum + val, 0).toFixed(2)}%
                </span>
              </div>
              {errors.allocations && (
                <p className="text-danger-600 text-sm">{errors.allocations}</p>
              )}
            </div>
          )}
        </div>

        {/* Execution Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-dark-900 border-b pb-2">Execution Settings</h3>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoExecute"
              checked={formData.autoExecute}
              onChange={(e) => setFormData({ ...formData, autoExecute: e.target.checked })}
              className="w-4 h-4 text-primary-500 border-dark-300 rounded"
            />
            <label htmlFor="autoExecute" className="text-sm text-dark-700">
              Automatically execute trades on schedule
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('..')}
            className="px-4 py-2 border border-dark-300 text-dark-700 rounded-lg hover:bg-dark-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={store.isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {store.isLoading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TradePlanForm

