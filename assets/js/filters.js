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

      // Category filter (uses type field)
      if (filters.category !== 'all' && item.type.toUpperCase() !== filters.category.toUpperCase()) {
        return false;
      }

      // Location filter (uses branch field)
      if (filters.location !== 'all' && item.branch !== filters.location) {
        return false;
      }

      // Year range filter
      if (filters.yearMin !== 'all') {
        var yearMin = parseInt(filters.yearMin);
        var itemYear = parseInt(item.year);
        if (isNaN(itemYear) || itemYear < yearMin) return false;
      }
      if (filters.yearMax !== 'all') {
        var yearMax = parseInt(filters.yearMax);
        var itemYear2 = parseInt(item.year);
        if (isNaN(itemYear2) || itemYear2 > yearMax) return false;
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
      filters.make !== defaults.make ||
      filters.category !== defaults.category ||
      filters.location !== defaults.location ||
      filters.yearMin !== defaults.yearMin ||
      filters.yearMax !== defaults.yearMax
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
   * Extract unique categories (type field) from inventory
   */
  getUniqueCategories: function(inventory) {
    var cats = {};
    inventory.forEach(function(item) {
      if (item.type) {
        cats[item.type.toUpperCase()] = item.type;
      }
    });
    return Object.keys(cats).sort().map(function(key) { return cats[key]; });
  },

  /**
   * Extract unique locations (branch field) from inventory
   */
  getUniqueLocations: function(inventory) {
    var locs = {};
    inventory.forEach(function(item) {
      if (item.branch) {
        locs[item.branch] = true;
      }
    });
    return Object.keys(locs).sort();
  },

  /**
   * Extract sorted unique years from inventory
   */
  getUniqueYears: function(inventory) {
    var years = {};
    inventory.forEach(function(item) {
      if (item.year) {
        var y = parseInt(item.year);
        if (!isNaN(y) && y > 1900) {
          years[y] = true;
        }
      }
    });
    return Object.keys(years).map(Number).sort(function(a, b) { return a - b; });
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
