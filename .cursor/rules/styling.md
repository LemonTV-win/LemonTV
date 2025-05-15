---
description: Styling considerations
globs: '**/*.svelte','**/*.css'
alwaysApply: false
---

# LemonTV Styling Guide

## Design System

### Colors
- Primary background: Dark gradient from gray-950 to gray-900
- Text: White
- Glass elements: Gradient from slate-600/60 to slate-800 with backdrop blur
- Borders: White with 30% opacity
- Hover states: White with 5-10% opacity

### Components

#### Glass Card
```svelte
<div class="glass-card">
  <!-- Content -->
</div>
```
- Features a glass-morphism effect
- Hover animation: Scale up to 105% with increased brightness
- Shadow effect on hover
- Smooth transition (200ms duration)

#### Glass Table
```svelte
<table class="glass-table">
  <!-- Table content -->
</table>
```
- Glass-morphism effect with backdrop blur
- Hover effect on rows
- Border styling for headers and rows
- Smooth transitions

#### Glass Card Bottom Button
```svelte
<button class="glass-card-bottom-button">
  <!-- Button content -->
</button>
```
- Full width
- Rounded bottom corners
- Hover animation with scale and glow effect
- Semi-transparent background

### Layout Guidelines

1. **Container Usage**
   - Use `glass-card-container` for card groups
   - Apply shadow effects for depth

2. **Spacing**
   - Follow Tailwind's spacing scale
   - Use consistent padding/margin values

3. **Responsive Design**
   - Use Tailwind's responsive prefixes
   - Maintain glass effect across breakpoints

### Animation Guidelines

1. **Transitions**
   - Duration: 200ms
   - Properties: all
   - Timing: default (ease)

2. **Hover Effects**
   - Scale: 105%
   - Background opacity changes
   - Shadow enhancements

### Best Practices

1. **Component Structure**
   - Use semantic HTML elements
   - Maintain consistent class ordering
   - Group related styles together

2. **Glass Effect Implementation**
   - Always include backdrop-blur
   - Use gradient backgrounds
   - Maintain consistent border opacity

3. **Accessibility**
   - Ensure sufficient contrast
   - Maintain readable text sizes
   - Provide hover state alternatives

### Code Examples

#### Basic Card
```svelte
<div class="glass-card p-4">
  <h2 class="text-xl font-bold">Title</h2>
  <p class="mt-2">Content</p>
</div>
```

#### Table Row
```svelte
<tr class="border-y border-gray-500 px-4 py-2">
  <td>Content</td>
</tr>
```

#### Button
```svelte
<button class="glass-card-bottom-button">
  Click Me
</button>
```

### Custom Classes

The project uses several custom utility classes:

1. `glass`: Base glass effect
2. `glass-card`: Card with hover effects
3. `glass-table`: Table with glass styling
4. `glass-card-container`: Container for glass cards
5. `glass-card-bottom-button`: Specialized button style

### Theme Variables

```css
:root {
  --font-emoji: 'Noto Color Emoji', sans-serif;
  --font-saira: 'Saira Variable', 'Noto Sans CJK JP', sans-serif;
}
```

### Maintenance

1. **Adding New Styles**
   - Add to appropriate layer in app.css
   - Follow existing naming conventions
   - Document new components

2. **Modifying Existing Styles**
   - Maintain backward compatibility
   - Update documentation
   - Test across breakpoints

3. **Performance**
   - Minimize custom CSS
   - Use Tailwind utilities when possible
   - Optimize transitions 
