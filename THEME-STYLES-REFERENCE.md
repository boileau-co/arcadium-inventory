# Theme Styling Reference

Add these styles to your WordPress theme's SCSS to make the inventory match your site's design.

Based on WMI Trucks site colors and styling.

## Add to Your Theme's SCSS

```scss
/**
 * Arcadium Inventory - WMI Theme Customization
 */

// Color Variables
$color-dark: #272623;
$color-orange: #FF7144;
$color-red-orange: #E9453A;
$color-yellow: #F6AE30;
$color-light-gray: #E6E6E6;
$color-cyan-gray: #abb8c3;
$color-green: #10b981;
$color-text-muted: #666;
$color-text-light: #999;

// Cards
.arc-card {
  background: #fff;
  border: 1px solid $color-light-gray;

  &:hover {
    box-shadow: 6px 6px 9px rgba(0, 0, 0, 0.2);
  }
}

// Condition Badges (on photos)
.arc-badge {
  &--new {
    background: $color-green;
  }

  &--used {
    background: $color-yellow;
  }
}

// Stats Badges (header)
.arc-stat-badge {
  &--new {
    background: #d1fae5;
    color: #047857;
  }

  &--used {
    background: #fff3cd;
    color: #b45309;
  }

  &--photos {
    background: #dbeafe;
    color: #1d4ed8;
  }
}

// Price
.arc-card-price {
  color: $color-orange;
  font-size: 1.25rem;
}

// Stock Number Badge
.arc-card-stock {
  background: $color-light-gray;
  color: $color-dark;
}

// Spec Tags
.arc-spec-tag {
  &--color {
    background: $color-light-gray;
    color: $color-dark;
  }

  &--engine {
    background: $color-cyan-gray;
    color: $color-dark;
  }

  &--hp {
    background: $color-yellow;
    color: $color-dark;
  }

  &--fuel {
    background: $color-green;
    color: white;
  }
}

// Form Inputs
.arc-filter-input,
.arc-filter-select {
  background: #fff;
  border: 1px solid $color-light-gray;
  color: $color-dark;

  &:focus {
    outline: none;
    border-color: $color-orange;
    box-shadow: 0 0 0 2px rgba(255, 113, 68, 0.1);
  }
}

// Clear Filters Button
.arc-btn-clear {
  color: $color-dark;

  &:hover {
    background: $color-light-gray;
  }
}

// Filter Labels
.arc-filter-label {
  color: $color-text-muted;
}

// Gallery Placeholder (no image)
.arc-gallery-placeholder {
  background: $color-light-gray;
  color: $color-text-light;
}

// Card Details Text
.arc-card-model,
.arc-card-detail {
  color: $color-text-muted;
}

// Empty/Error States
.arc-empty-title {
  color: $color-dark;
}

.arc-error-title {
  color: $color-red-orange;
}

.arc-empty-text,
.arc-error-text,
.arc-loading-text {
  color: $color-text-light;
}

// Optional: Adjust spacing to match your site
:root {
  --arc-container-padding: 1.5rem;
  --arc-grid-gap: 2rem;
  --arc-card-padding: 1.25rem;
}

// Optional: Dark background variant (if placing on dark section)
.dark-section {
  .arc-inventory {
    color: #fff;
  }

  .arc-card {
    background: #1a1a1a;
    border-color: #333;
  }

  .arc-card-detail,
  .arc-card-model {
    color: #ccc;
  }
}
```

## CSS Custom Properties Override

You can also use CSS custom properties for quick adjustments:

```scss
.arc-inventory {
  --arc-container-padding: 2rem;
  --arc-grid-gap: 1.5rem;
  --arc-card-padding: 1.5rem;
  --arc-gallery-height: 250px;
  --arc-border-radius: 4px; // Already matches your site
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
