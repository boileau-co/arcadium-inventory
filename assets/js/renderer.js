/**
 * ARC Inventory - Renderer
 * 
 * HTML rendering functions for all components.
 */

ARC.renderer = {
  
  /**
   * Render the entire app
   */
  render: function() {
    var container = document.querySelector(ARC.config.containerSelector);
    if (!container) return;

    var state = ARC.state;

    if (state.isLoading) {
      container.innerHTML = ARC.renderer.loading();
      return;
    }

    if (state.error) {
      container.innerHTML = ARC.renderer.error(state.error);
      return;
    }

    // Check if we should show detail view
    var stockNo = ARC.app.getStockFromUrl();
    if (stockNo) {
      var item = ARC.gallery.findItem(stockNo);
      if (item) {
        container.innerHTML = ARC.renderer.detail(item);
        ARC.renderer.bindEvents();
        window.scrollTo(0, 0);
        return;
      }
    }

    container.innerHTML =
      ARC.renderer.header() +
      '<div class="arc-content">' +
        ARC.renderer.grid() +
      '</div>';

    ARC.renderer.bindEvents();
  },
  
  /**
   * Render header with filters
   */
  header: function() {
    var state = ARC.state;
    var filters = state.filters;
    var hasActiveFilters = ARC.filters.isActive(filters);
    var esc = ARC.formatters.escapeHtml;

    var makesOptions = '<option value="all"' + (filters.make === 'all' ? ' selected' : '') + '>All Makes</option>';
    state.makes.forEach(function(make) {
      var selected = filters.make.toUpperCase() === make ? ' selected' : '';
      makesOptions += '<option value="' + esc(make) + '"' + selected + '>' + esc(make) + '</option>';
    });

    var categoryOptions = '<option value="all"' + (filters.category === 'all' ? ' selected' : '') + '>All Categories</option>';
    state.categories.forEach(function(cat) {
      var selected = filters.category.toUpperCase() === cat.toUpperCase() ? ' selected' : '';
      categoryOptions += '<option value="' + esc(cat) + '"' + selected + '>' + esc(cat) + '</option>';
    });

    var locationOptions = '<option value="all"' + (filters.location === 'all' ? ' selected' : '') + '>All Locations</option>';
    state.locations.forEach(function(loc) {
      var selected = filters.location === loc ? ' selected' : '';
      locationOptions += '<option value="' + esc(loc) + '"' + selected + '>' + esc(loc) + '</option>';
    });

    var yearMinOptions = '<option value="all"' + (filters.yearMin === 'all' ? ' selected' : '') + '>Min</option>';
    var yearMaxOptions = '<option value="all"' + (filters.yearMax === 'all' ? ' selected' : '') + '>Max</option>';
    state.years.forEach(function(year) {
      var selMin = filters.yearMin === String(year) ? ' selected' : '';
      var selMax = filters.yearMax === String(year) ? ' selected' : '';
      yearMinOptions += '<option value="' + year + '"' + selMin + '>' + year + '</option>';
      yearMaxOptions += '<option value="' + year + '"' + selMax + '>' + year + '</option>';
    });

    var clearBtn = hasActiveFilters ?
      '<div class="arc-filter-group arc-filter-group--clear">' +
        '<button class="arc-btn-clear" data-action="clear-filters">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
          'Clear' +
        '</button>' +
      '</div>' : '';

    return '' +
    '<div class="arc-header">' +
      '<div class="arc-header-inner">' +
        '<div class="arc-header-top">' +
          '<div>' +
            '<p class="arc-subtitle">Showing ' + state.filteredInventory.length + ' of ' + state.stats.total + ' vehicles</p>' +
          '</div>' +
          '<div class="arc-stats">' +
            '<span class="arc-stat-badge arc-stat-badge--new">' + state.stats.new + ' New</span>' +
            '<span class="arc-stat-badge arc-stat-badge--used">' + state.stats.used + ' Used</span>' +
          '</div>' +
        '</div>' +
        '<div class="arc-filters">' +
          '<div class="arc-filter-group arc-filter-group--search">' +
            '<label class="arc-filter-label">Search</label>' +
            '<div class="arc-search-wrapper">' +
              '<svg class="arc-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' +
              '<input type="text" class="arc-filter-input" data-filter="search" placeholder="Stock #, Make, or Model..." value="' + esc(filters.search) + '">' +
            '</div>' +
          '</div>' +
          '<div class="arc-filter-group">' +
            '<label class="arc-filter-label">Condition</label>' +
            '<select class="arc-filter-select" data-filter="condition">' +
              '<option value="all"' + (filters.condition === 'all' ? ' selected' : '') + '>All Conditions</option>' +
              '<option value="New"' + (filters.condition === 'New' ? ' selected' : '') + '>New</option>' +
              '<option value="Used"' + (filters.condition === 'Used' ? ' selected' : '') + '>Used</option>' +
            '</select>' +
          '</div>' +
          '<div class="arc-filter-group">' +
            '<label class="arc-filter-label">Make</label>' +
            '<select class="arc-filter-select" data-filter="make">' + makesOptions + '</select>' +
          '</div>' +
          '<div class="arc-filter-group">' +
            '<label class="arc-filter-label">Category</label>' +
            '<select class="arc-filter-select" data-filter="category">' + categoryOptions + '</select>' +
          '</div>' +
          '<div class="arc-filter-group">' +
            '<label class="arc-filter-label">Location</label>' +
            '<select class="arc-filter-select" data-filter="location">' + locationOptions + '</select>' +
          '</div>' +
          '<div class="arc-filter-group arc-filter-group--year">' +
            '<label class="arc-filter-label">Year</label>' +
            '<div class="arc-year-range">' +
              '<select class="arc-filter-select" data-filter="yearMin">' + yearMinOptions + '</select>' +
              '<span class="arc-year-separator">to</span>' +
              '<select class="arc-filter-select" data-filter="yearMax">' + yearMaxOptions + '</select>' +
            '</div>' +
          '</div>' +
          clearBtn +
        '</div>' +
      '</div>' +
    '</div>';
  },
  
  /**
   * Render inventory grid
   */
  grid: function() {
    var items = ARC.state.filteredInventory;
    
    if (items.length === 0) {
      return ARC.renderer.empty();
    }
    
    var cards = items.map(function(item) {
      return ARC.renderer.card(item);
    }).join('');
    
    return '<div class="arc-grid">' + cards + '</div>';
  },
  
  /**
   * Render single card
   */
  card: function(item) {
    var imageIndex = ARC.state.imageIndices[item.stockNo] || 0;
    var esc = ARC.formatters.escapeHtml;
    var detailUrl = ARC.renderer.getDetailUrl(item.stockNo);

    // Build details list - only include items with data
    var details = [];

    if (item.branch) {
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' +
          '<span>' + esc(item.branch) + '</span>' +
        '</div>'
      );
    }

    var odometerDisplay = ARC.formatters.odometer(item.odometer);
    if (odometerDisplay) {
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
          '<span>' + odometerDisplay + '</span>' +
        '</div>'
      );
    }

    if (item.engineMfr) {
      var engineText = esc(item.engineMfr);
      if (item.horsepower) engineText += ' ' + esc(item.horsepower) + ' HP';
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' +
          '<span>' + engineText + '</span>' +
        '</div>'
      );
    }

    var gvwrDisplay = ARC.formatters.gvwr(item.gvwr);
    if (gvwrDisplay) {
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 01-6.001 0M18 7l-3 9m-3-9l6-2m0 0V4"/></svg>' +
          '<span>GVWR: ' + gvwrDisplay + '</span>' +
        '</div>'
      );
    }

    if (item.wheelbase) {
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-2V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"/></svg>' +
          '<span>WB: ' + esc(item.wheelbase) + '"</span>' +
        '</div>'
      );
    }

    if (item.suspension) {
      details.push(
        '<div class="arc-card-detail">' +
          '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' +
          '<span>' + esc(item.suspension) + '</span>' +
        '</div>'
      );
    }

    var detailsHtml = details.length > 0 ?
      '<div class="arc-card-details">' + details.join('') + '</div>' : '';

    return '' +
    '<div class="arc-card" data-stock="' + item.stockNo + '">' +
      ARC.gallery.render(item, imageIndex) +
      '<div class="arc-card-body">' +
        '<a href="' + detailUrl + '" class="arc-card-title-link" data-action="view-detail" data-stock="' + item.stockNo + '">' +
          '<h3 class="arc-card-title">' + esc(item.year) + ' ' + esc(item.make) + '</h3>' +
        '</a>' +
        '<p class="arc-card-model">' + esc(item.model) + '</p>' +
        '<div class="arc-card-price-row">' +
          '<span class="arc-card-price">' + ARC.formatters.price(item.ourPrice) + '</span>' +
          '<span class="arc-card-stock">#' + esc(item.stockNo) + '</span>' +
        '</div>' +
        detailsHtml +
        ARC.renderer.specs(item) +
        '<a href="' + detailUrl + '" class="arc-btn-details" data-action="view-detail" data-stock="' + item.stockNo + '">View Details</a>' +
      '</div>' +
    '</div>';
  },
  
  /**
   * Render specs tags
   */
  specs: function(item) {
    var tags = [];
    var esc = ARC.formatters.escapeHtml;

    if (item.color) tags.push('<span class="arc-spec-tag arc-spec-tag--color">' + esc(item.color) + '</span>');
    if (item.fuelType) tags.push('<span class="arc-spec-tag arc-spec-tag--fuel">' + esc(item.fuelType) + '</span>');
    if (item.type) tags.push('<span class="arc-spec-tag arc-spec-tag--type">' + esc(item.type) + '</span>');

    if (tags.length === 0) return '';

    return '<div class="arc-card-specs">' + tags.join('') + '</div>';
  },

  /**
   * Get detail page URL for a stock number
   */
  getDetailUrl: function(stockNo) {
    var base = window.location.pathname;
    return base + '?stock=' + encodeURIComponent(stockNo);
  },
  
  /**
   * Render detail view for a single item
   */
  detail: function(item) {
    var imageIndex = ARC.state.imageIndices[item.stockNo] || 0;
    var esc = ARC.formatters.escapeHtml;

    // Build specs table rows - only include fields with data
    var rows = [];

    if (item.stockNo) rows.push('<tr><th>Stock #</th><td>' + esc(item.stockNo) + '</td></tr>');
    if (item.vin) rows.push('<tr><th>VIN</th><td>' + esc(item.vin) + '</td></tr>');
    if (item.condition) rows.push('<tr><th>Condition</th><td>' + esc(item.condition) + '</td></tr>');
    if (item.type) rows.push('<tr><th>Type</th><td>' + esc(item.type) + '</td></tr>');

    var odometerDisplay = ARC.formatters.odometer(item.odometer);
    if (odometerDisplay) rows.push('<tr><th>Odometer</th><td>' + odometerDisplay + '</td></tr>');

    if (item.engineMfr) rows.push('<tr><th>Engine</th><td>' + esc(item.engineMfr) + '</td></tr>');
    if (item.horsepower) rows.push('<tr><th>Horsepower</th><td>' + esc(item.horsepower) + ' HP</td></tr>');
    if (item.fuelType) rows.push('<tr><th>Fuel Type</th><td>' + esc(item.fuelType) + '</td></tr>');

    var gvwrDisplay = ARC.formatters.gvwr(item.gvwr);
    if (gvwrDisplay) rows.push('<tr><th>GVWR</th><td>' + gvwrDisplay + '</td></tr>');

    if (item.wheelbase) rows.push('<tr><th>Wheelbase</th><td>' + esc(item.wheelbase) + '"</td></tr>');
    if (item.suspension) rows.push('<tr><th>Suspension</th><td>' + esc(item.suspension) + '</td></tr>');
    if (item.color) rows.push('<tr><th>Color</th><td>' + esc(item.color) + '</td></tr>');
    if (item.bodyStyle) rows.push('<tr><th>Body Style</th><td>' + esc(item.bodyStyle) + '</td></tr>');
    if (item.branch) rows.push('<tr><th>Location</th><td>' + esc(item.branch) + '</td></tr>');

    var galleryHtml = ARC.gallery.render(item, imageIndex);

    return '' +
    '<div class="arc-detail">' +
      '<div class="arc-detail-inner">' +
        '<div class="arc-detail-back">' +
          '<button class="arc-btn-back" data-action="back-to-listing">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>' +
            'Back to Inventory' +
          '</button>' +
        '</div>' +
        '<div class="arc-detail-layout">' +
          '<div class="arc-detail-gallery">' +
            galleryHtml +
          '</div>' +
          '<div class="arc-detail-info">' +
            '<h1 class="arc-detail-title">' + esc(item.year) + ' ' + esc(item.make) + '</h1>' +
            '<p class="arc-detail-model">' + esc(item.model) + '</p>' +
            '<div class="arc-detail-price-row">' +
              '<span class="arc-detail-price">' + ARC.formatters.price(item.ourPrice) + '</span>' +
              '<span class="arc-detail-stock">#' + esc(item.stockNo) + '</span>' +
            '</div>' +
            '<table class="arc-detail-specs">' +
              '<tbody>' + rows.join('') + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  /**
   * Render empty state
   */
  empty: function() {
    return '' +
    '<div class="arc-empty">' +
      '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>' +
      '<h3 class="arc-empty-title">No vehicles found</h3>' +
      '<p class="arc-empty-text">Try adjusting your search or filters</p>' +
    '</div>';
  },
  
  /**
   * Render loading state
   */
  loading: function() {
    return '' +
    '<div class="arc-loading">' +
      '<div class="arc-spinner"></div>' +
      '<p class="arc-loading-text">Loading inventory...</p>' +
    '</div>';
  },
  
  /**
   * Render error state
   */
  error: function(message) {
    return '' +
    '<div class="arc-error">' +
      '<h3 class="arc-error-title">Error Loading Inventory</h3>' +
      '<p class="arc-error-text">' + ARC.formatters.escapeHtml(message) + '</p>' +
    '</div>';
  },
  
  /**
   * Bind event listeners
   */
  bindEvents: function() {
    var container = document.querySelector(ARC.config.containerSelector);
    if (!container) return;

    // Remove previous listeners to prevent duplicates
    container.removeEventListener('click', ARC.renderer.handleClick);
    container.removeEventListener('input', ARC.renderer.handleInput);
    container.removeEventListener('change', ARC.renderer.handleChange);

    // Use event delegation
    container.addEventListener('click', ARC.renderer.handleClick);
    container.addEventListener('input', ARC.renderer.handleInput);
    container.addEventListener('change', ARC.renderer.handleChange);
  },
  
  /**
   * Handle click events
   */
  handleClick: function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;

    var action = target.dataset.action;
    var stockNo = target.dataset.stock;

    switch (action) {
      case 'prev':
        e.preventDefault();
        ARC.gallery.prev(stockNo);
        break;
      case 'next':
        e.preventDefault();
        ARC.gallery.next(stockNo);
        break;
      case 'goto':
        e.preventDefault();
        ARC.gallery.goTo(stockNo, parseInt(target.dataset.index));
        break;
      case 'clear-filters':
        e.preventDefault();
        ARC.app.clearFilters();
        break;
      case 'view-detail':
        e.preventDefault();
        ARC.app.viewDetail(stockNo);
        break;
      case 'back-to-listing':
        e.preventDefault();
        ARC.app.backToListing();
        break;
    }
  },
  
  /**
   * Handle input events (search)
   */
  handleInput: function(e) {
    var target = e.target;
    if (!target.dataset.filter) return;
    
    if (target.dataset.filter === 'search') {
      ARC.app.setFilter('search', target.value);
    }
  },
  
  /**
   * Handle change events (dropdowns)
   */
  handleChange: function(e) {
    var target = e.target;
    if (!target.dataset.filter) return;
    
    ARC.app.setFilter(target.dataset.filter, target.value);
  }
  
};
