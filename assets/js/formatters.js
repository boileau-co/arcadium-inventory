/**
 * ARC Inventory - Formatters
 * 
 * Utility functions for formatting display values.
 */

ARC.formatters = {
  
  /**
   * Format price for display
   */
  price: function(value) {
    var num = parseFloat(value);
    if (!num || num <= 0) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(num);
  },
  
  /**
   * Format odometer reading
   */
  odometer: function(value) {
    var num = parseInt(value);
    if (isNaN(num) || num <= 1) return null;
    return num.toLocaleString() + ' mi';
  },
  
  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml: function(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
};
