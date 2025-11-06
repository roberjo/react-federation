/**
 * Annuity Sales module types
 */

export interface Product {
  id: string
  name: string
  rate: number
  minAmount: number
  description?: string
}

export interface Quote {
  id: string
  productId: string
  amount: number
  quoteAmount: number
  createdAt: string
}

export interface ProductListResponse {
  products: Product[]
}

