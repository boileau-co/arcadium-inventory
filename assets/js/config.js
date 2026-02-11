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
  containerSelector: '#arc-inventory',
  perPage: 0,
  nonce: ''
};

// Merge WordPress config
if (typeof ARC_WP_Config !== 'undefined') {
  ARC.config.dataUrl = ARC_WP_Config.dataUrl;
  ARC.config.perPage = ARC_WP_Config.itemsPerPage;
  ARC.config.nonce = ARC_WP_Config.nonce;
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
