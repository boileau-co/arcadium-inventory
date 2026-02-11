/**
 * ARC Inventory - Main Application
 *
 * Entry point and core application logic.
 */

ARC.app = {

  /**
   * Initialize the application
   */
  init: function(options) {
    // Merge options with config
    if (options) {
      Object.assign(ARC.config, options);
    }

    // Read filters from URL before loading data
    ARC.app.readUrlFilters();

    // Load data
    ARC.app.loadData();

    // Listen for back/forward navigation
    window.addEventListener('popstate', function() {
      ARC.app.readUrlFilters();
      ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
      ARC.renderer.render();
    });
  },

  /**
   * Load inventory data
   */
  loadData: function() {
    ARC.state.isLoading = true;
    ARC.state.error = null;
    ARC.renderer.render();

    fetch(ARC.config.dataUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to load data: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        ARC.app.setInventory(data);
      })
      .catch(function(error) {
        ARC.state.isLoading = false;
        ARC.state.error = error.message;
        ARC.renderer.render();
      });
  },

  /**
   * Set inventory data and initialize state
   */
  setInventory: function(data) {
    ARC.state.inventory = data;
    ARC.state.makes = ARC.filters.getUniqueMakes(data);
    ARC.state.categories = ARC.filters.getUniqueCategories(data);
    ARC.state.locations = ARC.filters.getUniqueLocations(data);
    ARC.state.years = ARC.filters.getUniqueYears(data);
    ARC.state.stats = ARC.filters.calculateStats(data);
    ARC.state.counts = ARC.filters.getCounts(data);
    ARC.state.filteredInventory = ARC.filters.apply(data, ARC.state.filters);
    ARC.state.isLoading = false;
    ARC.state.error = null;

    ARC.renderer.render();
  },

  /**
   * Set a filter value and re-render
   */
  setFilter: function(key, value) {
    if (key === 'search') {
      ARC.state.filters.search = value;
    }
    ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
    ARC.app.syncUrl();
    ARC.renderer.render();
  },

  /**
   * Clear all filters
   */
  clearFilters: function() {
    ARC.state.filters = ARC.filters.reset();
    ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
    ARC.app.syncUrl();
    ARC.renderer.render();
  },

  /**
   * Get the stock number from the URL query string
   */
  getStockFromUrl: function() {
    var params = new URLSearchParams(window.location.search);
    return params.get('stock') || null;
  },

  /**
   * Navigate to a detail page
   */
  viewDetail: function(stockNo) {
    var url = ARC.renderer.getDetailUrl(stockNo);
    history.pushState({ stock: stockNo }, '', url);
    ARC.renderer.render();
  },

  /**
   * Navigate back to the listing
   */
  backToListing: function() {
    // Rebuild URL with current filters (no stock param)
    ARC.app.syncUrl();
    ARC.renderer.render();
  },

  /**
   * Read filter state from URL parameters
   */
  readUrlFilters: function() {
    var params = new URLSearchParams(window.location.search);
    var filters = ARC.filters.reset();
    var filterKeys = ['condition', 'make', 'category', 'location', 'year'];

    filterKeys.forEach(function(key) {
      var values = params.getAll(key);
      if (values.length > 0) {
        filters[key] = values;
      }
    });

    var search = params.get('search');
    if (search) {
      filters.search = search;
    }

    ARC.state.filters = filters;
  },

  /**
   * Sync current filter state to URL parameters (replaceState to avoid history spam)
   */
  syncUrl: function() {
    var filters = ARC.state.filters;
    var params = new URLSearchParams();
    var filterKeys = ['condition', 'make', 'category', 'location', 'year'];

    if (filters.search) {
      params.set('search', filters.search);
    }

    filterKeys.forEach(function(key) {
      if (filters[key].length > 0) {
        filters[key].forEach(function(val) {
          params.append(key, val);
        });
      }
    });

    var queryString = params.toString();
    var url = window.location.pathname + (queryString ? '?' + queryString : '');
    history.replaceState({}, '', url);
  }

};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  ARC.app.init();
});
