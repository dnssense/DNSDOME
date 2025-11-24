# DNS Dome Design System

## Overview
This design system provides a comprehensive set of CSS variables for the DNS Dome application. All UI components should use these variables to ensure consistency and enable easy theming.

## Typography

### Font Family
- **Primary Font**: Roboto (400, 500)
- Import: `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');`

### Font Sizes
```css
--text-h1: 36px;
--text-h2: 32px;
--text-h3: 28px;
--text-h4: 24px;
--text-base: 14px;
--text-label: 14px;
--text-caption: 12px;
--text-section-heading: 10px;
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
```

## Color System

### Base Colors
```css
--background: rgba(247, 250, 252, 1);        /* Main background */
--foreground: rgba(68, 81, 101, 1);          /* Main text */
--card: rgba(255, 255, 255, 1);               /* Card backgrounds */
--primary: rgba(19, 95, 130, 1);              /* Primary actions */
--primary-foreground: rgba(255, 255, 255, 1); /* Text on primary */
--border: rgba(205, 212, 223, 1);             /* Borders */
```

### Category Colors (Figma Aligned)

#### Total (Cyan)
```css
--category-total: rgba(8, 145, 178, 1);           /* #0891B2 */
--category-total-light: rgba(207, 250, 254, 1);   /* #CFFAFE */
--category-total-bg: rgba(236, 254, 255, 1);      /* #ECFEFF */
```

#### Safe (Green)
```css
--category-safe: rgba(0, 201, 80, 1);             /* #00C950 */
--category-safe-light: rgba(220, 252, 231, 1);    /* #DCFCE7 */
--category-safe-bg: rgba(240, 253, 244, 1);       /* #F0FDF4 */
```

#### Malicious (Red)
```css
--category-malicious: rgba(251, 44, 54, 1);       /* #FB2C36 */
--category-malicious-light: rgba(254, 226, 226, 1);/* #FEE2E2 */
--category-malicious-bg: rgba(254, 242, 242, 1);  /* #FEF2F2 */
```

#### Risky (Orange)
```css
--category-risky: rgba(255, 105, 0, 1);           /* #FF6900 */
--category-risky-light: rgba(255, 237, 213, 1);   /* #FFEDD5 */
--category-risky-bg: rgba(255, 247, 237, 1);      /* #FFF7ED */
```

#### Restricted Content (Yellow)
```css
--category-restricted-content: rgba(240, 177, 0, 1);      /* #F0B100 */
--category-restricted-content-light: rgba(254, 249, 195, 1);/* #FEF9C3 */
--category-restricted-content-bg: rgba(254, 252, 232, 1);  /* #FEFCE8 */
```

### Text Colors
```css
--text-dark: rgba(17, 19, 47, 1);          /* #11132F - Darkest */
--text-primary: rgba(54, 65, 83, 1);       /* #364153 - Primary */
--text-secondary: rgba(74, 85, 101, 1);    /* #4A5565 - Secondary */
--text-tertiary: rgba(106, 114, 130, 1);   /* #6A7282 - Tertiary */
--text-muted-gray: rgba(153, 161, 175, 1); /* #99A1AF - Muted */
```

## Spacing System

```css
--spacing-xs: 4px;    /* Icon gaps, tight layouts */
--spacing-sm: 8px;    /* Component internal spacing */
--spacing-md: 16px;   /* Standard gaps */
--spacing-lg: 24px;   /* Section spacing */
--spacing-xl: 32px;   /* Major sections */
--spacing-2xl: 48px;  /* Page-level spacing */
--spacing-3xl: 64px;  /* Hero sections */
```

## Border Radius System

```css
--radius-xs: 3px;     /* Tiny elements */
--radius-sm: 4px;     /* Inputs, small buttons */
--radius-md: 8px;     /* Standard buttons, cards */
--radius-lg: 12px;    /* Cards, modals */
--radius-xl: 16px;    /* Large modals */
--radius-full: 9999px;/* Pills, circular badges */
```

## Shadow System

```css
--shadow-xs: 0px 0px 1px 0px rgba(12,26,75,0.24), 0px 3px 8px -1px rgba(50,50,71,0.05);
--shadow-sm: 0px 0px 1px 0px rgba(12,26,75,0.1), 0px 4px 20px -2px rgba(50,50,71,0.08);
--shadow-md: 0px 0px 1px 0px rgba(12,26,75,0.1), 0px 10px 16px 0px rgba(20,37,63,0.06);
--shadow-lg: 0px 0px 1px 0px rgba(12,26,75,0.1), 0px 20px 24px 0px rgba(20,37,63,0.06);
--shadow-xl: 0px 0px 1px 0px rgba(12,26,75,0.1), 0px 30px 40px 0px rgba(20,37,63,0.08);
--shadow-inner: inset 0px 2px 4px 0px rgba(0,0,0,0.06);
```

## Card Padding Variants

```css
--card-padding-none: 0;            /* Custom content */
--card-padding-compact: 12px;      /* Dense layouts */
--card-padding: 24px;              /* Standard cards */
--card-padding-comfortable: 32px;  /* Spacious cards */
```

## Table Padding Variants

```css
--table-cell-padding-compact: 8px 12px;        /* Dense tables */
--table-cell-padding-comfortable: 10px 16px;   /* Standard tables */
--table-cell-padding-spacious: 12px 20px;      /* Relaxed layouts */
```

## Usage Guidelines

### ✅ DO
- Use CSS variables for all colors, spacing, and typography
- Use semantic color names (e.g., `--primary`, `--category-safe`)
- Use the spacing system for consistent gaps and padding
- Use the shadow system for elevation
- Use the radius system for rounded corners

### ❌ DON'T
- Don't use hardcoded color values (e.g., `#135F82`)
- Don't use hardcoded spacing values (e.g., `padding: 24px`)
- Don't use hardcoded font sizes (e.g., `font-size: 14px`)
- Don't add Tailwind font size/weight classes unless specifically requested

## Component Examples

### Button
```tsx
<button
  style={{
    backgroundColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--font-weight-medium)',
  }}
>
  Click Me
</button>
```

### Card
```tsx
<div
  style={{
    backgroundColor: 'var(--card)',
    padding: 'var(--card-padding)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border)',
  }}
>
  Card Content
</div>
```

### Category Badge
```tsx
<div
  style={{
    backgroundColor: 'var(--category-safe-bg)',
    color: 'var(--category-safe)',
    padding: '4px var(--spacing-sm)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-caption)',
    fontWeight: 'var(--font-weight-medium)',
  }}
>
  Safe
</div>
```

## Utility Classes

The design system includes utility classes for quick styling:

### Background Colors
```css
.bg-background
.bg-card
.bg-primary
.bg-category-safe
.bg-category-malicious
/* ...and more */
```

### Text Colors
```css
.text-foreground
.text-primary
.text-secondary
.text-category-safe
/* ...and more */
```

### Border Colors
```css
.border-border
.border-primary
.border-category-safe
/* ...and more */
```

### Shadows
```css
.shadow-xs
.shadow-sm
.shadow-md
.shadow-lg
.shadow-xl
```

## File Structure

```
styles/
  └── globals.css          # Complete design system implementation
```

## Updates and Modifications

To modify the design system:
1. Edit `styles/globals.css`
2. Update CSS variable values in the `:root` selector
3. All components using the variables will automatically update

## Version

Current Version: **1.0.0**
Last Updated: November 24, 2024