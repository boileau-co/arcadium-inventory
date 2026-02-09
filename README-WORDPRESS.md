# Arcadium Inventory - WordPress Plugin

A WordPress plugin for displaying vehicle inventory with XML feed integration, advanced filtering, and automatic updates via GitHub.

## Features

- 🚗 Display vehicle inventory with advanced filtering
- 📡 XML feed integration with caching
- 🔄 Automatic updates via GitHub Releases
- 🎨 Customizable display with CSS custom properties
- 📱 Responsive design
- ⚡ Performance optimized with transient caching

## Installation

### Manual Installation

1. Download or clone this repository
2. Upload the `arcadium-inventory` folder to `/wp-content/plugins/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to Settings > Arcadium Inventory to configure

### GitHub Updater Installation (for automatic updates)

1. Install the [GitHub Updater](https://github.com/afragen/github-updater) plugin
2. Activate GitHub Updater
3. Install Arcadium Inventory (either manually or via GitHub Updater)
4. The plugin will automatically check for updates from your GitHub repository

## Configuration

### Basic Setup

1. Go to **Settings > Arcadium Inventory**
2. Enter your **XML Feed URL**
3. Configure **Cache Duration** (default: 1 hour)
4. Set **Items Per Page** (default: 12)
5. Click **Save Settings**

### Using the Shortcode

Add the inventory display to any page or post using:

```
[arc_inventory]
```

Optional parameters:
```
[arc_inventory container_class="my-custom-class"]
```

## GitHub Updater Setup

To enable automatic updates via GitHub:

### 1. Update Plugin Headers

Edit `arcadium-inventory.php` and update these lines with your GitHub information:

```php
* Plugin URI: https://github.com/YOUR-USERNAME/arcadium-inventory
* GitHub Plugin URI: YOUR-USERNAME/arcadium-inventory
```

### 2. Create a GitHub Release

When you're ready to release an update:

1. Update the version number in `arcadium-inventory.php`:
   ```php
   * Version: 1.0.1
   define('ARC_INVENTORY_VERSION', '1.0.1');
   ```

2. Commit and push your changes to GitHub

3. Create a new release on GitHub:
   - Go to your repository on GitHub
   - Click "Releases" > "Create a new release"
   - Tag version: `1.0.1` (must match plugin version)
   - Release title: `Version 1.0.1`
   - Describe the changes
   - Click "Publish release"

4. WordPress sites with GitHub Updater installed will automatically detect the update!

### Version Numbering

Follow semantic versioning:
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes

## File Structure

```
arcadium-inventory/
├── arcadium-inventory.php      # Main plugin file
├── includes/
│   ├── class-arc-admin.php     # Admin settings
│   ├── class-arc-public.php    # Frontend shortcode
│   └── class-arc-api.php       # REST API for XML feed
├── assets/
│   ├── css/
│   │   ├── styles.css          # Frontend styles
│   │   └── admin.css           # Admin styles
│   ├── js/
│   │   ├── config.js           # Configuration
│   │   ├── formatters.js       # Utility functions
│   │   ├── filters.js          # Filter logic
│   │   ├── gallery.js          # Image gallery
│   │   ├── renderer.js         # HTML rendering
│   │   └── app.js              # Main app
│   └── data/
│       └── inventory.json      # Sample data
├── README.md                   # Original JS app README
└── README-WORDPRESS.md         # This file
```

## REST API

The plugin creates a REST API endpoint at:
```
/wp-json/arc/v1/inventory
```

This endpoint:
- Fetches and parses your XML inventory feed
- Caches results using WordPress transients
- Returns JSON data for the JavaScript app

## Customization

### Styling

The plugin uses CSS custom properties for easy theming. Override these in your theme's CSS:

```css
:root {
  --arc-primary-color: #0066cc;
  --arc-border-radius: 8px;
  /* etc. */
}
```

### JavaScript Configuration

The plugin automatically configures the JavaScript app via `wp_localize_script()`. Manual configuration is not needed in WordPress.

## Development

### Clearing Cache

- **Automatic**: Cache clears when you save settings
- **Manual**: Use the "Clear Cache Now" button on the settings page
- **Programmatic**: `delete_transient('arc_inventory_data')`

### Debugging

Enable WordPress debugging in `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- XML feed URL for inventory data

## Support

For issues and feature requests, please use the GitHub issue tracker:
https://github.com/YOUR-USERNAME/arcadium-inventory/issues

## License

GPL v2 or later

## Changelog

### 1.0.0
- Initial WordPress plugin release
- XML feed integration with caching
- Admin settings page
- Shortcode support
- REST API endpoint
- GitHub Updater support
