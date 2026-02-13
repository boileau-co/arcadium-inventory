<?php
/**
 * Admin functionality
 */
class ARC_Inventory_Admin {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'Arcadium Inventory Settings',
            'Arcadium Inventory',
            'manage_options',
            'arcadium-inventory',
            array($this, 'settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('arc_inventory_settings', 'arc_xml_feed_url', array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => ''
        ));

        register_setting('arc_inventory_settings', 'arc_cache_duration', array(
            'type' => 'integer',
            'sanitize_callback' => 'absint',
            'default' => 3600
        ));

        register_setting('arc_inventory_settings', 'arc_items_per_page', array(
            'type' => 'integer',
            'sanitize_callback' => 'absint',
            'default' => 12
        ));

        register_setting('arc_inventory_settings', 'arc_adf_lead_email', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_email',
            'default' => ''
        ));

        register_setting('arc_inventory_settings', 'arc_adf_vendor_name', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));

        register_setting('arc_inventory_settings', 'arc_adf_vendor_phone', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => ''
        ));

        // Add settings sections
        add_settings_section(
            'arc_main_settings',
            'Main Settings',
            array($this, 'main_settings_section_callback'),
            'arcadium-inventory'
        );

        add_settings_section(
            'arc_lead_capture_settings',
            'Lead Capture Settings',
            array($this, 'lead_capture_settings_section_callback'),
            'arcadium-inventory'
        );

        // Add settings fields
        add_settings_field(
            'arc_xml_feed_url',
            'XML Feed URL',
            array($this, 'xml_feed_url_callback'),
            'arcadium-inventory',
            'arc_main_settings'
        );

        add_settings_field(
            'arc_cache_duration',
            'Cache Duration (seconds)',
            array($this, 'cache_duration_callback'),
            'arcadium-inventory',
            'arc_main_settings'
        );

        add_settings_field(
            'arc_items_per_page',
            'Items Per Page',
            array($this, 'items_per_page_callback'),
            'arcadium-inventory',
            'arc_main_settings'
        );

        add_settings_field(
            'arc_adf_lead_email',
            'ADF Lead Email Address',
            array($this, 'adf_lead_email_callback'),
            'arcadium-inventory',
            'arc_lead_capture_settings'
        );

        add_settings_field(
            'arc_adf_vendor_name',
            'Vendor Name',
            array($this, 'adf_vendor_name_callback'),
            'arcadium-inventory',
            'arc_lead_capture_settings'
        );

        add_settings_field(
            'arc_adf_vendor_phone',
            'Vendor Phone',
            array($this, 'adf_vendor_phone_callback'),
            'arcadium-inventory',
            'arc_lead_capture_settings'
        );
    }

    /**
     * Main settings section callback
     */
    public function main_settings_section_callback() {
        echo '<p>Configure your Arcadium Inventory settings below.</p>';
    }

    /**
     * XML Feed URL field callback
     */
    public function xml_feed_url_callback() {
        $value = get_option('arc_xml_feed_url', '');
        echo '<input type="url" name="arc_xml_feed_url" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Enter the URL to your XML inventory feed.</p>';
    }

    /**
     * Cache duration field callback
     */
    public function cache_duration_callback() {
        $value = get_option('arc_cache_duration', 3600);
        echo '<input type="number" name="arc_cache_duration" value="' . esc_attr($value) . '" class="small-text" />';
        echo '<p class="description">How long to cache inventory data (in seconds). Default: 3600 (1 hour).</p>';
    }

    /**
     * Items per page field callback
     */
    public function items_per_page_callback() {
        $value = get_option('arc_items_per_page', 12);
        echo '<input type="number" name="arc_items_per_page" value="' . esc_attr($value) . '" class="small-text" min="1" />';
        echo '<p class="description">Number of inventory items to display per page. Default: 12.</p>';
    }

    /**
     * Lead capture settings section callback
     */
    public function lead_capture_settings_section_callback() {
        echo '<p>Configure ADF/XML lead capture settings. Lead forms will only appear if the ADF Lead Email is configured.</p>';
    }

    /**
     * ADF Lead Email field callback
     */
    public function adf_lead_email_callback() {
        $value = get_option('arc_adf_lead_email', '');
        echo '<input type="email" name="arc_adf_lead_email" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Email address where ADF/XML leads will be sent. The lead capture form will only appear if this is configured.</p>';
    }

    /**
     * ADF Vendor Name field callback
     */
    public function adf_vendor_name_callback() {
        $value = get_option('arc_adf_vendor_name', '');
        echo '<input type="text" name="arc_adf_vendor_name" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Your business/vendor name for ADF submissions. If left empty, the vehicle branch/location will be used.</p>';
    }

    /**
     * ADF Vendor Phone field callback
     */
    public function adf_vendor_phone_callback() {
        $value = get_option('arc_adf_vendor_phone', '');
        echo '<input type="tel" name="arc_adf_vendor_phone" value="' . esc_attr($value) . '" class="regular-text" />';
        echo '<p class="description">Your business phone number for ADF submissions.</p>';
    }

    /**
     * Settings page
     */
    public function settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Check if settings were saved
        if (isset($_GET['settings-updated'])) {
            // Clear the cache when settings are updated
            delete_transient('arc_inventory_data');
            add_settings_error('arc_inventory_messages', 'arc_inventory_message', 'Settings Saved and Cache Cleared', 'updated');
        }

        settings_errors('arc_inventory_messages');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('arc_inventory_settings');
                do_settings_sections('arcadium-inventory');
                submit_button('Save Settings');
                ?>
            </form>

            <hr>

            <h2>Usage</h2>
            <p>Use the following shortcode to display the inventory on any page or post:</p>
            <code>[arc_inventory]</code>

            <h2>Clear Cache</h2>
            <p>Settings are cached for performance. Saving settings automatically clears the cache.</p>
            <form method="post" action="">
                <?php wp_nonce_field('arc_clear_cache', 'arc_clear_cache_nonce'); ?>
                <button type="submit" name="arc_clear_cache" class="button">Clear Cache Now</button>
            </form>

            <?php
            // Handle manual cache clearing
            if (isset($_POST['arc_clear_cache']) && check_admin_referer('arc_clear_cache', 'arc_clear_cache_nonce')) {
                delete_transient('arc_inventory_data');
                echo '<div class="notice notice-success"><p>Cache cleared successfully!</p></div>';
            }
            ?>
        </div>
        <?php
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our settings page
        if ('settings_page_arcadium-inventory' !== $hook) {
            return;
        }

        // Add admin styles if needed
        wp_enqueue_style('arc-admin-styles', ARC_INVENTORY_PLUGIN_URL . 'assets/css/admin.css', array(), ARC_INVENTORY_VERSION);
    }
}
