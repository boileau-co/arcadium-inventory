<?php
/**
 * REST API functionality
 */
class ARC_Inventory_API {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        register_rest_route('arc/v1', '/inventory', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_inventory'),
            'permission_callback' => '__return_true'
        ));
    }

    /**
     * Get inventory data
     */
    public function get_inventory($request) {
        // Check cache first
        $cache_duration = get_option('arc_cache_duration', 3600);
        $cached_data = get_transient('arc_inventory_data');

        if ($cached_data !== false) {
            return new WP_REST_Response($cached_data, 200);
        }

        // Get XML feed URL from settings
        $xml_url = get_option('arc_xml_feed_url');

        if (empty($xml_url)) {
            return new WP_Error(
                'no_feed_url',
                'XML feed URL not configured. Please configure it in Settings > Arcadium Inventory.',
                array('status' => 400)
            );
        }

        // Fetch XML data
        $response = wp_remote_get($xml_url, array(
            'timeout' => 30,
            'sslverify' => true
        ));

        if (is_wp_error($response)) {
            return new WP_Error(
                'fetch_failed',
                'Failed to fetch XML feed: ' . $response->get_error_message(),
                array('status' => 500)
            );
        }

        $body = wp_remote_retrieve_body($response);

        if (empty($body)) {
            return new WP_Error(
                'empty_response',
                'XML feed returned empty response.',
                array('status' => 500)
            );
        }

        // Parse XML
        $inventory_data = $this->parse_xml($body);

        if (is_wp_error($inventory_data)) {
            return $inventory_data;
        }

        // Cache the data
        set_transient('arc_inventory_data', $inventory_data, $cache_duration);

        return new WP_REST_Response($inventory_data, 200);
    }

    /**
     * Parse XML data
     */
    private function parse_xml($xml_string) {
        // Suppress XML errors
        libxml_use_internal_errors(true);

        $xml = simplexml_load_string($xml_string);

        if ($xml === false) {
            $errors = libxml_get_errors();
            libxml_clear_errors();

            return new WP_Error(
                'xml_parse_error',
                'Failed to parse XML: ' . (isset($errors[0]) ? $errors[0]->message : 'Unknown error'),
                array('status' => 500)
            );
        }

        $inventory = array();

        // Parse each listing (actual XML uses <Listing> elements with x-prefixed fields)
        foreach ($xml->Listing as $item) {
            $inventory_item = array(
                'stockNo' => (string) $item->StockNo,
                'branch' => (string) $item->xBranch,
                'year' => (string) $item->xYear,
                'make' => (string) $item->xMake,
                'model' => (string) $item->xModel,
                'vin' => (string) $item->VIN,
                'series' => (string) $item->xSeries,
                'condition' => (string) $item->xCondition,
                'odometer' => (string) $item->xOdometer,
                'gvwr' => (string) $item->xGVWR,
                'bodyStyle' => (string) $item->xBodyStyle,
                'ourPrice' => (string) $item->xOurPrice,
                'retailPrice' => (string) $item->xRetailPrice,
                'category' => (string) $item->categorie,
                'type' => (string) $item->xType,
                'status' => (string) $item->xStatus,
                'color' => (string) $item->xColorExterior,
                'engineMfr' => (string) $item->xEngineManufacturer,
                'horsepower' => (string) $item->xHorsepower,
                'fuelType' => (string) $item->xFuelType,
                'wheelbase' => (string) $item->xWheelBase,
                'suspension' => (string) $item->xSuspension,
                'images' => array()
            );

            // Parse images from url field (pipe-delimited URLs)
            if (!empty($item->url)) {
                $url_string = (string) $item->url;
                if (!empty($url_string)) {
                    $urls = explode('|', $url_string);
                    foreach ($urls as $url) {
                        $url = trim($url);
                        if (!empty($url)) {
                            $inventory_item['images'][] = $url;
                        }
                    }
                }
            }

            $inventory[] = $inventory_item;
        }

        return $inventory;
    }
}
