<p align="center">
  <img src="assets/images/icon-256x256.png" alt="Arcadium Inventory" width="128">
</p>

# Arcadium Inventory

A WordPress plugin for displaying vehicle inventory with XML feed integration, sidebar filtering, URL deep linking, and automatic updates via GitHub.

**By Boileau & Co.**

## Features

- XML feed integration with WordPress transient caching
- Sidebar filters with multi-select checkboxes (condition, make, category, location, year)
- Full-text search across stock number, make, and model
- URL parameter deep linking for shareable filtered views
- Image gallery with navigation dots and prev/next controls
- Individual vehicle detail pages with full specs
- Automatic updates via GitHub Releases
- Responsive layout (sidebar collapses on mobile)

## Installation

1. Download or clone this repository
2. Upload the `arcadium-inventory` folder to `/wp-content/plugins/`
3. Activate the plugin through the **Plugins** menu in WordPress
4. Go to **Settings > Arcadium Inventory** to configure your XML feed URL

## Configuration

1. Navigate to **Settings > Arcadium Inventory**
2. Enter your **XML Feed URL**
3. Set **Cache Duration** (default: 3600 seconds / 1 hour)
4. Click **Save Settings**

### Display the Inventory

Add this shortcode to any page or post:

```
[arc_inventory]
```

## Customization

The plugin provides only structural/layout CSS. Colors, typography, and spacing are inherited from your WordPress theme. To customize the layout, override these CSS custom properties in your theme:

```css
:root {
  --arc-container-padding: 1rem;
  --arc-grid-gap: 1.25rem;
  --arc-card-padding: 1rem;
  --arc-gallery-height: 200px;
  --arc-border-radius: 4px;
  --arc-sidebar-width: 240px;
}
```

### Theme Styling

The plugin uses BEM-style class names prefixed with `arc-`. Add styles in your theme to control colors and visual treatment. Key selectors:

```css
/* Cards */
.arc-card { background: #fff; border: 1px solid #e6e6e6; }

/* Condition badges on gallery images */
.arc-badge--new { background: #10b981; }
.arc-badge--used { background: #f6ae30; }

/* Spec tags */
.arc-spec-tag--color { background: #e5e7eb; }
.arc-spec-tag--fuel { background: #dcfce7; color: #166534; }
.arc-spec-tag--type { background: #dbeafe; color: #1e40af; }

/* Gallery placeholder (no image) */
.arc-gallery-placeholder { background: #e5e7eb; color: #9ca3af; }

/* Search input focus */
.arc-filter-input:focus {
  border-color: #ff7144;
  box-shadow: 0 0 0 2px rgba(255, 113, 68, 0.1);
}

/* Detail page price */
.arc-detail-price { color: #ea580c; }
```

## URL Deep Linking

Filter state is synced to URL parameters so users can share or bookmark filtered views:

```
/inventory/?condition=Used&make=FREIGHTLINER&year=2025&year=2026
```

Multiple values for the same filter are supported. The `search` parameter is also preserved.

## REST API

The plugin registers a REST API endpoint that fetches and caches the XML feed:

```
GET /wp-json/arc/v1/inventory
```

## Releasing Updates

1. Update the version in `arcadium-inventory.php` (both the header and the `ARC_INVENTORY_VERSION` constant)
2. Commit and push to `master`
3. Create a GitHub Release with a tag matching the version (e.g., `1.2.1`)

Sites with the plugin installed will automatically detect the update.

## Project Structure

```
arcadium-inventory/
├── arcadium-inventory.php        # Main plugin file
├── includes/
│   ├── class-arc-admin.php       # Admin settings page
│   ├── class-arc-public.php      # Shortcode & asset loading
│   └── class-arc-api.php         # REST API / XML feed parser
├── assets/
│   ├── css/
│   │   ├── styles.css            # Frontend structural styles
│   │   └── admin.css             # Admin panel styles
│   └── js/
│       ├── config.js             # Namespace, config, state
│       ├── formatters.js         # Display formatting helpers
│       ├── filters.js            # Filter logic & data extraction
│       ├── gallery.js            # Image gallery component
│       ├── renderer.js           # HTML rendering & event binding
│       └── app.js                # App controller & URL sync
├── plugin-update-checker/        # GitHub update checker library
└── README.md
```

## Requirements

- WordPress 5.8+
- PHP 7.4+
- A valid XML inventory feed URL

## License

GPL v2 or later.
