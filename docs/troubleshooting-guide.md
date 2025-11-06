# Troubleshooting Guide

## Common Issues and Solutions

This guide covers common issues you may encounter during development and deployment.

## Module Federation Issues

### Issue: Remote Module Not Loading

**Symptoms:**
- Module fails to load
- Console error: "Failed to load remote module"
- Network error when fetching `remoteEntry.js`

**Solutions:**

1. **Check Remote is Running**
   ```bash
   # Verify remote is accessible
   curl http://localhost:5001/assets/remoteEntry.js
   ```

2. **Check CORS Configuration**
   ```typescript
   // Remote vite.config.ts
   server: {
     cors: true,
     headers: {
       'Access-Control-Allow-Origin': '*'
     }
   }
   ```

3. **Verify Remote Name**
   - Check remote name matches in portal config
   - Check remote name matches in manifest.json

4. **Check Network Tab**
   - Verify `remoteEntry.js` request succeeds
   - Check response headers for CORS

### Issue: Module Federation Version Mismatch

**Symptoms:**
- Console warning: "Shared module version mismatch"
- Runtime errors when using shared dependencies
- Components not rendering correctly

**Solutions:**

1. **Check Shared Dependency Versions**
   ```bash
   # In each repository, check versions
   npm list react react-dom mobx
   ```

2. **Align Versions**
   - Update all repositories to use same versions
   - Update `package.json` in all repos
   - Run `npm install` in all repos

3. **Check package.json**
   ```json
   {
     "dependencies": {
       "react": "^18.3.0",
       "react-dom": "^18.3.0",
       "mobx": "^6.10.0"
     }
   }
   ```

### Issue: Module Loads but Component Doesn't Render

**Symptoms:**
- Module loads successfully
- No errors in console
- Component doesn't appear

**Solutions:**

1. **Check Component Export**
   ```typescript
   // Remote App.tsx
   export default function App() {
     return <div>Trade Plans</div>
   }
   ```

2. **Check Module Path**
   ```typescript
   // Portal ModuleLoader
   <ModuleLoader 
     remoteName="tradePlans"
     module="./App"  // Must match expose path
   />
   ```

3. **Check React Context**
   - Ensure React Router context is available
   - Check if component needs provider

### Issue: Shared State Not Working

**Symptoms:**
- State changes in portal don't reflect in remote
- State changes in remote don't reflect in portal

**Solutions:**

1. **Verify State Sharing Method**
   - Check if using props injection
   - Check if using global window object
   - Check if using shared store package

2. **Check MobX Observables**
   ```typescript
   // Ensure stores are observable
   class MyStore {
     @observable data = []
   }
   ```

3. **Verify Store Access**
   ```typescript
   // Portal
   const { authStore } = useStores()
   
   // Remote
   const auth = (window as any).portalAuth
   ```

## Authentication Issues

### Issue: Login Redirect Loop

**Symptoms:**
- User redirected to login repeatedly
- Cannot access application after login

**Solutions:**

1. **Check Callback URL**
   ```typescript
   // portal-repo/src/config/oktaConfig.ts
   redirectUri: `${window.location.origin}/login/callback`
   ```

2. **Verify Okta Configuration**
   - Check redirect URI in Okta matches
   - Check callback route in React Router

3. **Check Token Storage**
   ```typescript
   // Verify token is stored
   const token = await oktaAuth.getAccessToken()
   console.log('Token:', token)
   ```

### Issue: Token Expired

**Symptoms:**
- User logged out unexpectedly
- API requests return 401
- "Token expired" error

**Solutions:**

1. **Implement Auto-Refresh**
   ```typescript
   // portal-repo/src/stores/AuthStore.ts
   this.oktaAuth.tokenManager.on('expired', () => {
     this.handleTokenExpiration()
   })
   ```

2. **Check Token Lifetime**
   - Verify token lifetime in Okta
   - Adjust if too short

3. **Handle Refresh Errors**
   ```typescript
   try {
     await oktaAuth.tokenManager.renew('accessToken')
   } catch (error) {
     // Refresh failed, logout
     await this.logout()
   }
   ```

### Issue: Groups Not Found

**Symptoms:**
- User has access but groups are empty
- Unauthorized errors despite correct groups

**Solutions:**

1. **Check Okta Group Configuration**
   - Verify groups exist in Okta
   - Verify user is assigned to groups
   - Check group names match exactly

2. **Check Token Claims**
   ```typescript
   // Verify groups in token
   const claims = jwtDecode(token)
   console.log('Groups:', claims.groups)
   ```

3. **Check Token Scopes**
   ```typescript
   // portal-repo/src/config/oktaConfig.ts
   scopes: ['openid', 'profile', 'email', 'groups']
   ```

4. **Verify Claims Configuration**
   - Check Okta token claims configuration
   - Ensure `groups` claim is included

## Build and Deployment Issues

### Issue: Build Fails

**Symptoms:**
- Build command fails
- TypeScript errors
- Module not found errors

**Solutions:**

1. **Check Dependencies**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check TypeScript Errors**
   ```bash
   # Run type check
   npm run type-check
   ```

3. **Check Shared Types**
   ```bash
   # If using shared types package
   npm link @your-org/shared-types
   ```

4. **Check Environment Variables**
   ```bash
   # Verify .env file exists
   cat .env
   ```

### Issue: Deployment to S3 Fails

**Symptoms:**
- CI/CD pipeline fails
- S3 upload errors
- Permission denied errors

**Solutions:**

1. **Check AWS Credentials**
   ```bash
   # Verify credentials
   aws sts get-caller-identity
   ```

2. **Check S3 Bucket Permissions**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::bucket/*"
       }
     ]
   }
   ```

3. **Check Bucket Name**
   - Verify bucket name in secrets
   - Check bucket exists

4. **Check Build Output**
   ```bash
   # Verify dist folder exists
   ls -la dist/
   ```

### Issue: CloudFront Cache Issues

**Symptoms:**
- Changes not appearing after deployment
- Old version still showing
- Cache not invalidating

**Solutions:**

1. **Invalidate CloudFront**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $CF_DIST_ID \
     --paths "/*"
   ```

2. **Check Cache Headers**
   ```bash
   # Check S3 object headers
   aws s3api head-object \
     --bucket bucket \
     --key portal/current/index.html
   ```

3. **Use Versioned Paths**
   - Deploy to versioned paths
   - Update current symlink
   - Invalidate both paths

## Runtime Issues

### Issue: Application Crashes on Load

**Symptoms:**
- White screen
- Console errors
- Application doesn't start

**Solutions:**

1. **Check Browser Console**
   - Look for JavaScript errors
   - Check network errors
   - Verify module loading

2. **Check Error Boundary**
   ```typescript
   // Verify error boundary is set up
   <ErrorBoundary>
     <App />
   </ErrorBoundary>
   ```

3. **Check React Version**
   ```bash
   # Verify React version
   npm list react react-dom
   ```

4. **Check Environment Variables**
   ```typescript
   // Verify env vars are set
   console.log(import.meta.env.VITE_OKTA_CLIENT_ID)
   ```

### Issue: Slow Module Loading

**Symptoms:**
- Modules take long to load
- Poor user experience
- Timeout errors

**Solutions:**

1. **Check Network**
   - Verify CDN is working
   - Check network latency
   - Verify remote is accessible

2. **Optimize Bundle Size**
   ```typescript
   // vite.config.ts
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           vendor: ['react', 'react-dom']
         }
       }
     }
   }
   ```

3. **Implement Loading States**
   ```typescript
   <Suspense fallback={<LoadingSpinner />}>
     <ModuleLoader />
   </Suspense>
   ```

4. **Check Manifest Caching**
   - Cache manifest.json
   - Reduce manifest fetch frequency

## Development Issues

### Issue: Hot Module Replacement Not Working

**Symptoms:**
- Changes not reflecting
- Need to refresh manually
- HMR errors in console

**Solutions:**

1. **Check Vite Configuration**
   ```typescript
   // vite.config.ts
   server: {
     hmr: {
       port: 5173
     }
   }
   ```

2. **Check Port Conflicts**
   ```bash
   # Check if port is in use
   lsof -i :5173
   ```

3. **Restart Dev Server**
   ```bash
   # Kill and restart
   npm run dev
   ```

### Issue: TypeScript Errors Across Repos

**Symptoms:**
- Type errors in shared types
- Import errors
- Type mismatches

**Solutions:**

1. **Check Shared Types Package**
   ```bash
   # Rebuild shared types
   cd shared-types-repo
   npm run build
   ```

2. **Relink Shared Types**
   ```bash
   # Unlink and relink
   npm unlink @your-org/shared-types
   npm link @your-org/shared-types
   ```

3. **Check TypeScript Config**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "paths": {
         "@your-org/shared-types": ["../shared-types-repo/src"]
       }
     }
   }
   ```

## Manifest Issues

### Issue: Manifest Not Found

**Symptoms:**
- Cannot load manifest.json
- Remote modules not discovered
- 404 error for manifest

**Solutions:**

1. **Check Manifest URL**
   ```typescript
   // portal-repo/src/services/manifestService.ts
   const manifestUrl = import.meta.env.VITE_MANIFEST_URL
   console.log('Manifest URL:', manifestUrl)
   ```

2. **Verify Manifest Exists**
   ```bash
   # Check S3
   aws s3 ls s3://bucket/manifest.json
   ```

3. **Check CORS**
   - Verify CORS allows manifest fetch
   - Check response headers

### Issue: Manifest Out of Date

**Symptoms:**
- Old module versions in manifest
- New modules not appearing
- Version mismatches

**Solutions:**

1. **Update Manifest on Deploy**
   - Ensure CI/CD updates manifest
   - Verify manifest update script

2. **Check Manifest Service**
   - Verify manifest service is running
   - Check service logs

3. **Manual Update**
   ```bash
   # Manually update manifest
   aws s3 cp manifest.json s3://bucket/manifest.json
   ```

## Performance Issues

### Issue: Large Bundle Sizes

**Symptoms:**
- Slow initial load
- Large JavaScript files
- Poor performance

**Solutions:**

1. **Code Splitting**
   ```typescript
   // Use lazy loading
   const Module = lazy(() => import('./Module'))
   ```

2. **Tree Shaking**
   ```typescript
   // Import only what you need
   import { specific } from 'library'
   // Not: import * from 'library'
   ```

3. **Optimize Dependencies**
   - Remove unused dependencies
   - Use lighter alternatives

### Issue: Memory Leaks

**Symptoms:**
- Application slows over time
- Browser becomes unresponsive
- Memory usage increases

**Solutions:**

1. **Clean Up Event Listeners**
   ```typescript
   useEffect(() => {
     const handler = () => {}
     window.addEventListener('event', handler)
     return () => window.removeEventListener('event', handler)
   }, [])
   ```

2. **Clean Up Timers**
   ```typescript
   useEffect(() => {
     const timer = setInterval(() => {}, 1000)
     return () => clearInterval(timer)
   }, [])
   ```

3. **Check MobX Observables**
   - Dispose of observers
   - Clear stores on unmount

## Getting Help

### Debug Checklist

1. **Check Browser Console**
   - Look for errors
   - Check warnings
   - Verify network requests

2. **Check Network Tab**
   - Verify requests succeed
   - Check response headers
   - Verify CORS

3. **Check Application State**
   - Verify authentication
   - Check user groups
   - Verify module loading

4. **Check Logs**
   - Check CI/CD logs
   - Check server logs
   - Check browser console

### Resources

- [Module Federation Documentation](https://module-federation.github.io/)
- [Vite Documentation](https://vitejs.dev/)
- [Okta React SDK](https://github.com/okta/okta-react)
- [MobX Documentation](https://mobx.js.org/)

### Support

- Check GitHub issues
- Review documentation
- Ask team members
- Contact Okta support (for auth issues)

