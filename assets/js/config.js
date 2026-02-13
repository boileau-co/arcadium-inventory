/**
 * ARC Inventory - Configuration & Namespace
 *
 * Sets up the global namespace and configuration options.
 * WordPress injects dataUrl, perPage, and nonce via wp_localize_script().
 */

var ARC = ARC || {};

ARC.config = {
  // WordPress provides these via ARC_WP_Config
  dataUrl: '',
  leadUrl: '',
  containerSelector: '#arc-inventory',
  perPage: 0,
  nonce: '',
  leadNonce: '',
  leadEmailConfigured: false
};

// Merge WordPress config
if (typeof ARC_WP_Config !== 'undefined') {
  ARC.config.dataUrl = ARC_WP_Config.dataUrl;
  ARC.config.leadUrl = ARC_WP_Config.leadUrl;
  ARC.config.perPage = ARC_WP_Config.itemsPerPage;
  ARC.config.nonce = ARC_WP_Config.nonce;
  ARC.config.leadNonce = ARC_WP_Config.leadNonce;
  ARC.config.leadEmailConfigured = ARC_WP_Config.leadEmailConfigured;
}

// Application state
ARC.state = {
  inventory: [],
  filteredInventory: [],
  filters: {
    search: '',
    condition: [],
    make: [],
    category: [],
    location: [],
    year: []
  },
  imageIndices: {},
  stats: { total: 0, new: 0, used: 0 },
  makes: [],
  categories: [],
  locations: [],
  years: [],
  counts: { condition: {}, make: {}, category: {}, location: {}, year: {} },
  isLoading: true,
  error: null
};
