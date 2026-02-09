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
    
    var clearBtn = hasActiveFilters ? 
      '<button class="arc-btn-clear" data-action="clear-filters">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
        'Clear' +
      '</button>' : '';
    
    return '' +
    '<div class="arc-header">' +
      '<div class="arc-header-inner">' +
        '<div class="arc-header-top">' +
          '<div>' +
            '<h1 class="arc-title">Arcadium Inventory</h1>' +
            '<p class="arc-subtitle">Showing ' + state.filteredInventory.length + ' of ' + state.stats.total + ' vehicles</p>' +
          '</div>' +
          '<div class="arc-stats">' +
            '<span class="arc-stat-badge arc-stat-badge--new">' + state.stats.new + ' New</span>' +
            '<span class="arc-stat-badge arc-stat-badge--used">' + state.stats.used + ' Used</span>' +
            '<span class="arc-stat-badge arc-stat-badge--photos">' + state.stats.withImages + ' w/ Photos</span>' +
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
            '<label class="arc-filter-label">Images</label>' +
            '<select class="arc-filter-select" data-filter="images">' +
              '<option value="all"' + (filters.images === 'all' ? ' selected' : '') + '>All Vehicles</option>' +
              '<option value="with"' + (filters.images === 'with' ? ' selected' : '') + '>Has Images</option>' +
              '<option value="without"' + (filters.images === 'without' ? ' selected' : '') + '>No Images</option>' +
            '</select>' +
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
    var odometerDisplay = ARC.formatters.odometer(item.odometer);
    var esc = ARC.formatters.escapeHtml;
    
    var specsHtml = ARC.renderer.specs(item);
    var odometerHtml = odometerDisplay ? 
      '<div class="arc-card-detail">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
        '<span>' + odometerDisplay + '</span>' +
      '</div>' : '';
    
    return '' +
    '<div class="arc-card" data-stock="' + item.stockNo + '">' +
      ARC.gallery.render(item, imageIndex) +
      '<div class="arc-card-body">' +
        '<h3 class="arc-card-title">' + esc(item.year) + ' ' + esc(item.make) + '</h3>' +
        '<p class="arc-card-model">' + esc(item.model) + '</p>' +
        '<div class="arc-card-price-row">' +
          '<span class="arc-card-price">' + ARC.formatters.price(item.ourPrice) + '</span>' +
          '<span class="arc-card-stock">#' + esc(item.stockNo) + '</span>' +
        '</div>' +
        '<div class="arc-card-details">' +
          '<div class="arc-card-detail">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' +
            '<span>' + esc(item.branch) + '</span>' +
          '</div>' +
          '<div class="arc-card-detail">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>' +
            '<span>' + esc(item.type) + '</span>' +
          '</div>' +
          odometerHtml +
        '</div>' +
        specsHtml +
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
    if (item.engineMfr) tags.push('<span class="arc-spec-tag arc-spec-tag--engine">' + esc(item.engineMfr) + '</span>');
    if (item.horsepower) tags.push('<span class="arc-spec-tag arc-spec-tag--hp">' + esc(item.horsepower) + ' HP</span>');
    if (item.fuelType) tags.push('<span class="arc-spec-tag arc-spec-tag--fuel">' + esc(item.fuelType) + '</span>');
    
    if (tags.length === 0) return '';
    
    return '<div class="arc-card-specs">' + tags.join('') + '</div>';
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
