<?php
/**
 * Plugin Name: Arcadium Inventory by Boileau & Co.
 * Plugin URI: https://github.com/boileau-co/arcadium-inventory
 * Description: A modular JavaScript application for displaying vehicle inventory with XML feed integration and advanced filtering.
 * Version: 1.3.0
 * Author: Boileau & Co.
 * Author URI: https://boileauandco.com
 * Text Domain: arcadium-inventory
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * GitHub Plugin URI: boileau-co/arcadium-inventory
 * GitHub Branch: master
 * Primary Branch: master
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('ARC_INVENTORY_VERSION', '1.3.0');
define('ARC_INVENTORY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ARC_INVENTORY_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ARC_INVENTORY_PLUGIN_FILE', __FILE__);

// GitHub update checker - wrapped safely to prevent site crashes
if ( file_exists( ARC_INVENTORY_PLUGIN_DIR . 'plugin-update-checker/plugin-update-checker.php' ) ) {
    require_once ARC_INVENTORY_PLUGIN_DIR . 'plugin-update-checker/plugin-update-checker.php';
    $arc_update_checker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
        'https://github.com/boileau-co/arcadium-inventory/',
        __FILE__,
        'arcadium-inventory'
    );
    $arc_update_checker->setBranch('master');
}

// Require the main classes
require_once ARC_INVENTORY_PLUGIN_DIR . 'includes/class-arc-admin.php';
require_once ARC_INVENTORY_PLUGIN_DIR . 'includes/class-arc-public.php';
require_once ARC_INVENTORY_PLUGIN_DIR . 'includes/class-arc-api.php';

/**
 * Initialize the plugin
 */
function arc_inventory_init() {
    // Initialize admin functionality
    if (is_admin()) {
        new ARC_Inventory_Admin();
    }

    // Initialize public functionality
    new ARC_Inventory_Public();

    // Initialize REST API
    new ARC_Inventory_API();
}
add_action('plugins_loaded', 'arc_inventory_init');

/**
 * Activation hook
 */
function arc_inventory_activate() {
    // Set default options
    add_option('arc_xml_feed_url', '');
    add_option('arc_cache_duration', 3600); // 1 hour default
    add_option('arc_items_per_page', 12);

    // Flush rewrite rules
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'arc_inventory_activate');

/**
 * Deactivation hook
 */
function arc_inventory_deactivate() {
    // Clear any cached data
    delete_transient('arc_inventory_data');

    // Flush rewrite rules
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'arc_inventory_deactivate');
