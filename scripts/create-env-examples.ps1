# PowerShell script to create .env.example files
# This script creates .env.example files for all packages

$packages = @(
    @{
        Path = "packages/portal/.env.example"
        Content = @"
# Portal Environment Variables
# Copy this file to .env and update with your values

# Authentication Configuration
# Set to true to use mock authentication in development
VITE_USE_MOCK_AUTH=true

# API Configuration
# Set to true to use mock API in development
VITE_USE_MOCK_API=true

# API Base URL (used when not mocking)
VITE_API_BASE_URL=http://localhost:3000/api

# Okta Configuration (used when not mocking)
VITE_OKTA_CLIENT_ID=your_client_id
VITE_OKTA_ISSUER=https://your-domain.okta.com/oauth2/default

# Manifest Configuration
# URL to fetch remote module manifest in production
VITE_MANIFEST_URL=http://localhost:8080/manifest.json

# Application Name
VITE_APP_NAME=Financial Services Portal
"@
    },
    @{
        Path = "packages/trade-plans/.env.example"
        Content = @"
# Trade Plans Remote Module Environment Variables
# Copy this file to .env and update with your values

# API Configuration
# Set to true to use mock API in development
VITE_USE_MOCK_API=true

# API Base URL (used when not mocking)
VITE_API_BASE_URL=http://localhost:3000/api
"@
    },
    @{
        Path = "packages/client-verification/.env.example"
        Content = @"
# Client Verification Remote Module Environment Variables
# Copy this file to .env and update with your values

# API Configuration
# Set to true to use mock API in development
VITE_USE_MOCK_API=true

# API Base URL (used when not mocking)
VITE_API_BASE_URL=http://localhost:3000/api
"@
    },
    @{
        Path = "packages/annuity-sales/.env.example"
        Content = @"
# Annuity Sales Remote Module Environment Variables
# Copy this file to .env and update with your values

# API Configuration
# Set to true to use mock API in development
VITE_USE_MOCK_API=true

# API Base URL (used when not mocking)
VITE_API_BASE_URL=http://localhost:3000/api
"@
    }
)

foreach ($package in $packages) {
    $filePath = $package.Path
    $content = $package.Content
    
    # Create directory if it doesn't exist
    $directory = Split-Path -Parent $filePath
    if (-not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    
    # Create file
    Set-Content -Path $filePath -Value $content -Encoding UTF8
    Write-Host "Created: $filePath" -ForegroundColor Green
}

Write-Host "`nAll .env.example files created successfully!" -ForegroundColor Green
Write-Host "Note: These files are in .gitignore, so they won't be committed." -ForegroundColor Yellow

