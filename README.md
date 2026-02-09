# Arcadium Inventory

A WordPress plugin for displaying vehicle inventory with XML feed integration, advanced filtering, and automatic updates via GitHub.

**By Boileau & Co.**

## Features

- 🚗 Display vehicle inventory with advanced filtering
- 📡 XML feed integration with intelligent caching
- 🔄 Automatic updates via GitHub Releases
- 🎨 Fully customizable with CSS custom properties
- 📱 Responsive design
- ⚡ Performance optimized with WordPress transients
- 🔍 Search, filter by condition, make, and image availability

## Installation

### Manual Installation

1. Download or clone this repository
2. Upload the `arcadium-inventory` folder to `/wp-content/plugins/`
3. Activate the plugin through the **Plugins** menu in WordPress
4. Go to **Settings → Arcadium Inventory** to configure

### GitHub Updater (for Automatic Updates)

1. Install [GitHub Updater](https://github.com/afragen/github-updater) plugin
2. Activate GitHub Updater
3. Your plugin will automatically check for updates from this repository

## Configuration

### Basic Setup

1. Navigate to **Settings → Arcadium Inventory**
2. Enter your **XML Feed URL**
3. Set **Cache Duration** (default: 3600 seconds / 1 hour)
4. Configure **Items Per Page** (default: 12)
5. Click **Save Settings**

### Display the Inventory

Add this shortcode to any page or post:

```
[arc_inventory]
```

**Optional parameters:**
```
[arc_inventory container_class="my-custom-class"]
```

## GitHub Updater Setup

To enable automatic updates via GitHub releases:

### Update Version Number

When ready to release, update the version in `arcadium-inventory.php`:

```php
* Version: 1.0.1
define('ARC_INVENTORY_VERSION', '1.0.1');
```

### Create a GitHub Release

1. Commit and push your changes
2. Go to your repository on GitHub
3. Click **Releases** → **Create a new release**
4. **Tag version:** `1.0.1` (must match plugin version)
5. **Release title:** `Version 1.0.1`
6. Describe the changes
7. Click **Publish release**

WordPress sites with GitHub Updater will automatically detect and offer the update!

## Development & Testing

### Local Testing (No WordPress Required)

For development and testing the frontend JavaScript app:

1. Open `test-local.html` in VS Code
2. Right-click → **Open with Live Preview** (or use Live Server extension)
3. Test all features: filtering, search, pagination, gallery

The test page uses sample data from `assets/data/inventory.json`.

### Project Structure

```
arcadium-inventory/
├── arcadium-inventory.php      # Main plugin file
├── includes/
│   ├── class-arc-admin.php     # Admin settings page
│   ├── class-arc-public.php    # Frontend shortcode & asset loading
│   └── class-arc-api.php       # REST API for XML feed
├── assets/
│   ├── css/
│   │   ├── styles.css          # Frontend styles
│   │   └── admin.css           # Admin panel styles
│   └── js/
│       ├── config.js           # Configuration & namespace
│       ├── formatters.js       # Utility functions
│       ├── filters.js          # Filter logic
│       ├── gallery.js          # Image gallery component
│       ├── renderer.js         # HTML rendering
│       └── app.js              # Main application
├── test-local.html             # Standalone test page
└── README.md                   # This file
```

### REST API Endpoint

The plugin creates a REST API endpoint:

```
/wp-json/arc/v1/inventory
```

This endpoint fetches and parses your XML feed, caches the results, and returns JSON for the JavaScript app.

## Customization

### Styling

Override CSS custom properties in your theme:

```css
:root {
  --arc-primary-color: #0066cc;
  --arc-border-radius: 8px;
  --arc-spacing: 1rem;
  /* See assets/css/styles.css for all available variables */
}
```

### Data Format

Expected inventory item structure:

```json
{
  "stockNo": "120866",
  "branch": "LANSING (WMI) - 105",
  "year": "2021",
  "make": "INTERNATIONAL",
  "model": "MV607 SBA",
  "condition": "Used",
  "odometer": "170682",
  "ourPrice": "36900.00",
  "category": "TRK",
  "type": "USED TRUCK",
  "color": "White",
  "engineMfr": "Cummins",
  "horsepower": "240",
  "fuelType": "Diesel",
  "images": ["url1.jpg", "url2.jpg"]
}
```

### Clearing Cache

- **Automatic:** Cache clears when settings are saved
- **Manual:** Use the "Clear Cache Now" button in settings
- **Programmatic:** `delete_transient('arc_inventory_data')`

## Requirements

- **WordPress:** 5.8 or higher
- **PHP:** 7.4 or higher
- **XML Feed:** Valid inventory XML feed URL

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). No IE11 support.

## Support & Issues

For bug reports and feature requests, please use the [GitHub issue tracker](https://github.com/boileau-co/arcadium-inventory/issues).

## License

GPL v2 or later. See [LICENSE](https://www.gnu.org/licenses/gpl-2.0.html).

## Changelog

### 1.0.0 (Initial Release)
- WordPress plugin structure
- XML feed integration with caching
- Admin settings page
- Shortcode support `[arc_inventory]`
- REST API endpoint
- GitHub Updater support
- Responsive design
- Search and filtering
- Image gallery
