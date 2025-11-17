/**
 * Trade Plans module types
 */

export interface Trade {
  id: string
  symbol: string
  quantity: number
  price: number
  timestamp: string
  status?: 'pending' | 'executed' | 'cancelled'
}

export interface TradeListResponse {
  trades: Trade[]
  total: number
  page: number
  pageSize: number
}

export interface CreateTradeRequest {
  symbol: string
  quantity: number
  price: number
}

/**
 * Dollar Cost Averaging (DCA) Trade Plan Types
 */

export type TradeFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
export type TradePlanStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export interface Security {
  symbol: string
  name: string
  exchange?: string
  assetType?: 'stock' | 'etf' | 'mutual-fund' | 'bond'
}

export interface TradePlan {
  id: string
  clientId: string
  clientName: string
  name: string
  description?: string
  
  // Term and frequency
  startDate: string // ISO date string
  endDate?: string // ISO date string (optional for open-ended plans)
  frequency: TradeFrequency
  
  // Trade amount
  tradeAmount: number // Dollar amount per trade
  totalAmount?: number // Total planned amount (optional)
  
  // Securities
  securities: Security[] // Multiple securities for diversification
  
  // Allocation (percentage per security, must sum to 100)
  allocations: Record<string, number> // Map of symbol -> percentage
  
  // Status and metadata
  status: TradePlanStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  lastTradeDate?: string
  nextTradeDate?: string
  totalTradesExecuted?: number
  totalAmountInvested?: number
  
  // Execution settings
  autoExecute?: boolean
  minTradeAmount?: number
  maxTradeAmount?: number
}

export interface CreateTradePlanRequest {
  clientId: string
  clientName: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  frequency: TradeFrequency
  tradeAmount: number
  totalAmount?: number
  securities: Security[]
  allocations: Record<string, number>
  autoExecute?: boolean
  minTradeAmount?: number
  maxTradeAmount?: number
}

export interface UpdateTradePlanRequest extends Partial<CreateTradePlanRequest> {
  id: string
  status?: TradePlanStatus
}

export interface TradePlanListResponse {
  tradePlans: TradePlan[]
  total: number
  page: number
  pageSize: number
}

export interface TradePlanExecution {
  id: string
  tradePlanId: string
  executionDate: string
  amount: number
  securities: Array<{
    symbol: string
    amount: number
    shares?: number
    price?: number
  }>
  status: 'pending' | 'executed' | 'failed'
  errorMessage?: string
}

