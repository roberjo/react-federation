/**
 * Client Verification module types
 */

export interface Verification {
  id: string
  clientName: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewer?: string
}

export interface VerificationListResponse {
  verifications: Verification[]
  total: number
}

