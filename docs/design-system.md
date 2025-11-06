# Design System

## Overview

This design system provides a consistent, professional look and feel for the enterprise portal and all remote modules.

## Color Palette

### Primary Colors (Blue)

Trust, professionalism, stability

```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

**Usage:**
- Primary buttons
- Active navigation items
- Links
- Focus states
- Brand elements

### Secondary Colors (Purple)

Creativity, innovation, premium

```css
--secondary-50: #faf5ff;
--secondary-100: #f3e8ff;
--secondary-200: #e9d5ff;
--secondary-300: #d8b4fe;
--secondary-400: #c084fc;
--secondary-500: #a855f7;  /* Main secondary */
--secondary-600: #9333ea;
--secondary-700: #7e22ce;
--secondary-800: #6b21a8;
--secondary-900: #581c87;
```

**Usage:**
- Secondary actions
- Accent elements
- Highlights
- Premium features

### Semantic Colors

#### Success (Green)
```css
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;
```

**Usage:** Success messages, completed states, positive indicators

#### Warning (Amber)
```css
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
```

**Usage:** Warnings, pending states, attention needed

#### Danger (Red)
```css
--danger-50: #fef2f2;
--danger-500: #ef4444;
--danger-600: #dc2626;
```

**Usage:** Errors, destructive actions, critical alerts

### Neutral Colors (Slate)

```css
--dark-50: #f8fafc;
--dark-100: #f1f5f9;
--dark-200: #e2e8f0;
--dark-300: #cbd5e1;
--dark-400: #94a3b8;
--dark-500: #64748b;
--dark-600: #475569;
--dark-700: #334155;
--dark-800: #1e293b;
--dark-900: #0f172a;
```

**Usage:** Backgrounds, borders, text, dividers

## Typography

### Font Family

**Primary Font:** Inter
- Clean, modern, highly readable
- Excellent for financial data
- Web-safe fallbacks: system-ui, sans-serif

```css
font-family: 'Inter', system-ui, sans-serif;
```

### Font Sizes

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Headings

```css
h1 {
  font-size: 2.25rem;    /* 36px */
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

h2 {
  font-size: 1.875rem;   /* 30px */
  font-weight: 600;
  line-height: 1.3;
}

h3 {
  font-size: 1.5rem;     /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 1.25rem;    /* 20px */
  font-weight: 600;
  line-height: 1.5;
}
```

## Spacing

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## Components

### Buttons

#### Primary Button
```tsx
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg 
                  hover:bg-primary-600 active:bg-primary-700 
                  transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-4 py-2 bg-secondary-500 text-white rounded-lg 
                  hover:bg-secondary-600 active:bg-secondary-700 
                  transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2">
  Secondary Action
</button>
```

#### Outline Button
```tsx
<button className="px-4 py-2 border-2 border-primary-500 text-primary-500 
                  rounded-lg hover:bg-primary-50 active:bg-primary-100 
                  transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Outline Action
</button>
```

#### Danger Button
```tsx
<button className="px-4 py-2 bg-danger-500 text-white rounded-lg 
                  hover:bg-danger-600 active:bg-danger-700 
                  transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2">
  Delete
</button>
```

### Cards

```tsx
<div className="bg-white rounded-lg shadow-card p-6 
                border border-dark-200 
                hover:shadow-soft transition-shadow duration-200">
  <h3 className="text-xl font-semibold mb-4">Card Title</h3>
  <p className="text-dark-600">Card content goes here.</p>
</div>
```

### Input Fields

```tsx
<input 
  type="text"
  className="w-full px-4 py-2 border border-dark-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary-500 
            focus:border-transparent 
            transition-all duration-200"
  placeholder="Enter text..."
/>
```

### Navigation

#### Sidebar Navigation Item
```tsx
<nav className="flex flex-col space-y-1">
  <a 
    href="/trade-plans"
    className="flex items-center px-4 py-3 rounded-lg 
               text-dark-700 hover:bg-primary-50 hover:text-primary-600 
               transition-colors duration-200
               active:bg-primary-100 active:text-primary-700">
    <TrendingUp className="w-5 h-5 mr-3" />
    <span className="font-medium">Trade Plans</span>
  </a>
</nav>
```

#### Active Navigation Item
```tsx
<a 
  href="/trade-plans"
  className="flex items-center px-4 py-3 rounded-lg 
             bg-primary-50 text-primary-600 
             border-l-4 border-primary-500">
  <TrendingUp className="w-5 h-5 mr-3" />
  <span className="font-semibold">Trade Plans</span>
</a>
```

## Layout

### Sidebar

- **Width (Expanded):** 240px
- **Width (Collapsed):** 64px
- **Background:** white
- **Border:** right border (1px, dark-200)
- **Z-index:** 100

### Header

- **Height:** 64px
- **Background:** white
- **Border:** bottom border (1px, dark-200)
- **Z-index:** 50

### Main Content

- **Padding:** 24px (1.5rem)
- **Background:** dark-50
- **Min-height:** calc(100vh - 64px)

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
```

## Transitions

### Standard Transitions

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### Common Transitions

```css
/* Color transitions */
transition-colors duration-200

/* Shadow transitions */
transition-shadow duration-200

/* Transform transitions */
transition-transform duration-200

/* All transitions */
transition-all duration-200
```

## Icons

### Icon Library

**Lucide React** - Modern, consistent icon set

```tsx
import { TrendingUp, UserCheck, DollarSign, Settings, Bell } from 'lucide-react'
```

### Icon Sizes

```css
--icon-xs: 0.75rem;   /* 12px */
--icon-sm: 1rem;      /* 16px */
--icon-md: 1.25rem;   /* 20px */
--icon-lg: 1.5rem;    /* 24px */
--icon-xl: 2rem;      /* 32px */
```

### Icon Usage

```tsx
// Navigation icons
<TrendingUp className="w-5 h-5" />

// Action icons
<Settings className="w-4 h-4" />

// Status icons
<CheckCircle className="w-6 h-6 text-success-500" />
```

## Responsive Design

### Breakpoints

```css
--sm: 640px;
--md: 768px;
--lg: 1024px;
--xl: 1280px;
--2xl: 1536px;
```

### Mobile Considerations

- **Sidebar:** Collapse to hamburger menu
- **Navigation:** Bottom navigation on mobile
- **Cards:** Full width on mobile
- **Tables:** Horizontal scroll or card view
- **Forms:** Stack vertically

## Accessibility

### Focus States

```css
focus:outline-none
focus:ring-2
focus:ring-primary-500
focus:ring-offset-2
```

### Color Contrast

- **Text on Background:** Minimum 4.5:1 ratio
- **Large Text:** Minimum 3:1 ratio
- **Interactive Elements:** Minimum 3:1 ratio

### Keyboard Navigation

- All interactive elements keyboard accessible
- Tab order follows visual order
- Skip links for main content
- Focus indicators visible

## Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... all primary colors
        },
        secondary: {
          50: '#faf5ff',
          // ... all secondary colors
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          50: '#f8fafc',
          // ... all dark colors
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
```

## Best Practices

1. **Consistency:** Use design system components consistently
2. **Accessibility:** Always include focus states and proper contrast
3. **Responsive:** Design mobile-first
4. **Performance:** Use CSS transitions, not JavaScript animations
5. **Maintainability:** Use Tailwind utility classes, not custom CSS
6. **Documentation:** Document custom components

