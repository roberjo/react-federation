import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VerificationQueue from '../VerificationQueue'
import type { AuthState } from '@federation/shared/types'

describe('VerificationQueue', () => {
  const complianceAuth: AuthState = {
    user: {
      sub: '1',
      email: 'compliance@example.com',
      name: 'Compliance Officer',
      groups: ['compliance-officers'],
    },
    groups: ['compliance-officers'],
    isAuthenticated: true,
    hasGroup: (group: string) => group === 'compliance-officers' || group === 'admins',
    hasAnyGroup: (groups: string[]) => groups.includes('compliance-officers'),
  }

  it('renders KPI cards and queue table', () => {
    render(<VerificationQueue auth={complianceAuth} />)

    expect(screen.getByText('Active KYC Cases')).toBeInTheDocument()
    expect(screen.getByText('High Risk Pending')).toBeInTheDocument()
    expect(screen.getAllByText('Awaiting Documents')).toHaveLength(2)

    expect(screen.getByText('Verification Queue')).toBeInTheDocument()
    expect(screen.getByText('Acme Capital LLC')).toBeInTheDocument()
    expect(screen.getByText('Summit Trust Co.')).toBeInTheDocument()
  })

  it('shows escalation button for compliance teams', () => {
    render(<VerificationQueue auth={complianceAuth} />)
    expect(screen.getByText('Escalate Oldest Case')).toBeInTheDocument()
  })

  it('hides escalation button for non-compliance viewers', () => {
    const readOnlyAuth: AuthState = {
      user: { sub: '2', email: 'viewer@example.com', name: 'Read Only', groups: ['analysts'] },
      groups: ['analysts'],
      hasGroup: () => false,
      hasAnyGroup: () => false,
    }

    render(<VerificationQueue auth={readOnlyAuth} />)
    expect(screen.queryByText('Escalate Oldest Case')).toBeNull()
  })
})

