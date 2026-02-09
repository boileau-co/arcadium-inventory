/**
 * ARC Inventory - Gallery
 * 
 * Image gallery navigation and rendering.
 */

ARC.gallery = {
  
  /**
   * Navigate to previous image
   */
  prev: function(stockNo) {
    var item = ARC.gallery.findItem(stockNo);
    if (!item || !item.images || item.images.length <= 1) return;
    
    var current = ARC.state.imageIndices[stockNo] || 0;
    var newIndex = (current - 1 + item.images.length) % item.images.length;
    ARC.state.imageIndices[stockNo] = newIndex;
    ARC.gallery.updateDisplay(stockNo, item, newIndex);
  },
  
  /**
   * Navigate to next image
   */
  next: function(stockNo) {
    var item = ARC.gallery.findItem(stockNo);
    if (!item || !item.images || item.images.length <= 1) return;
    
    var current = ARC.state.imageIndices[stockNo] || 0;
    var newIndex = (current + 1) % item.images.length;
    ARC.state.imageIndices[stockNo] = newIndex;
    ARC.gallery.updateDisplay(stockNo, item, newIndex);
  },
  
  /**
   * Go to specific image index
   */
  goTo: function(stockNo, index) {
    var item = ARC.gallery.findItem(stockNo);
    if (!item || !item.images) return;
    
    var newIndex = Math.max(0, Math.min(index, item.images.length - 1));
    ARC.state.imageIndices[stockNo] = newIndex;
    ARC.gallery.updateDisplay(stockNo, item, newIndex);
  },
  
  /**
   * Find item by stock number
   */
  findItem: function(stockNo) {
    return ARC.state.inventory.find(function(i) {
      return i.stockNo === stockNo;
    });
  },
  
  /**
   * Update gallery display without full re-render
   */
  updateDisplay: function(stockNo, item, index) {
    var gallery = document.querySelector('.arc-gallery[data-stock="' + stockNo + '"]');
    if (!gallery) return;
    
    // Update image
    var img = gallery.querySelector('.arc-gallery-image');
    if (img) {
      img.src = item.images[index];
    }
    
    // Update counter
    var counter = gallery.querySelector('.arc-gallery-counter');
    if (counter) {
      counter.textContent = (index + 1) + ' / ' + item.images.length;
    }
    
    // Update dots
    var dots = gallery.querySelectorAll('.arc-gallery-dot');
    dots.forEach(function(dot, i) {
      dot.classList.toggle('arc-gallery-dot--active', i === index);
    });
  },
  
  /**
   * Render gallery HTML
   */
  render: function(item, currentIndex) {
    currentIndex = currentIndex || 0;
    var hasImages = item.images && item.images.length > 0;
    
    if (!hasImages) {
      return ARC.gallery.renderPlaceholder(item.condition);
    }
    
    var navHtml = item.images.length > 1 ? ARC.gallery.renderNav(item, currentIndex) : '';
    
    return '<div class="arc-gallery" data-stock="' + item.stockNo + '">' +
      '<img class="arc-gallery-image" src="' + item.images[currentIndex] + '" ' +
        'alt="' + item.year + ' ' + item.make + ' ' + item.model + '" ' +
        'onerror="this.style.display=\'none\'">' +
      ARC.gallery.renderBadge(item.condition) +
      navHtml +
    '</div>';
  },
  
  /**
   * Render placeholder for items without images
   */
  renderPlaceholder: function(condition) {
    return '<div class="arc-gallery">' +
      '<div class="arc-gallery-placeholder">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" ' +
            'd="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>' +
        '</svg>' +
        '<span>No images available</span>' +
      '</div>' +
      ARC.gallery.renderBadge(condition) +
    '</div>';
  },
  
  /**
   * Render condition badge
   */
  renderBadge: function(condition) {
    var cls = condition === 'New' ? 'arc-badge--new' : 'arc-badge--used';
    return '<span class="arc-badge ' + cls + '">' + condition + '</span>';
  },
  
  /**
   * Render gallery navigation
   */
  renderNav: function(item, currentIndex) {
    var total = item.images.length;
    var maxDots = 6;
    
    var dotsHtml = '';
    for (var i = 0; i < Math.min(total, maxDots); i++) {
      var activeClass = i === currentIndex ? ' arc-gallery-dot--active' : '';
      dotsHtml += '<button class="arc-gallery-dot' + activeClass + '" ' +
        'data-action="goto" data-stock="' + item.stockNo + '" data-index="' + i + '"></button>';
    }
    if (total > maxDots) {
      dotsHtml += '<span class="arc-gallery-more">+' + (total - maxDots) + '</span>';
    }
    
    return '' +
      '<button class="arc-gallery-btn arc-gallery-btn--prev" data-action="prev" data-stock="' + item.stockNo + '">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
      '</button>' +
      '<button class="arc-gallery-btn arc-gallery-btn--next" data-action="next" data-stock="' + item.stockNo + '">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
      '</button>' +
      '<div class="arc-gallery-dots">' + dotsHtml + '</div>' +
      '<div class="arc-gallery-counter">' + (currentIndex + 1) + ' / ' + total + '</div>';
  }
  
};
