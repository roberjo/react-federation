# Migration Plan: Fusion-Site Design System to Portal

## Executive Summary

This document outlines the migration plan to incorporate the design system, UI components, and layout structure from `fusion-site` into the `portal` package. The fusion-site provides a comprehensive, enterprise-grade design system built on shadcn/ui (Radix UI) with a professional financial services theme.

## Key Differences Analysis

### Fusion-Site Strengths
- ✅ **shadcn/ui Component Library**: 50+ accessible, customizable UI components
- ✅ **Comprehensive Design System**: CSS variables for theming, dark mode support
- ✅ **Professional Layout**: Sidebar, Header, and Layout components
- ✅ **Enhanced Pages**: Dashboard with stats cards, improved Login page
- ✅ **TypeScript Path Aliases**: `@/components`, `@/lib`, `@/hooks` for cleaner imports
- ✅ **TanStack Query**: Data fetching and caching
- ✅ **Toast Notifications**: Sonner for modern toast notifications
- ✅ **Extended Tailwind Config**: Custom colors, shadows, animations, sidebar theme

### Portal Current State
- ⚠️ **Basic Tailwind**: Minimal configuration, no design system
- ⚠️ **No UI Component Library**: Missing reusable components
- ⚠️ **No Layout Components**: Missing Sidebar and Header
- ⚠️ **Basic Pages**: Simple Dashboard and Login pages
- ⚠️ **No Path Aliases**: Direct relative imports
- ⚠️ **No Data Fetching Library**: Direct API calls
- ⚠️ **No Toast System**: Missing notification system

## Migration Strategy

### Phase 1: Foundation & Dependencies (Priority: High)
**Goal**: Set up the foundation for the design system

1. **Install Required Dependencies**
   - shadcn/ui dependencies (Radix UI primitives)
   - TanStack Query for data fetching
   - Sonner for toast notifications
   - Additional utilities (class-variance-authority, tailwind-merge, clsx)

2. **Configure TypeScript Path Aliases**
   - Add `@/components`, `@/lib`, `@/hooks`, `@/ui` aliases
   - Update `tsconfig.json` and `vite.config.ts`

3. **Set Up shadcn/ui**
   - Initialize `components.json`
   - Create `lib/utils.ts` with `cn()` utility

4. **Migrate Tailwind Configuration**
   - Copy extended theme from fusion-site
   - Add CSS variables for design system
   - Add custom animations and shadows

5. **Migrate CSS Design System**
   - Copy `index.css` with CSS variables
   - Add dark mode support
   - Add custom scrollbar styles

### Phase 2: Core UI Components (Priority: High)
**Goal**: Migrate essential UI components

1. **Base Components** (Required for Layout)
   - Button
   - Card
   - Input
   - Label
   - Separator
   - Avatar
   - Badge

2. **Navigation Components**
   - Dropdown Menu
   - Tooltip
   - Scroll Area

3. **Feedback Components**
   - Toast / Toaster
   - Sonner
   - Alert / Alert Dialog
   - Skeleton

4. **Layout Components**
   - Sidebar (from fusion-site)
   - Header (from fusion-site)
   - Layout wrapper (from fusion-site)

### Phase 3: Enhanced Pages (Priority: Medium)
**Goal**: Migrate and adapt page components

1. **Dashboard Page**
   - Stats cards with icons
   - Quick access module cards
   - Recent activity section
   - Responsive grid layouts

2. **Login Page**
   - Enhanced design with features list
   - Gradient background
   - Better visual hierarchy

3. **Error Pages**
   - Unauthorized page styling
   - NotFound page styling

### Phase 4: Integration & Polish (Priority: Medium)
**Goal**: Integrate everything and ensure consistency

1. **Update App.tsx**
   - Add Layout wrapper
   - Add QueryClientProvider
   - Add TooltipProvider
   - Add Toast providers

2. **Update Routing**
   - Wrap protected routes with Layout
   - Ensure proper outlet rendering

3. **Update Auth Components**
   - Style LoginPage with new design
   - Update UnauthorizedPage styling

4. **Module Loader Integration**
   - Ensure ModuleLoader works within Layout
   - Test remote module rendering

### Phase 5: Additional Components (Priority: Low)
**Goal**: Migrate remaining useful components

1. **Form Components**
   - Form (react-hook-form integration)
   - Select
   - Checkbox
   - Radio Group
   - Textarea
   - Switch

2. **Data Display**
   - Table
   - Tabs
   - Accordion
   - Dialog
   - Sheet
   - Popover

3. **Advanced Components**
   - Command (command palette)
   - Calendar
   - Chart (recharts integration)
   - Data Table (with sorting/filtering)

## Detailed Migration Steps

### Step 1: Install Dependencies

```bash
cd packages/portal
pnpm add @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @tanstack/react-query
pnpm add sonner
pnpm add date-fns
pnpm add lucide-react
```

### Step 2: Configure TypeScript Path Aliases

Update `packages/portal/tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/ui/*": ["./src/components/ui/*"],
      "@federation/shared/*": ["../shared/src/*"]
    }
  }
}
```

Update `packages/portal/vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@federation/shared': path.resolve(__dirname, '../shared/src'),
  }
}
```

### Step 3: Initialize shadcn/ui

Create `packages/portal/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Step 4: Create Utility Functions

Create `packages/portal/src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 5: Migrate Tailwind Configuration

Convert `tailwind.config.js` to `tailwind.config.ts` and migrate the extended theme from fusion-site, including:
- CSS variable-based color system
- Custom sidebar colors
- Extended animations (slide-in-left, slide-out-left, fade-in, fade-out)
- Custom shadows (soft, card, elevated, floating)
- Border radius variables

### Step 6: Migrate CSS Design System

Update `packages/portal/src/index.css` with:
- CSS variables for all colors (primary, secondary, success, warning, destructive, etc.)
- Dark mode variables
- Custom scrollbar styles
- Base layer styles
- Component utility classes

### Step 7: Migrate Core UI Components

Copy and adapt the following components from fusion-site:
1. `src/components/ui/button.tsx`
2. `src/components/ui/card.tsx`
3. `src/components/ui/input.tsx`
4. `src/components/ui/label.tsx`
5. `src/components/ui/separator.tsx`
6. `src/components/ui/avatar.tsx`
7. `src/components/ui/badge.tsx`
8. `src/components/ui/dropdown-menu.tsx`
9. `src/components/ui/tooltip.tsx`
10. `src/components/ui/scroll-area.tsx`
11. `src/components/ui/toast.tsx`
12. `src/components/ui/toaster.tsx`
13. `src/components/ui/sonner.tsx`
14. `src/components/ui/alert.tsx`
15. `src/components/ui/alert-dialog.tsx`
16. `src/components/ui/skeleton.tsx`

### Step 8: Migrate Layout Components

Copy and adapt:
1. `src/components/Layout/Layout.tsx`
2. `src/components/Layout/Sidebar.tsx`
3. `src/components/Layout/Header.tsx`

**Adaptations needed:**
- Update imports to use new path aliases
- Ensure MobX store integration works
- Update navigation items to match portal routes
- Ensure ModuleLoader works within Layout

### Step 9: Migrate Enhanced Pages

1. **Dashboard Page**
   - Copy `src/pages/Dashboard.tsx` from fusion-site
   - Adapt to use portal's auth store
   - Update module links to match portal routes

2. **Login Page**
   - Copy `src/pages/Login.tsx` from fusion-site
   - Adapt to use portal's auth store
   - Ensure mock mode support

3. **Error Pages**
   - Update UnauthorizedPage styling
   - Create NotFound page if missing

### Step 10: Update App.tsx

Wrap the application with:
- `QueryClientProvider` (TanStack Query)
- `TooltipProvider` (Radix UI)
- `Toaster` and `Sonner` (Toast notifications)
- `Layout` component for protected routes

### Step 11: Update Auth Store

Ensure `AuthStore` has:
- `userName` getter (from claims)
- `userEmail` getter (from claims)
- `userInitials` getter (from claims name)

### Step 12: Testing

1. **Visual Testing**
   - Verify all pages render correctly
   - Check responsive design
   - Verify dark mode (if enabled)

2. **Functional Testing**
   - Test navigation
   - Test authentication flow
   - Test module loading
   - Test toast notifications

3. **Unit Testing**
   - Update existing tests for new components
   - Add tests for new components
   - Ensure all tests pass

## File Structure After Migration

```
packages/portal/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── ...
│   │   ├── Layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Auth/
│   │   │   └── ... (existing)
│   │   └── ModuleLoader.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── hooks/
│   │   └── ... (existing)
│   ├── stores/
│   │   └── ... (existing)
│   ├── pages/                # If using page components
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── components.json
├── tailwind.config.ts
└── tsconfig.json
```

## Dependencies to Add

### Core Dependencies
- `@tanstack/react-query`: ^5.83.0
- `sonner`: ^1.7.4
- `lucide-react`: ^0.462.0 (or latest)
- `date-fns`: ^3.6.0

### Radix UI Primitives (shadcn/ui)
- All Radix UI packages listed in fusion-site package.json

### Utilities
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.6.0

### Optional (for advanced features)
- `recharts`: ^2.15.4 (for charts)
- `react-hook-form`: ^7.61.1 (for forms)
- `zod`: ^3.25.76 (for validation)
- `cmdk`: ^1.1.1 (for command palette)

## Breaking Changes & Considerations

### 1. Import Paths
- **Before**: `import { Button } from '../components/ui/button'`
- **After**: `import { Button } from '@/components/ui/button'`

### 2. CSS Classes
- Portal uses basic Tailwind classes
- Fusion-site uses CSS variable-based classes (e.g., `bg-primary`, `text-foreground`)
- All components need to be updated to use new color system

### 3. Component API
- shadcn/ui components use `cn()` utility for class merging
- Components use Radix UI primitives with custom styling
- Some components may have different prop APIs

### 4. Layout Structure
- Portal currently renders pages directly
- After migration, all protected routes must be wrapped in Layout
- ModuleLoader must work within Layout's main content area

### 5. Data Fetching
- Portal currently uses direct API calls
- Consider migrating to TanStack Query for consistency
- This is optional but recommended

## Migration Checklist

### Foundation
- [ ] Install all required dependencies
- [ ] Configure TypeScript path aliases
- [ ] Set up shadcn/ui (components.json)
- [ ] Create lib/utils.ts
- [ ] Migrate Tailwind config
- [ ] Migrate CSS design system

### Core Components
- [ ] Migrate base UI components (button, card, input, etc.)
- [ ] Migrate navigation components
- [ ] Migrate feedback components
- [ ] Migrate layout components (Sidebar, Header, Layout)

### Pages
- [ ] Migrate Dashboard page
- [ ] Migrate Login page
- [ ] Update error pages

### Integration
- [ ] Update App.tsx with providers
- [ ] Update routing structure
- [ ] Update Auth components
- [ ] Test ModuleLoader integration

### Testing
- [ ] Visual regression testing
- [ ] Functional testing
- [ ] Unit test updates
- [ ] E2E test updates

### Documentation
- [ ] Update component documentation
- [ ] Update style guide
- [ ] Update migration notes

## Estimated Timeline

- **Phase 1 (Foundation)**: 2-3 hours
- **Phase 2 (Core Components)**: 4-6 hours
- **Phase 3 (Enhanced Pages)**: 2-3 hours
- **Phase 4 (Integration)**: 2-3 hours
- **Phase 5 (Additional Components)**: 4-6 hours (optional)

**Total**: 14-21 hours for core migration, +4-6 hours for optional components

## Risk Mitigation

1. **Incremental Migration**: Migrate one component at a time, test after each
2. **Feature Branch**: Create a feature branch for the migration
3. **Backup**: Ensure current portal works before starting
4. **Testing**: Run tests after each major change
5. **Rollback Plan**: Keep a backup of the original portal structure

## Success Criteria

✅ All existing functionality works
✅ Portal has professional, consistent design
✅ Layout components (Sidebar, Header) are functional
✅ Dashboard page matches fusion-site design
✅ Login page matches fusion-site design
✅ All tests pass
✅ ModuleLoader works within new Layout
✅ Responsive design works on all screen sizes
✅ Dark mode works (if enabled)

## Next Steps

1. Review and approve this migration plan
2. Create feature branch: `feature/fusion-site-migration`
3. Begin Phase 1: Foundation & Dependencies
4. Test incrementally after each phase
5. Update documentation as migration progresses

