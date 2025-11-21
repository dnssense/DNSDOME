# DNSDOME Design System

> Comprehensive design system with 90+ CSS variables for consistent UI development across all DNSSense applications.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Color Systems](#color-systems)
- [Typography](#typography)
- [Usage Examples](#usage-examples)
- [Integration](#integration)

---

## 🎨 Overview

This design system provides a complete set of CSS variables for:

- **90+ Semantic Colors** organized into 9 color systems
- **Typography** using Roboto font family
- **Spacing & Layout** with consistent scales
- **Borders & Radius** for unified component shapes
- **Shadows** for depth and elevation
- **Sidebar & Navigation** colors

### Key Features

✅ **CSS Variable Based** - Change once, update everywhere
✅ **Semantic Naming** - Colors organized by use case
✅ **Opacity Variants** - 6%, 10%, 20%, 30%, 50% variants included
✅ **Production Ready** - Fully documented and tested
✅ **Framework Agnostic** - Works with React, Angular, Vue, or vanilla JS

---

## 🚀 Installation

### Option 1: Direct Import

Copy `globals.css` to your project and import it:

```css
/* In your main CSS file */
@import './design-system/globals.css';
```

### Option 2: Link in HTML

```html
<link rel="stylesheet" href="/design-system/globals.css">
```

### Option 3: Import in JavaScript/TypeScript

```javascript
import './design-system/globals.css';
```

---

## 🎨 Color Systems

### 1. Category Colors (6 colors)

For content classification and data categorization:

| Variable | Color | Purpose |
|----------|-------|-------|
| `--category-total` | ![#5885EA](https://via.placeholder.com/15/5885EA/000000?text=+) Blue | Total/all items |
| `--category-restricted-content` | ![#FFC107](https://via.placeholder.com/15/FFC107/000000?text=+) Yellow | Restricted content |
| `--category-malicious` | ![#F44336](https://via.placeholder.com/15/F44336/000000?text=+) Red | Dangerous items |
| `--category-variable` | ![#9E9E9E](https://via.placeholder.com/15/9E9E9E/000000?text=+) Gray | Variable items |
| `--category-safe` | ![#4CAF50](https://via.placeholder.com/15/4CAF50/000000?text=+) Green | Safe/verified |
| `--category-new-variable` | ![#FF9800](https://via.placeholder.com/15/FF9800/000000?text=+) Orange | New variable |

### 2. Incident Colors (3 colors)

For security incidents and risk levels:

| Variable | Purpose |
|----------|-------|
| `--incident-high-risk` | Critical incidents (Red) |
| `--incident-mid-risk` | Medium severity (Orange) |
| `--incident-suspicious` | Suspicious activity (Yellow) |

### 3. Status Colors (5 colors)

For system health and operational states:

| Variable | Purpose |
|----------|-------|
| `--status-error` | Error states |
| `--status-warning` | Warning states |
| `--status-up` | Active/operational |
| `--status-down` | Inactive/down |
| `--status-stable` | Stable state |

### 4. Background Colors (16 variations)

For tables, hover states, and overlays:

- `--bg-table-hover` - Table row hover
- `--bg-table-selected` - Selected table row
- `--bg-table-zebra` - Zebra stripe
- `--bg-white`, `--bg-white-10`, `--bg-white-20`, `--bg-white-50` - White with opacity
- `--bg-black-50` - Black with 50% opacity
- `--bg-background` - Base dark background
- And more...

### 5. Tag Palette Colors (17 colors)

For tags with various opacity levels:

- Solid: `--tag-orange`, `--tag-green`, `--tag-gray`
- With opacity: `--tag-orange-10`, `--tag-orange-20`, `--tag-orange-30`
- Prime variants: `--tag-prime-06`, `--tag-prime-10`, `--tag-prime-20`, `--tag-prime-50`
- Category tags: `--tag-safe-10`, `--tag-malicious-10`, `--tag-restricted-content-10`

### 6. Line Colors (3 colors)

For chart lines and dividers:

- `--line-blue` - Primary lines
- `--line-gray` - Secondary lines  
- `--line-blue-50` - Subtle lines (50% opacity)

### 7. Badge Colors (9 vibrant colors)

For labels and badges:

- `--badge-nature`, `--badge-green`, `--badge-blue`
- `--badge-orange`, `--badge-purple`, `--badge-red`
- `--badge-yellow`, `--badge-teal`, `--badge-gray-2`

### 8. Selection Colors (11 colors)

For selected states and interactive elements:

- `--selection-color-white`, `--selection-color-dark`, `--selection-color-lite`
- `--selection-status-up`, `--selection-status-down`
- `--selection-color-prime`, `--selection-tag-green`
- `--selection-color-gray`

### 9. Cell Colors (8 colors)

For table cells and data grids:

- `--cella-white` - Default cell
- `--cella-prime` - Primary cell
- `--cella-hover` - Hover state
- `--cella-pressed` - Pressed state
- `--cella-dark`, `--cella-gray`, `--cella-litle`, `--cella-ice-blue`

---

## 🔤 Typography

### Font Family

**Roboto** - Used exclusively across all text

```css
font-family: 'Roboto', sans-serif;
```

### Font Sizes

| Variable | Size | Usage |
|----------|------|-------|
| `--text-h1` | 36px | Page titles |
| `--text-h2` | 32px | Section headers |
| `--text-h3` | 28px | Subsection headers |
| `--text-h4` | 24px | Component headers |
| `--text-base` | 14px | Body text, buttons |
| `--text-label` | 12px | Labels, small buttons |
| `--text-caption` | 12px | Captions, meta text |
| `--text-section-heading` | 10px | Section headings (uppercase) |

### Font Weights

- `--font-weight-normal`: 400 (Regular)
- `--font-weight-medium`: 500 (Medium)

---

## 💡 Usage Examples

### Category Indicators

```html
<!-- Safe content indicator -->
<div style="background-color: var(--category-safe); color: white; padding: 8px; border-radius: var(--radius);">
  Safe Content
</div>

<!-- Malicious content indicator -->
<div style="background-color: var(--category-malicious); color: white; padding: 8px; border-radius: var(--radius);">
  Malicious Content  
</div>
```

### Status Badges

```html
<!-- System up -->
<span style="background-color: var(--status-up); color: white; padding: 4px 12px; border-radius: var(--radius);">
  ● Online
</span>

<!-- System down -->
<span style="background-color: var(--status-down); color: white; padding: 4px 12px; border-radius: var(--radius);">
  ● Offline
</span>
```

### Table with Interactive States

```html
<table>
  <tr style="background-color: var(--cella-white);">
    <td>Normal row</td>
  </tr>
  <tr style="background-color: var(--cella-hover);">
    <td>Hover state</td>
  </tr>
  <tr style="background-color: var(--bg-table-selected);">
    <td>Selected row</td>
  </tr>
</table>
```

### Badges

```html
<span style="background-color: var(--badge-blue); color: white; padding: 4px 8px; border-radius: var(--radius);">
  New
</span>
<span style="background-color: var(--badge-purple); color: white; padding: 4px 8px; border-radius: var(--radius);">
  Premium
</span>
<span style="background-color: var(--badge-green); color: white; padding: 4px 8px; border-radius: var(--radius);">
  Active
</span>
```

### Typography

```html
<h1 style="font-family: 'Roboto', sans-serif; font-size: var(--text-h1); color: var(--foreground);">
  Page Title
</h1>

<p style="font-family: 'Roboto', sans-serif; font-size: var(--text-base); color: var(--foreground);">
  Body text using the base font size.
</p>

<span class="caption" style="color: var(--muted);">
  Caption text
</span>
```

### React/JSX Example

```jsx
// Category indicator component
function CategoryBadge({ category }) {
  const categoryColors = {
    safe: 'var(--category-safe)',
    malicious: 'var(--category-malicious)',
    restricted: 'var(--category-restricted-content)'
  };
  
  return (
    <div style={{
      backgroundColor: categoryColors[category],
      color: 'white',
      padding: '4px 12px',
      borderRadius: 'var(--radius)',
      fontSize: 'var(--text-label)',
      fontFamily: 'Roboto, sans-serif'
    }}>
      {category}
    </div>
  );
}

// Status indicator
function StatusIndicator({ isUp }) {
  return (
    <span style={{
      backgroundColor: isUp ? 'var(--status-up)' : 'var(--status-down)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: 'var(--radius)',
      fontSize: 'var(--text-caption)'
    }}>
      {isUp ? '● Online' : '● Offline'}
    </span>
  );
}
```

### Angular Example

```typescript
// component.ts
@Component({
  selector: 'app-category-badge',
  template: `
    <div [style.background-color]="getCategoryColor()"
         [style.color]="'white'"
         [style.padding]="'4px 12px'"
         [style.border-radius]="'var(--radius)'">
      {{ category }}
    </div>
  `
})
export class CategoryBadgeComponent {
  @Input() category: string;
  
  getCategoryColor(): string {
    const colors = {
      'safe': 'var(--category-safe)',
      'malicious': 'var(--category-malicious)',
      'restricted': 'var(--category-restricted-content)'
    };
    return colors[this.category] || 'var(--category-variable)';
  }
}
```

---

## 🔧 Integration

### With Tailwind CSS

The design system works alongside Tailwind. Use CSS variables for semantic colors:

```html
<div class="p-4 rounded-lg" style="background-color: var(--category-safe);">
  Safe content
</div>
```

### With CSS-in-JS (styled-components, emotion)

```javascript
import styled from 'styled-components';

const CategoryBadge = styled.div`
  background-color: var(--category-${props => props.category});
  color: white;
  padding: 4px 12px;
  border-radius: var(--radius);
  font-family: 'Roboto', sans-serif;
  font-size: var(--text-label);
`;
```

### With vanilla CSS

```css
.safe-indicator {
  background-color: var(--category-safe);
  color: white;
  padding: 8px;
  border-radius: var(--radius);
}

.status-badge {
  background-color: var(--status-up);
  font-family: 'Roboto', sans-serif;
  font-size: var(--text-caption);
}
```

---

## 📊 Complete Variable Reference

### Base Colors
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--success`
- `--border`, `--input`, `--ring`

### Sidebar Colors
- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

### Chart Colors
- `--chart-1` through `--chart-5`

### Shadows
- `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- `--shadow-inner`

### Border Radius
- `--radius` (6px)
- `--radius-card` (12px)
- `--radius-button` (200px)

---

## 📈 Statistics

- **Total Variables**: 90+
- **Color Systems**: 9
- **Typography Sizes**: 8
- **Shadow Levels**: 6
- **Framework**: Agnostic
- **Browser Support**: All modern browsers

---

## 🤝 Contributing

To add new colors or modify existing ones, edit `globals.css` and follow these conventions:

1. **Naming**: Use semantic names (e.g., `--status-active` not `--green-500`)
2. **Organization**: Group related variables together
3. **Documentation**: Add inline comments explaining purpose
4. **Format**: Use `rgba()` format for all colors

---

## 📝 License

Copyright © 2024 DNSSense. All rights reserved.

---

## 🔗 Links

- Repository: https://github.com/dnssense/DNSDOME
- Website: [DNSSense](https://www.dnssense.com)

---

**Built with ❤️ by the DNSSense team**