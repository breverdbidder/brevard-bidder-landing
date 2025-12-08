# BrevardBidderAI Design System
## Based on Vibe Coding Community Best Practices
## Author: Ariel Shapira, Solo Founder, Everest Capital USA

---

## Implementation Status

| Recommendation | Status | Implementation |
|----------------|--------|----------------|
| **Shadcn UI** | ✅ IMPLEMENTED | `components/ui.jsx` (Shadcn-inspired) |
| **Tailwind** | ✅ IMPLEMENTED | `tailwind.config.js` with custom theme |
| **Inter Font** | ✅ IMPLEMENTED | Google Fonts import |
| **Geist Mono** | ✅ IMPLEMENTED | For code/numbers |
| **Recharts** | ✅ IMPLEMENTED | Pie charts, line charts |
| **Dark Mode** | ✅ IMPLEMENTED | Class-based toggle |
| **Animations** | ✅ IMPLEMENTED | fadeIn, slideUp, hover effects |
| **Glass Morphism** | ✅ IMPLEMENTED | `.glass` utility class |
| **V0.dev** | ⏳ QUEUED | For future iterations |
| **21st.dev** | ⏳ QUEUED | For future iterations |
| **TypeScript** | ⏳ QUEUED | Migration planned |
| **Framer Motion** | ⏳ QUEUED | CSS animations for now |

---

## Color Palette

### Brand Colors
```css
Primary:     #3b82f6 (Blue 500)
Secondary:   #8b5cf6 (Purple 500)
Accent:      #ec4899 (Pink 500)
```

### Recommendation Colors
```css
BID:         #22c55e (Green 500)
REVIEW:      #f59e0b (Amber 500)
SKIP:        #ef4444 (Red 500)
```

### Neutral Scale (Dark Mode)
```css
Background:  #09090b (Neutral 950)
Surface:     #18181b (Neutral 900)
Border:      #27272a (Neutral 800)
Muted:       #71717a (Neutral 500)
Text:        #fafafa (Neutral 50)
```

---

## Typography

### Font Stack
```css
Sans:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif
Mono:  'Geist Mono', 'JetBrains Mono', monospace
```

### Scale
```
xs:   0.75rem  (12px)
sm:   0.875rem (14px)
base: 1rem    (16px)
lg:   1.125rem (18px)
xl:   1.25rem  (20px)
2xl:  1.5rem   (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem  (36px)
```

---

## Components

### Button
```jsx
<Button variant="default|secondary|outline|ghost|success|warning|danger" />
<Button size="sm|md|lg|xl" />
<Button loading={true} />
<Button icon={<Icon />}>Label</Button>
```

### Card
```jsx
<Card hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Badge
```jsx
<Badge variant="default|primary|success|warning|danger|bid|review|skip" />
<Badge size="sm|md|lg" />
```

### Table
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### StatCard
```jsx
<StatCard
  title="Label"
  value="100"
  change="+10%"
  changeType="positive|negative|neutral"
  icon={<Icon />}
/>
```

### PropertyCard (BrevardBidderAI specific)
```jsx
<PropertyCard
  address="123 Main St"
  caseNumber="05-2024-CA-012345"
  judgment={185000}
  openingBid={138750}
  recommendation="BID|REVIEW|SKIP"
  mlProbability={72}
  photo="/photo.jpg"
  onClick={() => {}}
/>
```

---

## CSS Utilities

### Glass Morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Gradients
```css
.gradient-text    /* Blue → Purple text */
.gradient-border  /* Gradient border effect */
.gradient-bg      /* Subtle gradient background */
```

### Hover Effects
```css
.hover-lift   /* Lift + shadow on hover */
.hover-glow   /* Blue glow on hover */
.hover-scale  /* Scale up on hover */
```

### Animations
```css
.animate-fadeIn      /* Fade in with slide up */
.animate-slideUp     /* Slide up entrance */
.animate-pulse-glow  /* Pulsing glow effect */
.delay-100 through .delay-500  /* Staggered delays */
```

---

## Dark Mode

Toggle with class on root element:
```html
<div class="dark">
  <!-- Dark mode content -->
</div>
```

All components automatically adapt to dark mode.

---

## File Structure

```
brevard-bidder-landing/
├── components/
│   ├── ui.jsx              # Shadcn-style component library
│   └── MetricsDashboard.jsx # KPI dashboard
├── pages/
│   └── index.jsx           # Main landing page
├── styles/
│   └── globals.css         # Global styles + utilities
├── tailwind.config.js      # Tailwind configuration
└── api/
    ├── auctions.js         # Auction data endpoint
    ├── analyze.js          # Smart Router endpoint
    ├── calendar.js         # Schedule endpoint
    └── checkpoint.js       # Session checkpoint endpoint
```

---

## Usage Examples

### Property Listing
```jsx
{auctions.map((auction) => (
  <PropertyCard
    key={auction.case_number}
    address={auction.property_address}
    caseNumber={auction.case_number}
    judgment={auction.judgment_amount}
    openingBid={auction.opening_bid}
    recommendation={auction.recommendation}
    mlProbability={auction.ml_probability}
    photo={auction.photo_url}
  />
))}
```

### Stats Dashboard
```jsx
<div className="grid grid-cols-4 gap-4">
  <StatCard title="Total" value={stats.total} icon="🏠" />
  <StatCard title="BID" value={stats.bid} changeType="positive" />
  <StatCard title="REVIEW" value={stats.review} changeType="neutral" />
  <StatCard title="SKIP" value={stats.skip} changeType="negative" />
</div>
```

---

## Next Steps

1. **V0.dev Integration** - Generate complex components
2. **21st.dev Components** - AI-first interactive elements
3. **TypeScript Migration** - Type safety for all components
4. **Framer Motion** - Advanced animations
5. **Storybook** - Component documentation

---

*Design System v1.0 - December 8, 2025*
