<?php
/**
 * Public/Frontend functionality
 */
class ARC_Inventory_Public {

    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('arc_inventory', array($this, 'inventory_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        // Only enqueue if shortcode is present
        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'arc_inventory')) {
            return;
        }

        // Enqueue styles
        wp_enqueue_style(
            'arc-inventory-styles',
            ARC_INVENTORY_PLUGIN_URL . 'assets/css/styles.css',
            array(),
            ARC_INVENTORY_VERSION
        );

        wp_enqueue_style(
            'arc-modal-styles',
            ARC_INVENTORY_PLUGIN_URL . 'assets/css/modal.css',
            array('arc-inventory-styles'),
            ARC_INVENTORY_VERSION
        );

        // Enqueue scripts in dependency order
        wp_enqueue_script(
            'arc-config',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/config.js',
            array(),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-formatters',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/formatters.js',
            array('arc-config'),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-filters',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/filters.js',
            array('arc-config'),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-gallery',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/gallery.js',
            array('arc-config'),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-renderer',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/renderer.js',
            array('arc-config', 'arc-formatters', 'arc-gallery'),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-modal',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/modal.js',
            array('arc-config', 'arc-formatters'),
            ARC_INVENTORY_VERSION,
            true
        );

        wp_enqueue_script(
            'arc-app',
            ARC_INVENTORY_PLUGIN_URL . 'assets/js/app.js',
            array('arc-config', 'arc-formatters', 'arc-filters', 'arc-gallery', 'arc-renderer', 'arc-modal'),
            ARC_INVENTORY_VERSION,
            true
        );

        // Localize script with WordPress data
        wp_localize_script('arc-config', 'ARC_WP_Config', array(
            'dataUrl' => rest_url('arc/v1/inventory'),
            'leadUrl' => rest_url('arc/v1/lead'),
            'nonce' => wp_create_nonce('wp_rest'),
            'leadNonce' => wp_create_nonce('arc_lead_nonce'),
            'itemsPerPage' => get_option('arc_items_per_page', 12),
            'leadEmailConfigured' => !empty(get_option('arc_adf_lead_email'))
        ));
    }

    /**
     * Inventory shortcode callback
     */
    public function inventory_shortcode($atts) {
        // Parse shortcode attributes
        $atts = shortcode_atts(array(
            'container_class' => 'arc-inventory'
        ), $atts, 'arc_inventory');

        // Output the container
        $output = '<div id="arc-inventory" class="' . esc_attr($atts['container_class']) . '"></div>';

        return $output;
    }
}
