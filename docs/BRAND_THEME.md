# BidDeed.AI Brand Theme for shadcn/ui

Everest Capital USA - Agentic AI Ecosystem

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Navy Blue | `#1e3a5f` | Primary - buttons, headers, sidebar |
| Orange | `#f97316` | Accent - CTAs, highlights, focus rings |
| Teal Pastel | `#5eead4` | Secondary - badges, success states, charts |
| Black | `#0a0a0a` | Foreground text |
| White | `#fafafa` | Background |

## Typography

- **Headings**: Plus Jakarta Sans (Bold)
- **Body**: Plus Jakarta Sans (Regular)
- **Code**: JetBrains Mono

## Installation

### Option 1: Drop into existing brevard-bidder-landing

```bash
# Copy files to your repo
cp globals.css src/globals.css
cp tailwind.config.ts tailwind.config.ts
cp components.json components.json

# Install dependencies
npm install tailwindcss-animate
```

### Option 2: Fresh shadcn project with theme

```bash
# Create new Vite + React project
npm create vite@latest biddeed-landing -- --template react-ts
cd biddeed-landing

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
npx tailwindcss init -p

# Initialize shadcn/ui
npx shadcn@latest init

# Replace generated files with BidDeed.AI theme
# (use globals.css, tailwind.config.ts, components.json from this package)

# Add components
npx shadcn@latest add button card badge input
```

## Usage Examples

### Primary Button (Navy)
```tsx
<Button>Get Started</Button>
```

### Accent Button (Orange CTA)
```tsx
<Button variant="accent" className="glow-orange">
  Start Free Trial
</Button>
```

### Secondary Badge (Teal)
```tsx
<Badge variant="secondary">Verified</Badge>
```

### Brand Gradient Background
```tsx
<div className="bg-brand-gradient text-white p-8">
  Hero Section
</div>
```

### Dark Mode
Theme automatically switches based on `.dark` class on `<html>`.

## Custom Utilities

| Class | Effect |
|-------|--------|
| `bg-brand-gradient` | Navy → Teal gradient |
| `bg-cta-gradient` | Orange gradient for CTAs |
| `bg-navy-overlay` | Dark overlay for hero sections |
| `glow-teal` | Teal box shadow glow |
| `glow-orange` | Orange box shadow glow |
| `text-brand-gradient` | Navy → Orange text gradient |
| `animate-pulse-teal` | Pulsing teal glow animation |
| `animate-slide-up` | Slide up fade-in animation |

## Deploying to Cloudflare Pages

brevard-bidder-landing auto-deploys on push to main:

```bash
git add .
git commit -m "feat: BidDeed.AI brand theme"
git push origin main
```

Live at: https://brevard-bidder-landing.pages.dev
