# Music Streaming App - Design Specification

## Design System

### Color Palette

#### Primary Colors
- **Primary 500**: `#0ea5e9` - Main brand color, used for CTAs and highlights
- **Primary 600**: `#0284c7` - Hover states for primary actions
- **Primary 700**: `#0369a1` - Active states

#### Dark Theme
- **Dark 950**: `#020617` - Main background
- **Dark 900**: `#0f172a` - Card backgrounds, sidebar
- **Dark 800**: `#1e293b` - Hover states, borders
- **Dark 700**: `#334155` - Secondary borders
- **Dark 600**: `#475569` - Disabled states
- **Dark 400**: `#94a3b8` - Secondary text
- **Dark 300**: `#cbd5e1` - Tertiary text
- **Dark 50**: `#f8fafc` - Primary text

#### Accent Colors
- **Success**: `#10b981` - Success states, confirmations
- **Warning**: `#f59e0b` - Warnings, alerts
- **Error**: `#ef4444` - Errors, destructive actions
- **Premium**: `#fbbf24` - Premium features, crown icon

### Typography

#### Font Family
- **Primary**: System font stack (San Francisco, Segoe UI, Roboto, etc.)
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

#### Font Sizes
- **Display**: 60px (3.75rem) - Page titles
- **H1**: 48px (3rem) - Section headers
- **H2**: 32px (2rem) - Subsection headers
- **H3**: 24px (1.5rem) - Card titles
- **Body**: 16px (1rem) - Default text
- **Small**: 14px (0.875rem) - Secondary text
- **Tiny**: 12px (0.75rem) - Captions, metadata

#### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings, CTAs

### Spacing Scale
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

### Border Radius
- **sm**: 4px - Small elements
- **md**: 8px - Cards, buttons
- **lg**: 12px - Large cards
- **xl**: 16px - Modals
- **full**: 9999px - Pills, circular elements

### Shadows
- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

## Component Specifications

### Buttons

#### Primary Button
- Background: Primary 600
- Text: White
- Padding: 12px 24px
- Border radius: 8px
- Hover: Primary 700
- Active: Primary 800
- Focus: 2px ring Primary 500

#### Secondary Button
- Background: Dark 800
- Text: Dark 100
- Padding: 12px 24px
- Border radius: 8px
- Hover: Dark 700
- Active: Dark 600

#### Icon Button
- Size: 40px × 40px
- Border radius: Full
- Hover: Scale 1.05
- Active: Scale 0.95

### Cards

#### Song Card
- Aspect ratio: 1:1 (square)
- Border radius: 8px
- Hover: Border color changes to Dark 700
- Play button: Appears on hover, bottom-right corner
- Transition: All 200ms ease

#### Playlist Card
- Similar to Song Card
- Shows playlist cover or gradient
- Displays song count

### Player Bar

#### Layout
- Fixed bottom position
- Height: 90px
- Background: Dark 900
- Border top: 1px Dark 800
- Z-index: 50

#### Sections
1. **Current Song** (left, 256px)
   - Album art: 56px × 56px
   - Title and artist info
   - Like button

2. **Controls** (center, flexible)
   - Playback controls
   - Progress bar
   - Time indicators

3. **Volume** (right, 128px)
   - Volume icon
   - Volume slider

### Navigation

#### Sidebar
- Width: 256px
- Background: Dark 900
- Border right: 1px Dark 800
- Fixed position

#### Nav Items
- Padding: 12px 16px
- Border radius: 8px
- Active: Background Dark 800, Text Primary 500
- Hover: Background Dark 800

### Forms

#### Input Fields
- Height: 40px
- Padding: 12px 16px
- Background: Dark 900
- Border: 1px Dark 700
- Border radius: 8px
- Focus: Ring 2px Primary 500

#### Search Bar
- Height: 48px
- Icon: Left-aligned, 20px
- Padding left: 48px (to accommodate icon)
- Suggestions dropdown: Appears below, max 5 items

## Wireframes

### Desktop Layout (1920×1080)

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar (256px)    │ Main Content Area                      │
│                    │                                         │
│ Logo               │ ┌─────────────────────────────────┐   │
│                    │ │ Page Header                     │   │
│ • Home             │ │ Title, Actions                  │   │
│ • Search           │ └─────────────────────────────────┘   │
│ • Library          │                                         │
│ • Liked Songs      │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│                    │ │   │ │   │ │   │ │   │ │   │ │   │ │
│                    │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │
│                    │ │   │ │   │ │   │ │   │ │   │ │   │ │
│                    │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
│                    │                                         │
│ ─────────────────  │ Section Title                          │
│                    │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ │
│ • Profile          │ │   │ │   │ │   │ │   │ │   │ │   │ │
│ • Admin            │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │
│                    │ │   │ │   │ │   │ │   │ │   │ │   │ │
│                    │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ │
└────────────────────┴─────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ Player Bar (90px height)                                    │
│ [Album] Song Title    [◄◄] [▶] [►►] ━━━━━━━━━━━ 2:34  🔊━━ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375×812)

```
┌─────────────────────┐
│ ☰  MusicStream   🔍 │
├─────────────────────┤
│                     │
│  ┌───┐ ┌───┐       │
│  │   │ │   │       │
│  │ 1 │ │ 2 │       │
│  │   │ │   │       │
│  └───┘ └───┘       │
│                     │
│  ┌───┐ ┌───┐       │
│  │   │ │   │       │
│  │ 3 │ │ 4 │       │
│  │   │ │   │       │
│  └───┘ └───┘       │
│                     │
│  Section Title      │
│  ┌───┐ ┌───┐       │
│  │   │ │   │       │
│  │ 1 │ │ 2 │       │
│  │   │ │   │       │
│  └───┘ └───┘       │
│                     │
├─────────────────────┤
│ Player Bar          │
│ [Album] Song        │
│ [◄◄] [▶] [►►]      │
│ ━━━━━━━━━━━ 2:34   │
├─────────────────────┤
│ 🏠  🔍  📚  👤     │
└─────────────────────┘
```

## Micro-interactions

### Hover States
- **Cards**: Border color transition (200ms), scale 1.02
- **Buttons**: Background color transition (200ms)
- **Play button**: Fade in (200ms), scale 1.05
- **Nav items**: Background color transition (150ms)

### Active States
- **Buttons**: Scale 0.98
- **Sliders**: Thumb scale 1.2
- **Cards**: Scale 0.98

### Loading States
- **Skeleton screens**: Animated gradient shimmer
- **Spinners**: Rotating animation (1s linear infinite)
- **Progress bars**: Indeterminate animation

### Like Animation
- **Heart icon**: Scale 1.3 → 1.0 (300ms ease-out)
- **Color**: Gray → Red
- **Fill**: Animate from empty to filled

### Queue Animations
- **Add to queue**: Slide in from right (300ms)
- **Remove from queue**: Slide out to right (300ms)
- **Reorder**: Smooth position transition (200ms)

### Player Transitions
- **Song change**: Crossfade album art (500ms)
- **Play/Pause**: Icon morph (200ms)
- **Progress bar**: Smooth update (100ms)

## Accessibility

### Keyboard Navigation
- **Tab order**: Logical flow (sidebar → main content → player)
- **Focus indicators**: 2px ring Primary 500
- **Skip links**: "Skip to main content" at top
- **Shortcuts**:
  - Space: Play/Pause
  - →: Next track
  - ←: Previous track
  - ↑: Volume up
  - ↓: Volume down

### Screen Reader Support
- **ARIA labels**: All interactive elements
- **ARIA live regions**: Player updates, notifications
- **Semantic HTML**: Proper heading hierarchy
- **Alt text**: All images and icons
- **Role attributes**: Navigation, main, complementary

### Color Contrast
- **Text on Dark 950**: Minimum 7:1 ratio
- **Primary on Dark 900**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 ratio

### Focus Management
- **Modal dialogs**: Trap focus within modal
- **Dropdowns**: Focus first item on open
- **Forms**: Focus first error on submit

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1920px

### Mobile Adaptations
- Sidebar becomes bottom navigation
- Grid columns: 2 (songs), 1 (playlists)
- Player bar: Simplified controls
- Search: Full-screen overlay

### Tablet Adaptations
- Sidebar remains visible
- Grid columns: 3-4
- Player bar: Full controls
- Search: Inline with filters

## Performance Considerations

### Image Optimization
- **Lazy loading**: Below-the-fold images
- **Responsive images**: Multiple sizes via srcset
- **WebP format**: With JPEG fallback
- **Blur placeholder**: Low-quality image placeholder

### Animation Performance
- **GPU acceleration**: transform and opacity only
- **Reduced motion**: Respect prefers-reduced-motion
- **Debouncing**: Search input (300ms)
- **Throttling**: Scroll events (100ms)

### Code Splitting
- **Route-based**: Lazy load page components
- **Component-based**: Lazy load heavy components
- **Vendor splitting**: Separate bundle for dependencies
