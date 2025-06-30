# 🎨 GameGoUp Design System

## Overview
Professional gaming-focused design system with consistent colors, typography, spacing, and components.

## 🎨 Color Palette

### Primary Colors
- **Primary 500**: `#6366f1` - Main brand color
- **Primary 600**: `#4f46e5` - Darker variant
- **Primary 300**: `#a5b4fc` - Lighter variant

### Semantic Colors
- **Success**: `#10b981` - Green for positive actions
- **Warning**: `#f59e0b` - Orange for warnings
- **Error**: `#ef4444` - Red for errors
- **Info**: `#3b82f6` - Blue for information

### Background Colors
- **Primary**: `#0a0a0f` - Main background
- **Secondary**: `#1a1a2e` - Secondary background
- **Surface**: `#1e293b` - Card/component background

### Text Colors
- **Primary**: `#f8fafc` - Main text
- **Secondary**: `#cbd5e1` - Secondary text
- **Tertiary**: `#94a3b8` - Muted text

## 🔧 Components

### Button Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Success Action</Button>
<Button variant="danger">Danger Action</Button>
<Button variant="warning">Warning Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="neon">Neon Effect</Button>
```

### Button Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Input Variants
```tsx
<Input variant="default" label="Default Input" />
<Input variant="floating" label="Floating Label" />
<Input variant="minimal" label="Minimal Style" />
```

### Card Variants
```tsx
<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="outlined">Outlined Card</Card>
<Card variant="glass">Glass Effect</Card>
```

## 🎭 Glass Morphism
Professional glass effects for modern UI:

```css
.glass-surface          /* Standard glass effect */
.glass-surface-light    /* Lighter glass effect */
.glass-surface-strong   /* Stronger glass effect */
```

## 🌈 Gradients
Pre-defined professional gradients:

```css
.gradient-primary       /* Primary brand gradient */
.gradient-secondary     /* Secondary gradient */
.gradient-success       /* Success gradient */
.gradient-warning       /* Warning gradient */
.gradient-error         /* Error gradient */
```

## 📏 Spacing Scale
Consistent spacing using CSS custom properties:

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px

## 🔄 Transitions
Standardized transition timings:

- `--transition-fast`: 150ms ease-out
- `--transition-normal`: 250ms ease-out
- `--transition-slow`: 350ms ease-out
- `--transition-bounce`: 250ms cubic-bezier(0.68, -0.55, 0.265, 1.55)

## 🎯 Shadows
Professional shadow system:

- `shadow-professional`: Standard component shadow
- `shadow-elevated`: Elevated component shadow
- `shadow-glow-subtle`: Subtle glow effect
- `shadow-glow-strong`: Strong glow effect

## 📱 Usage Examples

### Professional Card
```tsx
<Card 
  variant="elevated" 
  padding="lg" 
  rounded="xl" 
  hover={true}
  className="border-primary-500/20"
>
  <h3 className="text-primary-300 font-bold">Card Title</h3>
  <p className="text-secondary-300">Card content</p>
</Card>
```

### Action Button
```tsx
<Button 
  variant="primary" 
  size="lg" 
  icon="🚀"
  animate={true}
  className="shadow-glow-subtle"
>
  Launch Game
</Button>
```

### Form Input
```tsx
<Input 
  variant="floating"
  label="Username"
  icon={<UserIcon />}
  success={isValid}
  error={errorMessage}
/>
```

## 🎨 Design Principles

1. **Consistency**: All components use the same color palette and spacing
2. **Professional**: Clean, modern aesthetic suitable for gaming
3. **Accessible**: High contrast ratios and clear visual hierarchy
4. **Responsive**: Works seamlessly across all device sizes
5. **Performance**: Optimized animations and effects

## 🚀 Implementation

The design system is automatically imported and available throughout the application. All components are built with these tokens for maximum consistency and maintainability.