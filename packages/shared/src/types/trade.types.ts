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

