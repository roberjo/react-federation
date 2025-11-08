// Okta OAuth 2.0 Configuration
export const oktaConfig = {
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID || 'demo-client-id',
  issuer: import.meta.env.VITE_OKTA_ISSUER || 'https://dev-example.okta.com/oauth2/default',
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', 'profile', 'email', 'groups'],
  pkce: true,
  tokenManager: {
    storage: 'localStorage',
    autoRenew: true,
  },
  features: {
    registration: false,
  },
};

// For demo purposes - Mock user groups
export const MOCK_GROUPS = [
  'trade-planners',
  'traders',
  'compliance-officers',
  'kyc-specialists',
  'sales-agents',
  'sales-managers',
  'admins',
];

// Group-based access control configuration
export const MODULE_ACCESS = {
  tradePlans: ['trade-planners', 'traders', 'admins'],
  clientVerification: ['compliance-officers', 'kyc-specialists', 'admins'],
  annuitySales: ['sales-agents', 'sales-managers', 'admins'],
};
