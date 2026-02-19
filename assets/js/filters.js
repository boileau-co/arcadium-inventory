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

      // Condition filter (array, empty = all)
      if (filters.condition.length > 0 && filters.condition.indexOf(item.condition) === -1) {
        return false;
      }

      // Make filter (array, compared uppercase)
      if (filters.make.length > 0) {
        var itemMakeUpper = item.make.toUpperCase();
        var found = false;
        for (var i = 0; i < filters.make.length; i++) {
          if (filters.make[i].toUpperCase() === itemMakeUpper) { found = true; break; }
        }
        if (!found) return false;
      }

      // Category filter (uses category field, compared uppercase)
      if (filters.category.length > 0) {
        var itemTypeUpper = item.category ? item.category.toUpperCase() : '';
        var catFound = false;
        for (var j = 0; j < filters.category.length; j++) {
          if (filters.category[j].toUpperCase() === itemTypeUpper) { catFound = true; break; }
        }
        if (!catFound) return false;
      }

      // Location filter (uses branch field)
      if (filters.location.length > 0 && filters.location.indexOf(item.branch) === -1) {
        return false;
      }

      // Year filter (array of year strings)
      if (filters.year.length > 0 && filters.year.indexOf(String(item.year)) === -1) {
        return false;
      }

      return true;
    });
  },

  /**
   * Check if any filters are active
   */
  isActive: function(filters) {
    return (
      filters.search !== '' ||
      filters.condition.length > 0 ||
      filters.make.length > 0 ||
      filters.category.length > 0 ||
      filters.location.length > 0 ||
      filters.year.length > 0
    );
  },

  /**
   * Reset filters to defaults
   */
  reset: function() {
    return {
      search: '',
      condition: [],
      make: [],
      category: [],
      location: [],
      year: []
    };
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
   * Extract unique categories from inventory
   */
  getUniqueCategories: function(inventory) {
    var cats = {};
    inventory.forEach(function(item) {
      if (item.category) {
        cats[item.category.toUpperCase()] = item.category;
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
  },

  /**
   * Get counts per value for each filter dimension (based on full inventory)
   */
  getCounts: function(inventory) {
    var counts = { condition: {}, make: {}, category: {}, location: {}, year: {} };
    inventory.forEach(function(item) {
      if (item.condition) counts.condition[item.condition] = (counts.condition[item.condition] || 0) + 1;
      if (item.make) {
        var mk = item.make.toUpperCase();
        counts.make[mk] = (counts.make[mk] || 0) + 1;
      }
      if (item.category) counts.category[item.category] = (counts.category[item.category] || 0) + 1;
      if (item.branch) counts.location[item.branch] = (counts.location[item.branch] || 0) + 1;
      if (item.year) counts.year[item.year] = (counts.year[item.year] || 0) + 1;
    });
    return counts;
  }

};
