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
      '<div class="arc-layout">' +
        ARC.renderer.sidebar() +
        '<div class="arc-main">' +
          ARC.renderer.toolbar() +
          ARC.renderer.grid() +
        '</div>' +
      '</div>';

    ARC.renderer.bindEvents();
  },
  
  /**
   * Render a single filter section for the sidebar
   */
  filterSection: function(title, filterKey, values, currentValue, counts) {
    var esc = ARC.formatters.escapeHtml;
    var isOpen = currentValue !== 'all';

    var items = '<label class="arc-filter-option">' +
      '<input type="radio" name="' + filterKey + '" value="all" data-filter="' + filterKey + '"' + (currentValue === 'all' ? ' checked' : '') + '>' +
      '<span class="arc-filter-option-label">All</span>' +
    '</label>';

    values.forEach(function(val) {
      var count = counts[val] || 0;
      var checked = '';
      if (filterKey === 'condition' || filterKey === 'location') {
        checked = currentValue === val ? ' checked' : '';
      } else if (filterKey === 'make') {
        checked = currentValue.toUpperCase() === val.toUpperCase() ? ' checked' : '';
      } else if (filterKey === 'category') {
        checked = currentValue.toUpperCase() === val.toUpperCase() ? ' checked' : '';
      } else if (filterKey === 'year') {
        checked = currentValue === String(val) ? ' checked' : '';
      }

      items += '<label class="arc-filter-option">' +
        '<input type="radio" name="' + filterKey + '" value="' + esc(String(val)) + '" data-filter="' + filterKey + '"' + checked + '>' +
        '<span class="arc-filter-option-label">' + esc(String(val)) + '</span>' +
        '<span class="arc-filter-option-count">(' + count + ')</span>' +
      '</label>';
    });

    return '<div class="arc-filter-section' + (isOpen ? ' arc-filter-section--open' : '') + '">' +
      '<button class="arc-filter-heading" data-action="toggle-section">' +
        '<span>' + esc(title) + '</span>' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
      '</button>' +
      '<div class="arc-filter-list">' + items + '</div>' +
    '</div>';
  },

  /**
   * Render sidebar with filters
   */
  sidebar: function() {
    var state = ARC.state;
    var filters = state.filters;
    var counts = state.counts;
    var esc = ARC.formatters.escapeHtml;
    var hasActiveFilters = ARC.filters.isActive(filters);

    // Year: present as individual radio buttons (descending order)
    var yearsDesc = state.years.slice().reverse();

    // Determine the single selected year (if yearMin === yearMax and not 'all')
    var selectedYear = 'all';
    if (filters.yearMin !== 'all' && filters.yearMin === filters.yearMax) {
      selectedYear = filters.yearMin;
    }

    var clearBtn = hasActiveFilters ?
      '<button class="arc-sidebar-clear" data-action="clear-filters">Clear All Filters</button>' : '';

    return '<aside class="arc-sidebar">' +
      '<div class="arc-sidebar-search">' +
        '<div class="arc-search-wrapper">' +
          '<svg class="arc-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>' +
          '<input type="text" class="arc-filter-input" data-filter="search" placeholder="Search inventory..." value="' + esc(filters.search) + '">' +
        '</div>' +
      '</div>' +
      ARC.renderer.filterSection('Condition', 'condition', ['New', 'Used'], filters.condition, counts.condition) +
      ARC.renderer.filterSection('Make', 'make', state.makes, filters.make, counts.make) +
      ARC.renderer.filterSection('Category', 'category', state.categories, filters.category, counts.category) +
      ARC.renderer.filterSection('Location', 'location', state.locations, filters.location, counts.location) +
      ARC.renderer.filterSection('Year', 'year', yearsDesc, selectedYear, counts.year) +
      clearBtn +
    '</aside>';
  },

  /**
   * Render toolbar above the grid
   */
  toolbar: function() {
    var state = ARC.state;
    return '<div class="arc-toolbar">' +
      '<span class="arc-toolbar-count">' + state.filteredInventory.length + ' Matches</span>' +
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

    // Build details table rows - only include items with data
    var rows = [];

    if (item.branch) rows.push('<tr><th>Location</th><td>' + esc(item.branch) + '</td></tr>');

    var odometerDisplay = ARC.formatters.odometer(item.odometer);
    if (odometerDisplay) rows.push('<tr><th>Odometer</th><td>' + odometerDisplay + '</td></tr>');

    if (item.engineMfr) {
      var engineText = esc(item.engineMfr);
      if (item.horsepower) engineText += ' ' + esc(item.horsepower) + ' HP';
      rows.push('<tr><th>Engine</th><td>' + engineText + '</td></tr>');
    }

    var gvwrDisplay = ARC.formatters.gvwr(item.gvwr);
    if (gvwrDisplay) rows.push('<tr><th>GVWR</th><td>' + gvwrDisplay + '</td></tr>');

    if (item.wheelbase) rows.push('<tr><th>Wheelbase</th><td>' + esc(item.wheelbase) + '"</td></tr>');
    if (item.suspension) rows.push('<tr><th>Suspension</th><td>' + esc(item.suspension) + '</td></tr>');

    var detailsHtml = rows.length > 0 ?
      '<table class="arc-card-details"><tbody>' + rows.join('') + '</tbody></table>' : '';

    return '' +
    '<div class="arc-card" data-stock="' + item.stockNo + '">' +
      ARC.gallery.render(item, imageIndex) +
      '<div class="arc-card-body">' +
        '<a href="' + detailUrl + '" class="arc-card-title-link" data-action="view-detail" data-stock="' + item.stockNo + '">' +
          '<h3 class="arc-card-title">' + esc(item.year) + ' ' + esc(item.make) + '</h3>' +
        '</a>' +
        '<p class="arc-card-model">' + esc(item.model) + '</p>' +
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
      case 'toggle-section':
        e.preventDefault();
        var section = target.closest('.arc-filter-section');
        if (section) section.classList.toggle('arc-filter-section--open');
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
   * Handle change events (dropdowns and radio buttons)
   */
  handleChange: function(e) {
    var target = e.target;
    if (!target.dataset.filter) return;

    var filterKey = target.dataset.filter;
    var value = target.value;

    // Year radio sets both yearMin and yearMax
    if (filterKey === 'year') {
      ARC.state.filters.yearMin = value;
      ARC.state.filters.yearMax = value;
      ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
      ARC.renderer.render();
      return;
    }

    ARC.app.setFilter(filterKey, value);
  }
  
};
