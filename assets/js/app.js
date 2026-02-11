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

    // Load data
    ARC.app.loadData();

    // Listen for back/forward navigation
    window.addEventListener('popstate', function() {
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
    ARC.state.filteredInventory = ARC.filters.apply(data, ARC.state.filters);
    ARC.state.isLoading = false;
    ARC.state.error = null;

    ARC.renderer.render();
  },

  /**
   * Set a filter value and re-render
   */
  setFilter: function(key, value) {
    ARC.state.filters[key] = value;
    ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
    ARC.renderer.render();
  },

  /**
   * Clear all filters
   */
  clearFilters: function() {
    ARC.state.filters = ARC.filters.reset();
    ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
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
    var base = window.location.pathname;
    history.pushState({}, '', base);
    ARC.renderer.render();
  }

};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  ARC.app.init();
});
