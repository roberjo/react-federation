import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SalesPipeline from '../SalesPipeline'
import type { AuthState } from '@federation/shared/types'

describe('SalesPipeline', () => {
  const salesAuth: AuthState = {
    user: {
      sub: '1',
      email: 'agent@example.com',
      name: 'Sales Agent',
      groups: ['sales-agents'],
    },
    groups: ['sales-agents'],
    hasGroup: (group: string) => group === 'sales-agents' || group === 'admins',
    hasAnyGroup: (groups: string[]) => groups.includes('sales-agents'),
  }

  it('renders pipeline metrics and opportunities', () => {
    render(<SalesPipeline auth={salesAuth} />)

    expect(screen.getByText('Weighted Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Closed YTD')).toBeInTheDocument()
    expect(screen.getByText('Average Win Probability')).toBeInTheDocument()

    expect(screen.getByText('Annuity Sales Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Evergreen Retirement Fund')).toBeInTheDocument()
    expect(screen.getByText('Beacon Family Offices')).toBeInTheDocument()
  })

  it('shows create quote button for sales teams', () => {
    render(<SalesPipeline auth={salesAuth} />)
    expect(screen.getByText('Create New Quote')).toBeInTheDocument()
  })

  it('hides create quote button for viewers', () => {
    const viewerAuth: AuthState = {
      user: { sub: '2', email: 'viewer@example.com', name: 'Viewer', groups: ['analysts'] },
      groups: ['analysts'],
      hasGroup: () => false,
      hasAnyGroup: () => false,
    }

    render(<SalesPipeline auth={viewerAuth} />)
    expect(screen.queryByText('Create New Quote')).toBeNull()
  })
})

