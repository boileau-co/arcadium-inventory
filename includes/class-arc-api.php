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

        register_rest_route('arc/v1', '/lead', array(
            'methods' => 'POST',
            'callback' => array($this, 'submit_lead'),
            'permission_callback' => '__return_true',
            'args' => array(
                'firstName' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'lastName' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'email' => array('required' => true, 'sanitize_callback' => 'sanitize_email'),
                'phone' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'postalCode' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'comments' => array('required' => false, 'sanitize_callback' => 'sanitize_textarea_field'),
                'honeypot' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'stockNo' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'year' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'make' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'model' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'vin' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'condition' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'ourPrice' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field'),
                'branch' => array('required' => false, 'sanitize_callback' => 'sanitize_text_field')
            )
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

        // Resolve URL to local filesystem path if possible, to avoid loopback HTTP requests
        $body = false;
        $upload_dir = wp_upload_dir();
        if ( ! empty($upload_dir['baseurl']) && strpos($xml_url, $upload_dir['baseurl']) === 0 ) {
            $local_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $xml_url);
            if ( file_exists($local_path) ) {
                $body = file_get_contents($local_path);
            }
        }

        // Fall back to HTTP request for remote feeds or if local resolution failed
        if ( $body === false ) {
            $response = wp_remote_get($xml_url, array(
                'timeout' => 30,
                'sslverify' => true
            ));

            if ( is_wp_error($response) ) {
                return new WP_Error(
                    'fetch_failed',
                    'Failed to fetch XML feed: ' . $response->get_error_message(),
                    array('status' => 500)
                );
            }

            $body = wp_remote_retrieve_body($response);
        }

        if ( empty($body) ) {
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

        foreach ($xml->Listing as $item) {
            $inventory_item = array(
                'stockNo'         => (string) $item->StockNo,
                'year'            => (string) $item->Year,
                'make'            => (string) $item->Make,
                'model'           => (string) $item->Model,
                'vin'             => (string) $item->VIN,
                'condition'       => (string) $item->Condition,
                'ourPrice'        => (string) $item->Price,
                'category'        => (string) $item->Category,
                'branch'          => (string) $item->Branch,
                'color'           => (string) $item->Color,
                'interior'        => (string) $item->Interior,
                'class'           => (string) $item->Class,
                'description'     => (string) $item->Description,
                'odometer'        => (string) $item->Mileage,
                'fuelType'        => (string) $item->FuelType,
                'tank1Capacity'   => (string) $item->Tank1Capacity,
                'tank2Capacity'   => (string) $item->Tank2Capacity,
                'engineMake'      => (string) $item->EngineMake,
                'engineModel'     => (string) $item->EngineModel,
                'horsepower'      => (string) $item->HorsePower,
                'engineBrake'     => (string) $item->EngineBrake,
                'engineSerial'    => (string) $item->EngineSerial,
                'transMake'       => (string) $item->TransMake,
                'transModel'      => (string) $item->TransModel,
                'transSpeed'      => (string) $item->TransSpeed,
                'transmission'    => (string) $item->Transmission,
                'axleConfig'      => (string) $item->AxleConfiguration,
                'rearEndRatio'    => (string) $item->RearEndRatio,
                'wheelbase'       => (string) $item->WheelBase,
                'suspensionType'  => (string) $item->SuspensionType,
                'suspensionMake'  => (string) $item->SuspensionMake,
                'suspensionModel' => (string) $item->SuspensionModel,
                'faCapacity'      => (string) $item->FACapacity,
                'raCapacity'      => (string) $item->RACapacity,
                'frontTireSize'   => (string) $item->FrontTireSize,
                'rearTireSize'    => (string) $item->RearTireSize,
                'frontWheels'     => (string) $item->FrontWheels,
                'rearWheels'      => (string) $item->RearWheels,
                'brakes'          => (string) $item->Brakes,
                'gvwr'            => (string) $item->GrossVehicleWeight,
                'fifthWheel'      => (string) $item->{'_x0035_thWheel'},
                'sleeper'         => (string) $item->Sleeper,
                'sleeperSize'     => (string) $item->SleeperSize,
                'cabType'         => (string) $item->{'Cab_x0020_Type'},
                'drive'           => (string) $item->Drive,
                'dot'             => (string) $item->DOT,
                'numberOfBeds'    => (string) $item->NumberOfBeds,
                'images'          => array()
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

    /**
     * Submit lead form
     */
    public function submit_lead($request) {
        try {
            // Check if lead email is configured
            $lead_email = get_option('arc_adf_lead_email');

            if (empty($lead_email)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => 'Lead capture is not configured. Please contact the site administrator.'
                ), 400);
            }

            // Honeypot spam check (silent rejection)
            $honeypot = $request->get_param('honeypot');
            if (!empty($honeypot)) {
                return new WP_REST_Response(array(
                    'success' => true,
                    'message' => 'Thank you for your inquiry. We will contact you soon.'
                ), 200);
            }

            // Validate required fields
            $firstName = $request->get_param('firstName');
            $lastName = $request->get_param('lastName');
            $email = $request->get_param('email');
            $stockNo = $request->get_param('stockNo');
            $year = $request->get_param('year');
            $make = $request->get_param('make');
            $model = $request->get_param('model');

            if (empty($firstName) || empty($lastName) || empty($email)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => 'Please fill out all required fields.'
                ), 400);
            }

            // Validate email format
            if (!is_email($email)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => 'Please enter a valid email address.'
                ), 400);
            }

            // Build data array for ADF/XML generation
            $data = array(
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'phone' => $request->get_param('phone'),
                'postalCode' => $request->get_param('postalCode'),
                'comments' => $request->get_param('comments'),
                'stockNo' => $stockNo,
                'year' => $year,
                'make' => $make,
                'model' => $model,
                'vin' => $request->get_param('vin'),
                'condition' => $request->get_param('condition'),
                'ourPrice' => $request->get_param('ourPrice'),
                'branch' => $request->get_param('branch')
            );

            // Generate ADF/XML
            $adf_xml = $this->generate_adf_xml($data);

            // Prepare email
            $subject = 'New Lead: ' . $year . ' ' . $make . ' ' . $model;
            $headers = array(
                'Content-Type: text/plain; charset=UTF-8'
            );

            // Send email (WordPress will use default From address)
            $sent = wp_mail($lead_email, $subject, $adf_xml, $headers);

            if (!$sent) {
                error_log('ARC Lead: wp_mail failed for lead ' . $stockNo);
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => 'Unable to send message. Please try again or contact us directly.'
                ), 500);
            }

            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Thank you for your inquiry. We will contact you soon.'
            ), 200);

        } catch (Exception $e) {
            error_log('ARC Lead Error: ' . $e->getMessage());
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'An error occurred. Please try again or contact us directly.'
            ), 500);
        } catch (Throwable $e) {
            error_log('ARC Lead Fatal Error: ' . $e->getMessage());
            return new WP_REST_Response(array(
                'success' => false,
                'message' => 'An error occurred. Please try again or contact us directly.'
            ), 500);
        }
    }

    /**
     * Generate ADF/XML from lead data
     */
    private function generate_adf_xml($data) {
        // Get vendor info from settings or fallback to branch
        $vendor_name = get_option('arc_adf_vendor_name');
        if (empty($vendor_name) && !empty($data['branch'])) {
            $vendor_name = $data['branch'];
        }
        $vendor_phone = get_option('arc_adf_vendor_phone', '');

        // Get site info for provider
        $site_name = get_bloginfo('name');
        $site_url = home_url();

        // Format date in ISO 8601
        $request_date = date('c');

        // Map condition to ADF status (New/Used)
        $status = 'used';
        if (!empty($data['condition']) && strtolower($data['condition']) === 'new') {
            $status = 'new';
        }

        // Build ADF/XML
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<?adf version="1.0" ?>' . "\n";
        $xml .= '<adf>' . "\n";
        $xml .= '  <prospect>' . "\n";
        $xml .= '    <id sequence="1" source="' . esc_html($site_name) . '"/>' . "\n";
        $xml .= '    <requestdate>' . esc_html($request_date) . '</requestdate>' . "\n";
        $xml .= '    <vehicle interest="buy" status="' . esc_html($status) . '">' . "\n";
        $xml .= '      <id sequence="1" source=""/>' . "\n";
        $xml .= '      <year>' . esc_html($data['year']) . '</year>' . "\n";
        $xml .= '      <make>' . esc_html($data['make']) . '</make>' . "\n";
        $xml .= '      <model>' . esc_html($data['model']) . '</model>' . "\n";

        if (!empty($data['vin'])) {
            $xml .= '      <vin>' . esc_html($data['vin']) . '</vin>' . "\n";
        }

        $xml .= '      <stock>' . esc_html($data['stockNo']) . '</stock>' . "\n";
        $xml .= '      <trim></trim>' . "\n";

        if (!empty($data['ourPrice']) && $data['ourPrice'] !== '0' && $data['ourPrice'] !== '0.000000000') {
            $price = floatval($data['ourPrice']);
            $xml .= '      <price type="asking" currency="USD">' . esc_html(number_format($price, 0, '.', '')) . '</price>' . "\n";
        }

        $xml .= '      <comments></comments>' . "\n";
        $xml .= '    </vehicle>' . "\n";
        $xml .= '    <customer>' . "\n";
        $xml .= '      <contact>' . "\n";
        $xml .= '        <name part="first">' . esc_html($data['firstName']) . '</name>' . "\n";
        $xml .= '        <name part="last">' . esc_html($data['lastName']) . '</name>' . "\n";
        $xml .= '        <email preferedcontact="0">' . esc_html($data['email']) . '</email>' . "\n";

        if (!empty($data['phone'])) {
            $xml .= '        <phone type="voice" time="day" preferedcontact="0">' . esc_html($data['phone']) . '</phone>' . "\n";
        }

        $xml .= '        <address type="home">' . "\n";
        $xml .= '          <postalcode>' . esc_html($data['postalCode']) . '</postalcode>' . "\n";
        $xml .= '        </address>' . "\n";
        $xml .= '      </contact>' . "\n";

        $customer_comments = 'Check Availability.';
        if (!empty($data['comments'])) {
            $customer_comments .= ' Customer Comments: ' . $data['comments'];
        }
        $xml .= '      <comments>' . esc_html($customer_comments) . '</comments>' . "\n";

        $xml .= '    </customer>' . "\n";
        $xml .= '    <vendor>' . "\n";
        $xml .= '      <id></id>' . "\n";

        if (!empty($vendor_name)) {
            $xml .= '      <vendorname>' . esc_html($vendor_name) . '</vendorname>' . "\n";
        }

        $xml .= '      <contact>' . "\n";
        $xml .= '        <name></name>' . "\n";

        if (!empty($vendor_phone)) {
            $xml .= '        <phone type="voice" time="nopreference">' . esc_html($vendor_phone) . '</phone>' . "\n";
        } else {
            $xml .= '        <phone type="voice" time="nopreference"></phone>' . "\n";
        }

        $xml .= '      </contact>' . "\n";
        $xml .= '    </vendor>' . "\n";
        $xml .= '    <provider>' . "\n";
        $xml .= '      <name>' . esc_html($site_name) . '</name>' . "\n";
        $xml .= '      <service>Website</service>' . "\n";
        $xml .= '      <url>' . esc_html($site_url) . '</url>' . "\n";
        $xml .= '    </provider>' . "\n";
        $xml .= '    <leadtype>Sales</leadtype>' . "\n";
        $xml .= '  </prospect>' . "\n";
        $xml .= '</adf>';

        return $xml;
    }
}
