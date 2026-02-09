# Arcadium Inventory by Boileau & Co.

A modular JavaScript application for displaying vehicle inventory. Designed for future conversion to a WordPress plugin.

## Project Structure

```
arcadium-inventory/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles (CSS custom properties for theming)
├── js/
│   ├── config.js       # Configuration & global namespace
│   ├── formatters.js   # Price, odometer formatting utilities
│   ├── filters.js      # Filter logic
│   ├── gallery.js      # Image gallery component
│   ├── renderer.js     # HTML rendering
│   └── app.js          # Main application entry point
├── data/
│   └── inventory.json  # Inventory data (parsed from XML)
└── README.md
```

## Quick Start

1. Open the project folder in VS Code
2. Use Live Server extension (or similar) to serve the files
3. Open `index.html` in browser

Or simply open `index.html` directly - but note that loading JSON via fetch requires a local server due to CORS.

## Architecture

The app uses a simple namespace pattern (`ARC.*`) to avoid global conflicts:

- **ARC.config** - Configuration settings
- **ARC.state** - Application state
- **ARC.formatters** - Utility functions
- **ARC.filters** - Filter logic
- **ARC.gallery** - Image gallery
- **ARC.renderer** - HTML rendering
- **ARC.app** - Main application logic

## Configuration

Edit `js/config.js` to change settings:

```javascript
ARC.config = {
  dataSource: 'json',
  dataUrl: 'data/inventory.json',
  containerSelector: '#arc-inventory',
  // ...
};
```

## WordPress Plugin Conversion Notes

When converting to WordPress:

### 1. Suggested Plugin Structure
```
arcadium-inventory/
├── arc-inventory.php        # Main plugin file
├── includes/
│   ├── class-arc-admin.php  # Admin settings page
│   └── class-arc-public.php # Frontend shortcode
├── assets/
│   ├── css/styles.css
│   └── js/ (all JS files)
└── templates/
    └── inventory-grid.php
```

### 2. Enqueue Scripts
```php
wp_enqueue_style('arc-styles', plugin_dir_url(__FILE__) . 'assets/css/styles.css');
wp_enqueue_script('arc-config', plugin_dir_url(__FILE__) . 'assets/js/config.js');
// ... enqueue other scripts in dependency order

wp_localize_script('arc-config', 'ARC_Config', array(
    'dataUrl' => rest_url('wmi/v1/inventory'),
    'nonce' => wp_create_nonce('wp_rest')
));
```

### 3. Shortcode
```php
function arc_inventory_shortcode($atts) {
    return '<div id="arc-inventory" class="arc-inventory"></div>';
}
add_shortcode('arc_inventory', 'arc_inventory_shortcode');
```

### 4. REST API Endpoint (for fetching XML feed)
```php
add_action('rest_api_init', function() {
    register_rest_route('wmi/v1', '/inventory', array(
        'methods' => 'GET',
        'callback' => 'arc_get_inventory',
        'permission_callback' => '__return_true'
    ));
});

function arc_get_inventory() {
    $xml_url = get_option('arc_xml_feed_url');
    // Fetch XML, parse, cache with transients, return JSON
}
```

### 5. Admin Settings to Add
- XML Feed URL
- Cache duration (use transients)
- Items per page
- Default filter values
- Style customization options

## Data Format

Each inventory item:

```json
{
  "stockNo": "120866",
  "branch": "LANSING (WMI) - 105",
  "year": "2021",
  "make": "INTERNATIONAL",
  "model": "MV607 SBA",
  "condition": "Used",
  "odometer": "170682",
  "ourPrice": "36900.000000000",
  "category": "TRK",
  "type": "USED TRUCK",
  "color": "White",
  "engineMfr": "Cummins",
  "horsepower": "240",
  "fuelType": "Diesel",
  "images": ["url1.jpg", "url2.jpg"]
}
```

## Browser Support

Modern browsers only (Chrome, Firefox, Safari, Edge). No IE11.
