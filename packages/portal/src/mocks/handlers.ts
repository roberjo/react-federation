import { http, HttpResponse } from 'msw'
import type { TradePlan, Security } from '@federation/shared/types'

// Mock data
const mockTrades = [
  { id: '1', symbol: 'AAPL', quantity: 100, price: 150.0, timestamp: new Date().toISOString(), status: 'executed' as const },
  { id: '2', symbol: 'GOOGL', quantity: 50, price: 2500.0, timestamp: new Date().toISOString(), status: 'executed' as const },
  { id: '3', symbol: 'MSFT', quantity: 75, price: 350.0, timestamp: new Date().toISOString(), status: 'pending' as const },
]

// Mock Trade Plans (DCA Plans)
const mockTradePlans: TradePlan[] = [
  {
    id: 'tp-001',
    clientId: 'CLIENT-001',
    clientName: 'John Doe',
    name: 'Retirement DCA Plan',
    description: 'Monthly dollar cost averaging for retirement portfolio',
    startDate: new Date('2024-01-01').toISOString(),
    endDate: new Date('2025-12-31').toISOString(),
    frequency: 'monthly',
    tradeAmount: 2000,
    totalAmount: 48000,
    securities: [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', assetType: 'etf' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetType: 'etf' }
    ],
    allocations: { SPY: 40, QQQ: 30, VTI: 30 },
    status: 'active',
    createdAt: new Date('2023-12-15').toISOString(),
    updatedAt: new Date('2024-11-01').toISOString(),
    createdBy: 'trader@example.com',
    lastTradeDate: new Date('2024-11-01').toISOString(),
    nextTradeDate: new Date('2024-12-01').toISOString(),
    totalTradesExecuted: 11,
    totalAmountInvested: 22000,
    autoExecute: true
  },
  {
    id: 'tp-002',
    clientId: 'CLIENT-002',
    clientName: 'Jane Smith',
    name: 'Tech Growth Plan',
    description: 'Weekly investment in tech stocks',
    startDate: new Date('2024-06-01').toISOString(),
    frequency: 'weekly',
    tradeAmount: 500,
    securities: [
      { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', assetType: 'stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: 'stock' }
    ],
    allocations: { AAPL: 50, MSFT: 30, GOOGL: 20 },
    status: 'active',
    createdAt: new Date('2024-05-20').toISOString(),
    updatedAt: new Date('2024-11-05').toISOString(),
    createdBy: 'trader@example.com',
    lastTradeDate: new Date('2024-11-05').toISOString(),
    nextTradeDate: new Date('2024-11-12').toISOString(),
    totalTradesExecuted: 22,
    totalAmountInvested: 11000,
    autoExecute: true
  },
  {
    id: 'tp-003',
    clientId: 'CLIENT-003',
    clientName: 'Bob Johnson',
    name: 'Conservative Income Plan',
    description: 'Quarterly investment in dividend stocks',
    startDate: new Date('2024-03-01').toISOString(),
    frequency: 'quarterly',
    tradeAmount: 5000,
    securities: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetType: 'etf' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf' }
    ],
    allocations: { VTI: 60, SPY: 40 },
    status: 'paused',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-10-15').toISOString(),
    createdBy: 'trader@example.com',
    lastTradeDate: new Date('2024-09-30').toISOString(),
    totalTradesExecuted: 3,
    totalAmountInvested: 15000,
    autoExecute: false
  }
]

const mockVerifications = [
  { id: '1', clientName: 'John Doe', status: 'pending' as const, submittedAt: new Date().toISOString() },
  { id: '2', clientName: 'Jane Smith', status: 'approved' as const, submittedAt: new Date().toISOString(), reviewedAt: new Date().toISOString(), reviewer: 'Jane Compliance' },
  { id: '3', clientName: 'Bob Johnson', status: 'pending' as const, submittedAt: new Date().toISOString() },
]

const mockProducts = [
  { id: '1', name: 'Fixed Annuity', rate: 3.5, minAmount: 10000, description: 'Fixed rate annuity with guaranteed returns' },
  { id: '2', name: 'Variable Annuity', rate: 4.2, minAmount: 25000, description: 'Variable rate annuity with market exposure' },
  { id: '3', name: 'Indexed Annuity', rate: 3.8, minAmount: 15000, description: 'Indexed annuity linked to market index' },
]

export const handlers = [
  // Trade Plans API
  http.get('/api/trades', () => {
    return HttpResponse.json({
      trades: mockTrades,
      total: mockTrades.length,
      page: 1,
      pageSize: 20
    })
  }),

  http.get('/api/trades/:id', ({ params }) => {
    const trade = mockTrades.find(t => t.id === params.id)
    return trade 
      ? HttpResponse.json(trade)
      : HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
  }),

  http.post('/api/trades', async ({ request }) => {
    const body = await request.json() as any
    const newTrade = {
      id: String(mockTrades.length + 1),
      ...body,
      timestamp: new Date().toISOString(),
      status: 'pending' as const
    }
    mockTrades.push(newTrade)
    return HttpResponse.json(newTrade, { status: 201 })
  }),

  http.put('/api/trades/:id', async ({ params, request }) => {
    const body = await request.json() as any
    const index = mockTrades.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    mockTrades[index] = { ...mockTrades[index], ...body }
    return HttpResponse.json(mockTrades[index])
  }),

  http.delete('/api/trades/:id', ({ params }) => {
    const index = mockTrades.findIndex(t => t.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade not found' }, { status: 404 })
    }
    mockTrades.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Trade Plans API (DCA Plans)
  http.get('/api/trade-plans', () => {
    return HttpResponse.json({
      tradePlans: mockTradePlans,
      total: mockTradePlans.length,
      page: 1,
      pageSize: 20
    })
  }),

  http.get('/api/trade-plans/:id', ({ params }) => {
    const plan = mockTradePlans.find(p => p.id === params.id)
    return plan
      ? HttpResponse.json({ tradePlan: plan })
      : HttpResponse.json({ error: 'Trade plan not found' }, { status: 404 })
  }),

  http.post('/api/trade-plans', async ({ request }) => {
    const body = await request.json() as any
    const newPlan: TradePlan = {
      id: `tp-${String(mockTradePlans.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'system',
      totalTradesExecuted: 0,
      totalAmountInvested: 0
    }
    mockTradePlans.push(newPlan)
    return HttpResponse.json({ tradePlan: newPlan }, { status: 201 })
  }),

  http.put('/api/trade-plans/:id', async ({ params, request }) => {
    const body = await request.json() as any
    const index = mockTradePlans.findIndex(p => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade plan not found' }, { status: 404 })
    }
    const updatedPlan: TradePlan = {
      ...mockTradePlans[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    mockTradePlans[index] = updatedPlan
    return HttpResponse.json({ tradePlan: updatedPlan })
  }),

  http.delete('/api/trade-plans/:id', ({ params }) => {
    const index = mockTradePlans.findIndex(p => p.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Trade plan not found' }, { status: 404 })
    }
    mockTradePlans.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // Client Verification API
  http.get('/api/verifications', () => {
    return HttpResponse.json({
      verifications: mockVerifications,
      total: mockVerifications.length
    })
  }),

  http.get('/api/verifications/:id', ({ params }) => {
    const verification = mockVerifications.find(v => v.id === params.id)
    return verification
      ? HttpResponse.json(verification)
      : HttpResponse.json({ error: 'Verification not found' }, { status: 404 })
  }),

  http.post('/api/verifications/:id/approve', ({ params }) => {
    const verification = mockVerifications.find(v => v.id === params.id)
    if (verification) {
      verification.status = 'approved'
      verification.reviewedAt = new Date().toISOString()
      verification.reviewer = 'System'
    }
    return HttpResponse.json(verification)
  }),

  // Annuity Sales API
  http.get('/api/products', () => {
    return HttpResponse.json({
      products: mockProducts
    })
  }),

  http.get('/api/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id)
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ error: 'Product not found' }, { status: 404 })
  }),

  http.post('/api/quotes', async ({ request }) => {
    const body = await request.json() as any
    return HttpResponse.json({
      id: '1',
      ...body,
      quoteAmount: body.amount * 1.05,
      createdAt: new Date().toISOString()
    }, { status: 201 })
  }),

  // Simulate delay for all requests
  http.get('/api/*', async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.post('/api/*', async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),
]

