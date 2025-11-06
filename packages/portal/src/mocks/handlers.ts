import { http, HttpResponse } from 'msw'

// Mock data
const mockTrades = [
  { id: '1', symbol: 'AAPL', quantity: 100, price: 150.0, timestamp: new Date().toISOString(), status: 'executed' as const },
  { id: '2', symbol: 'GOOGL', quantity: 50, price: 2500.0, timestamp: new Date().toISOString(), status: 'executed' as const },
  { id: '3', symbol: 'MSFT', quantity: 75, price: 350.0, timestamp: new Date().toISOString(), status: 'pending' as const },
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

