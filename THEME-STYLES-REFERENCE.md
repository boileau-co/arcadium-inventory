# Theme Styling Reference

Add these styles to your WordPress theme's CSS to make the inventory match your site's design.

Based on WMI Trucks site colors and styling.

## Add to Your Theme's CSS

```css
/**
 * Arcadium Inventory - WMI Theme Customization
 */

/* Cards */
.arc-card {
  background: #fff;
  border: 1px solid #E6E6E6;
}

.arc-card:hover {
  box-shadow: 6px 6px 9px rgba(0,0,0,0.2);
}

/* Condition Badges (on photos) */
.arc-badge--new {
  background: #10b981; /* or your preferred "new" color */
}

.arc-badge--used {
  background: #F6AE30; /* yellow-orange from your site */
}

/* Stats Badges (header) */
.arc-stat-badge--new {
  background: #d1fae5;
  color: #047857;
}

.arc-stat-badge--used {
  background: #fff3cd;
  color: #b45309;
}

.arc-stat-badge--photos {
  background: #dbeafe;
  color: #1d4ed8;
}

/* Price */
.arc-card-price {
  color: #FF7144; /* Your primary orange accent */
  font-size: 1.25rem;
}

/* Stock Number Badge */
.arc-card-stock {
  background: #E6E6E6;
  color: #272623;
}

/* Spec Tags */
.arc-spec-tag--color {
  background: #E6E6E6;
  color: #272623;
}

.arc-spec-tag--engine {
  background: #abb8c3;
  color: #272623;
}

.arc-spec-tag--hp {
  background: #F6AE30;
  color: #272623;
}

.arc-spec-tag--fuel {
  background: #10b981;
  color: white;
}

/* Form Inputs */
.arc-filter-input,
.arc-filter-select {
  background: #fff;
  border: 1px solid #E6E6E6;
  color: #272623;
}

.arc-filter-input:focus,
.arc-filter-select:focus {
  outline: none;
  border-color: #FF7144;
  box-shadow: 0 0 0 2px rgba(255, 113, 68, 0.1);
}

/* Clear Filters Button */
.arc-btn-clear {
  color: #272623;
}

.arc-btn-clear:hover {
  background: #E6E6E6;
}

/* Filter Labels */
.arc-filter-label {
  color: #666;
}

/* Gallery Placeholder (no image) */
.arc-gallery-placeholder {
  background: #E6E6E6;
  color: #999;
}

/* Card Details Text */
.arc-card-model,
.arc-card-detail {
  color: #666;
}

/* Empty/Error States */
.arc-empty-title {
  color: #272623;
}

.arc-error-title {
  color: #E9453A; /* Your red-orange accent */
}

.arc-empty-text,
.arc-error-text,
.arc-loading-text {
  color: #999;
}

/* Optional: Adjust spacing to match your site */
:root {
  --arc-container-padding: 1.5rem;
  --arc-grid-gap: 2rem;
  --arc-card-padding: 1.25rem;
}

/* Optional: Dark background variant (if placing on dark section) */
.dark-section .arc-inventory {
  color: #fff;
}

.dark-section .arc-card {
  background: #1a1a1a;
  border-color: #333;
}

.dark-section .arc-card-detail,
.dark-section .arc-card-model {
  color: #ccc;
}
```

## CSS Custom Properties Override

You can also use CSS custom properties for quick adjustments:

```css
.arc-inventory {
  --arc-container-padding: 2rem;
  --arc-grid-gap: 1.5rem;
  --arc-card-padding: 1.5rem;
  --arc-gallery-height: 250px;
  --arc-border-radius: 4px; /* Already matches your site */
}
```

## Integration Notes

1. **Add to your theme's style.css** or custom CSS panel
2. **Adjust colors** to match your exact brand colors
3. **Test on both light and dark backgrounds** if applicable
4. **Consider mobile spacing** - may want different padding on small screens

## Quick Color Reference from Your Site

- **Off-black text:** `#272623`
- **Neon orange (primary):** `#FF7144`
- **Red-orange (secondary):** `#E9453A`
- **Yellow-orange:** `#F6AE30`
- **Light gray:** `#E6E6E6`
- **Cyan-gray:** `#abb8c3`
