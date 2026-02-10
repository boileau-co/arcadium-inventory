/**
 * ARC Inventory - Configuration & Namespace
 * 
 * Sets up the global namespace and configuration options.
 * In WordPress, these settings will be injected via wp_localize_script()
 */

var ARC = ARC || {};

ARC.config = {
  // Data source - can be 'json' or 'xml'
  dataSource: 'json',

  // Path to data file (relative to index.html)
  // In WordPress, this will be overridden by ARC_WP_Config.dataUrl
  dataUrl: 'data/inventory.json',

  // Container selector
  containerSelector: '#arc-inventory',

  // Items per page (0 = show all)
  // In WordPress, this will be overridden by ARC_WP_Config.itemsPerPage
  perPage: 0,

  // Default filter values
  defaultFilters: {
    search: '',
    condition: 'all',
    make: 'all'
  }
};

// Merge WordPress config if available
if (typeof ARC_WP_Config !== 'undefined') {
  ARC.config.dataUrl = ARC_WP_Config.dataUrl;
  ARC.config.perPage = ARC_WP_Config.itemsPerPage;
  ARC.config.nonce = ARC_WP_Config.nonce;
}

// Application state
ARC.state = {
  inventory: [],
  filteredInventory: [],
  filters: { ...ARC.config.defaultFilters },
  imageIndices: {},
  stats: { total: 0, new: 0, used: 0 },
  makes: [],
  isLoading: true,
  error: null
};
