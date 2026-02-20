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

    // Preserve search input focus and cursor position across re-render
    var searchInput = container.querySelector('[data-filter="search"]');
    var hadFocus = searchInput && document.activeElement === searchInput;
    var cursorPos = hadFocus ? searchInput.selectionStart : 0;

    container.innerHTML =
      '<div class="arc-layout">' +
        ARC.renderer.sidebar() +
        '<div class="arc-main">' +
          ARC.renderer.toolbar() +
          ARC.renderer.grid() +
        '</div>' +
      '</div>';

    ARC.renderer.bindEvents();

    // Restore search input focus
    if (hadFocus) {
      var newInput = container.querySelector('[data-filter="search"]');
      if (newInput) {
        newInput.focus();
        newInput.setSelectionRange(cursorPos, cursorPos);
      }
    }
  },

  /**
   * Render a single filter section for the sidebar
   */
  filterSection: function(title, filterKey, values, selectedArray, counts) {
    var esc = ARC.formatters.escapeHtml;
    var isOpen = selectedArray.length > 0;

    var items = '';
    values.forEach(function(val) {
      var count = counts[val] || 0;
      var valStr = String(val);
      var checked = selectedArray.indexOf(valStr) !== -1 ? ' checked' : '';

      items += '<label class="arc-filter-option">' +
        '<input type="checkbox" data-filter="' + filterKey + '" value="' + esc(valStr) + '"' + checked + '>' +
        '<span class="arc-filter-option-label">' + esc(valStr) + '</span>' +
        '<span class="arc-filter-option-count">(' + count + ')</span>' +
      '</label>';
    });

    return '<div class="arc-filter-section' + (isOpen ? ' arc-filter-section--open' : '') + '">' +
      '<button class="arc-filter-heading" data-action="toggle-section">' +
        '<strong>' + esc(title) + '</strong>' +
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

    var yearsDesc = state.years.slice().reverse();

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
      ARC.renderer.filterSection('Year', 'year', yearsDesc, filters.year, counts.year) +
      clearBtn +
    '</aside>';
  },

  /**
   * Render toolbar above the grid
   */
  toolbar: function() {
    var state = ARC.state;
    return '<div class="arc-toolbar">' +
      '<span class="arc-toolbar-count"><strong>' + state.filteredInventory.length + ' Matches</strong></span>' +
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

    if (item.branch) rows.push('<tr><th><strong>Location</strong></th><td>' + esc(item.branch) + '</td></tr>');

    var odometerDisplay = ARC.formatters.odometer(item.odometer);
    if (odometerDisplay) rows.push('<tr><th><strong>Odometer</strong></th><td>' + odometerDisplay + '</td></tr>');

    if (item.engineMake) {
      var engineText = esc(item.engineMake);
      if (item.engineModel) engineText += ' ' + esc(item.engineModel);
      if (item.horsepower) engineText += ' &mdash; ' + esc(item.horsepower) + ' HP';
      rows.push('<tr><th><strong>Engine</strong></th><td>' + engineText + '</td></tr>');
    }

    if (item.transMake) {
      var transText = esc(item.transMake);
      if (item.transModel) transText += ' ' + esc(item.transModel);
      rows.push('<tr><th><strong>Transmission</strong></th><td>' + transText + '</td></tr>');
    }

    if (item.axleConfig) rows.push('<tr><th><strong>Axle</strong></th><td>' + esc(item.axleConfig) + '</td></tr>');

    var gvwrDisplay = ARC.formatters.gvwr(item.gvwr);
    if (gvwrDisplay) rows.push('<tr><th><strong>GVWR</strong></th><td>' + gvwrDisplay + '</td></tr>');

    var detailsHtml = rows.length > 0 ?
      '<table class="arc-card-details"><tbody>' + rows.join('') + '</tbody></table>' : '';

    return '' +
    '<div class="arc-card" data-stock="' + item.stockNo + '">' +
      ARC.gallery.render(item, imageIndex) +
      '<div class="arc-card-body">' +
        '<a href="' + detailUrl + '" class="arc-card-title-link" data-action="view-detail" data-stock="' + item.stockNo + '">' +
          '<h3 class="arc-card-title">' + esc(item.year) + ' ' + esc(item.make) + (item.model ? ' ' + esc(item.model) : '') + '</h3>' +
        '</a>' +
        ARC.renderer.specs(item) +
        detailsHtml +
        '<div class="arc-card-buttons">' +
          '<a href="' + detailUrl + '" class="arc-btn-details" data-action="view-detail" data-stock="' + item.stockNo + '">View Details</a>' +
          (ARC.config.leadEmailConfigured ? '<button class="arc-btn-message" data-action="open-lead-modal" data-stock="' + esc(item.stockNo) + '">Send Message</button>' : '') +
        '</div>' +
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
    if (item.category) tags.push('<span class="arc-spec-tag arc-spec-tag--type">' + esc(item.category) + '</span>');

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

    // Helper: standard data row
    var row = function(label, val) {
      return '<tr><th><strong>' + esc(label) + '</strong></th><td>' + esc(String(val)) + '</td></tr>';
    };
    // Helper: section heading row (spans both columns)
    var section = function(title) {
      return '<tr class="arc-specs-section"><th colspan="2">' + esc(title) + '</th></tr>';
    };

    var rows = [];

    // --- Overview ---
    var overviewRows = [];
    if (item.stockNo) overviewRows.push(row('Stock #', item.stockNo));
    if (item.vin) overviewRows.push(row('VIN', item.vin));
    var odom = ARC.formatters.odometer(item.odometer);
    if (odom) overviewRows.push(row('Odometer', odom));
    if (item.color) overviewRows.push(row('Exterior Color', item.color));
    if (item.interior) overviewRows.push(row('Interior', item.interior));
    if (item.class) overviewRows.push(row('Trim Level', item.class));
    if (item.branch) overviewRows.push(row('Location', item.branch));
    if (overviewRows.length) { rows.push(section('Overview')); rows = rows.concat(overviewRows); }

    // --- Engine ---
    var engineRows = [];
    if (item.engineMake || item.engineModel) {
      engineRows.push(row('Engine', [item.engineMake, item.engineModel].filter(Boolean).join(' ')));
    }
    if (item.horsepower) engineRows.push(row('Horsepower', item.horsepower + ' HP'));
    if (item.engineBrake) engineRows.push(row('Engine Brake', item.engineBrake));
    if (item.fuelType) engineRows.push(row('Fuel Type', item.fuelType));
    if (item.engineSerial) engineRows.push(row('Engine Serial', item.engineSerial));
    if (engineRows.length) { rows.push(section('Engine')); rows = rows.concat(engineRows); }

    // --- Transmission ---
    var transRows = [];
    if (item.transMake || item.transModel) {
      transRows.push(row('Transmission', [item.transMake, item.transModel].filter(Boolean).join(' ')));
    }
    if (item.transSpeed) transRows.push(row('Speeds', item.transSpeed));
    if (item.transmission) transRows.push(row('Type', item.transmission));
    if (item.drive) transRows.push(row('Drive', item.drive));
    if (transRows.length) { rows.push(section('Transmission')); rows = rows.concat(transRows); }

    // --- Axle & Suspension ---
    var axleRows = [];
    if (item.axleConfig) axleRows.push(row('Axle Configuration', item.axleConfig));
    var faStr = ARC.formatters.gvwr(item.faCapacity);
    if (faStr) axleRows.push(row('Front Axle Capacity', faStr));
    var raStr = ARC.formatters.gvwr(item.raCapacity);
    if (raStr) axleRows.push(row('Rear Axle Capacity', raStr));
    if (item.rearEndRatio) axleRows.push(row('Rear End Ratio', item.rearEndRatio));
    if (item.fifthWheel) axleRows.push(row('5th Wheel', item.fifthWheel));
    if (item.suspensionType) {
      var suspStr = item.suspensionType;
      if (item.suspensionMake) suspStr += ' \u2013 ' + item.suspensionMake;
      if (item.suspensionModel) suspStr += ' ' + item.suspensionModel;
      axleRows.push(row('Suspension', suspStr));
    }
    if (axleRows.length) { rows.push(section('Axle & Suspension')); rows = rows.concat(axleRows); }

    // --- Tires & Wheels ---
    var tireRows = [];
    if (item.frontTireSize || item.frontWheels) {
      tireRows.push(row('Front Tires', [item.frontTireSize, item.frontWheels].filter(Boolean).join(' \u2013 ')));
    }
    if (item.rearTireSize || item.rearWheels) {
      tireRows.push(row('Rear Tires', [item.rearTireSize, item.rearWheels].filter(Boolean).join(' \u2013 ')));
    }
    if (item.brakes) tireRows.push(row('Brakes', item.brakes));
    if (tireRows.length) { rows.push(section('Tires & Wheels')); rows = rows.concat(tireRows); }

    // --- Dimensions & Weight ---
    var dimRows = [];
    var gvwrStr = ARC.formatters.gvwr(item.gvwr);
    if (gvwrStr) dimRows.push(row('GVWR', gvwrStr));
    if (item.wheelbase) dimRows.push(row('Wheelbase', item.wheelbase + '"'));
    var tanks = '';
    if (item.tank1Capacity) tanks = item.tank1Capacity + ' gal';
    if (item.tank2Capacity) tanks += (tanks ? ' + ' : '') + item.tank2Capacity + ' gal';
    if (tanks) dimRows.push(row('Fuel Capacity', tanks));
    if (dimRows.length) { rows.push(section('Dimensions & Weight')); rows = rows.concat(dimRows); }

    // --- Cab (only if any data present) ---
    var cabRows = [];
    if (item.cabType) cabRows.push(row('Cab Type', item.cabType));
    if (item.sleeper) cabRows.push(row('Sleeper', item.sleeper));
    if (item.sleeperSize) cabRows.push(row('Sleeper Size', item.sleeperSize + '"'));
    if (item.numberOfBeds && item.numberOfBeds !== '0') cabRows.push(row('Beds', item.numberOfBeds));
    if (cabRows.length) { rows.push(section('Cab')); rows = rows.concat(cabRows); }

    var galleryHtml = ARC.gallery.render(item, imageIndex);

    var descriptionHtml = '';
    if (item.description) {
      descriptionHtml = '<div class="arc-detail-description">' +
        '<p class="arc-detail-description-text">' + esc(item.description) + '</p>' +
      '</div>';
    }

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
            ARC.renderer.specs(item) +
            '<div class="arc-detail-price-row">' +
              '<strong class="arc-detail-price">' + ARC.formatters.price(item.ourPrice) + '</strong>' +
              '<span class="arc-detail-stock">#' + esc(item.stockNo) + '</span>' +
            '</div>' +
            (ARC.config.leadEmailConfigured ? '<button class="arc-btn-lead" data-action="open-lead-modal" data-stock="' + esc(item.stockNo) + '">Send Message About This Vehicle</button>' : '') +
            '<table class="arc-detail-specs">' +
              '<tbody>' + rows.join('') + '</tbody>' +
            '</table>' +
            descriptionHtml +
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
      case 'open-lead-modal':
        e.preventDefault();
        var vehicle = ARC.state.inventory.find(function(item) {
          return item.stockNo === stockNo;
        });
        if (vehicle) {
          ARC.modal.open(vehicle);
        }
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
   * Handle change events (checkboxes)
   */
  handleChange: function(e) {
    var target = e.target;
    if (!target.dataset.filter) return;

    var filterKey = target.dataset.filter;
    var value = target.value;

    // Skip search - handled by handleInput
    if (filterKey === 'search') return;

    // Toggle value in the filter array
    var arr = ARC.state.filters[filterKey];
    var idx = arr.indexOf(value);
    if (target.checked && idx === -1) {
      arr.push(value);
    } else if (!target.checked && idx !== -1) {
      arr.splice(idx, 1);
    }

    ARC.state.filteredInventory = ARC.filters.apply(ARC.state.inventory, ARC.state.filters);
    ARC.app.syncUrl();
    ARC.renderer.render();
  }

};
