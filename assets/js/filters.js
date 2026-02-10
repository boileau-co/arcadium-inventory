/**
 * ARC Inventory - Filters
 * 
 * Filter logic and helper functions.
 */

ARC.filters = {
  
  /**
   * Apply all filters to inventory
   */
  apply: function(inventory, filters) {
    return inventory.filter(function(item) {
      
      // Search filter
      if (filters.search) {
        var searchLower = filters.search.toLowerCase();
        var matchesSearch = 
          item.stockNo.toLowerCase().indexOf(searchLower) !== -1 ||
          item.make.toLowerCase().indexOf(searchLower) !== -1 ||
          item.model.toLowerCase().indexOf(searchLower) !== -1;
        
        if (!matchesSearch) return false;
      }
      
      // Condition filter
      if (filters.condition !== 'all' && item.condition !== filters.condition) {
        return false;
      }
      
      // Make filter
      if (filters.make !== 'all' && item.make.toUpperCase() !== filters.make.toUpperCase()) {
        return false;
      }

      return true;
    });
  },
  
  /**
   * Check if any filters are active
   */
  isActive: function(filters) {
    var defaults = ARC.config.defaultFilters;
    return (
      filters.search !== defaults.search ||
      filters.condition !== defaults.condition ||
      filters.make !== defaults.make
    );
  },
  
  /**
   * Reset filters to defaults
   */
  reset: function() {
    return Object.assign({}, ARC.config.defaultFilters);
  },
  
  /**
   * Extract unique makes from inventory
   */
  getUniqueMakes: function(inventory) {
    var makes = {};
    inventory.forEach(function(item) {
      if (item.make) {
        makes[item.make.toUpperCase()] = true;
      }
    });
    return Object.keys(makes).sort();
  },
  
  /**
   * Calculate stats from inventory
   */
  calculateStats: function(inventory) {
    return {
      total: inventory.length,
      new: inventory.filter(function(i) { return i.condition === 'New'; }).length,
      used: inventory.filter(function(i) { return i.condition === 'Used'; }).length
    };
  }
  
};
