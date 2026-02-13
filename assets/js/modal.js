/**
 * ARC Inventory - Modal
 *
 * Lead capture modal management
 */

ARC.modal = {

  /**
   * Current vehicle being inquired about
   */
  currentVehicle: null,

  /**
   * Initialize modal (renders once on first use)
   */
  init: function() {
    // Check if modal already exists
    if (document.getElementById('arc-lead-modal')) {
      return;
    }

    // Render modal HTML
    var modalHtml = ARC.modal.render();

    // Append to body
    var wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper.firstChild);

    // Bind events
    ARC.modal.bindEvents();
  },

  /**
   * Render modal HTML structure
   */
  render: function() {
    var esc = ARC.formatters.escapeHtml;

    return '' +
    '<div id="arc-lead-modal" class="arc-modal">' +
      '<div class="arc-modal__overlay" data-action="close-modal"></div>' +
      '<div class="arc-modal__dialog">' +
        '<div class="arc-modal__header">' +
          '<h2 class="arc-modal__title">Inquire About Vehicle</h2>' +
          '<button type="button" class="arc-modal__close" data-action="close-modal" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="arc-modal__body">' +
          '<div class="arc-modal__vehicle-info">' +
            '<span class="arc-modal__vehicle-title"></span>' +
          '</div>' +
          '<form id="arc-lead-form" class="arc-lead-form">' +
            '<input type="text" name="honeypot" class="arc-form__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<div class="arc-form__row">' +
              '<div class="arc-form__field">' +
                '<label class="arc-form__label">First Name <span class="arc-form__required">*</span></label>' +
                '<input type="text" name="firstName" class="arc-form__input" required autocomplete="given-name">' +
              '</div>' +
              '<div class="arc-form__field">' +
                '<label class="arc-form__label">Last Name <span class="arc-form__required">*</span></label>' +
                '<input type="text" name="lastName" class="arc-form__input" required autocomplete="family-name">' +
              '</div>' +
            '</div>' +
            '<div class="arc-form__field">' +
              '<label class="arc-form__label">Email <span class="arc-form__required">*</span></label>' +
              '<input type="email" name="email" class="arc-form__input" required autocomplete="email">' +
            '</div>' +
            '<div class="arc-form__field">' +
              '<label class="arc-form__label">Phone</label>' +
              '<input type="tel" name="phone" class="arc-form__input" autocomplete="tel">' +
            '</div>' +
            '<div class="arc-form__field">' +
              '<label class="arc-form__label">Postal Code</label>' +
              '<input type="text" name="postalCode" class="arc-form__input" autocomplete="postal-code">' +
            '</div>' +
            '<div class="arc-form__field">' +
              '<label class="arc-form__label">Comments</label>' +
              '<textarea name="comments" class="arc-form__textarea" rows="4" placeholder="Any specific questions or requirements..."></textarea>' +
            '</div>' +
            '<div class="arc-form__actions">' +
              '<button type="submit" class="arc-btn arc-btn--primary">Send Message</button>' +
              '<button type="button" class="arc-btn arc-btn--secondary" data-action="close-modal">Cancel</button>' +
            '</div>' +
            '<div class="arc-form__message" style="display: none;"></div>' +
          '</form>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  /**
   * Open modal with vehicle data
   */
  open: function(vehicle) {
    if (!vehicle) return;

    // Initialize if needed
    ARC.modal.init();

    // Store current vehicle
    ARC.modal.currentVehicle = vehicle;

    // Update vehicle info display
    var vehicleTitle = document.querySelector('.arc-modal__vehicle-title');
    if (vehicleTitle) {
      var displayText = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model;
      if (vehicle.stockNo) {
        displayText += ' (Stock #' + vehicle.stockNo + ')';
      }
      vehicleTitle.textContent = displayText;
    }

    // Clear form
    var form = document.getElementById('arc-lead-form');
    if (form) {
      form.reset();
    }

    // Hide any messages
    ARC.modal.hideMessage();

    // Show modal
    var modal = document.getElementById('arc-lead-modal');
    if (modal) {
      modal.classList.add('arc-modal--open');
      document.body.classList.add('arc-modal-open');

      // Focus first input
      setTimeout(function() {
        var firstInput = modal.querySelector('input[name="firstName"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  },

  /**
   * Close modal
   */
  close: function() {
    var modal = document.getElementById('arc-lead-modal');
    if (modal) {
      modal.classList.remove('arc-modal--open');
      document.body.classList.remove('arc-modal-open');
    }

    // Reset form and state
    setTimeout(function() {
      var form = document.getElementById('arc-lead-form');
      if (form) {
        form.reset();
        form.classList.remove('arc-form--loading');
      }
      ARC.modal.hideMessage();
      ARC.modal.currentVehicle = null;
    }, 300);
  },

  /**
   * Bind event listeners
   */
  bindEvents: function() {
    var modal = document.getElementById('arc-lead-modal');
    if (!modal) return;

    // Close on overlay/button click
    modal.addEventListener('click', function(e) {
      if (e.target.dataset.action === 'close-modal') {
        e.preventDefault();
        ARC.modal.close();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('arc-modal--open')) {
        ARC.modal.close();
      }
    });

    // Form submission
    var form = document.getElementById('arc-lead-form');
    if (form) {
      form.addEventListener('submit', ARC.modal.handleSubmit);
    }
  },

  /**
   * Handle form submission
   */
  handleSubmit: function(e) {
    e.preventDefault();

    var form = e.target;
    var vehicle = ARC.modal.currentVehicle;

    if (!vehicle) {
      ARC.modal.showError('Vehicle data not found. Please try again.');
      return;
    }

    // Get form data
    var formData = new FormData(form);
    var data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      postalCode: formData.get('postalCode') || '',
      comments: formData.get('comments') || '',
      honeypot: formData.get('honeypot') || '',
      stockNo: vehicle.stockNo || '',
      year: vehicle.year || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      vin: vehicle.vin || '',
      condition: vehicle.condition || '',
      ourPrice: vehicle.ourPrice || '',
      branch: vehicle.branch || ''
    };

    // Validate
    var errors = ARC.modal.validate(data);
    if (errors.length > 0) {
      ARC.modal.showError(errors.join(' '));
      return;
    }

    // Show loading state
    form.classList.add('arc-form--loading');
    ARC.modal.hideMessage();

    // Submit via fetch
    fetch(ARC.config.leadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
    .then(function(response) {
      return response.json().then(function(data) {
        return {
          ok: response.ok,
          status: response.status,
          data: data
        };
      });
    })
    .then(function(result) {
      form.classList.remove('arc-form--loading');

      if (result.ok || result.data.success) {
        ARC.modal.showSuccess(result.data.message || 'Thank you for your inquiry. We will contact you soon.');

        // Auto-close after 2 seconds
        setTimeout(function() {
          ARC.modal.close();
        }, 2000);
      } else {
        var errorMessage = result.data.message || 'Unable to send message. Please try again.';
        ARC.modal.showError(errorMessage);
      }
    })
    .catch(function(error) {
      form.classList.remove('arc-form--loading');
      ARC.modal.showError('Unable to send message. Please try again.');
      console.error('Lead submission error:', error);
    });
  },

  /**
   * Validate form data
   */
  validate: function(data) {
    var errors = [];

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required.');
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required.');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required.');
    } else if (!ARC.modal.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address.');
    }

    return errors;
  },

  /**
   * Validate email format
   */
  isValidEmail: function(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Show success message
   */
  showSuccess: function(message) {
    var messageEl = document.querySelector('.arc-form__message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = 'arc-form__message arc-form__message--success';
      messageEl.style.display = 'block';
    }
  },

  /**
   * Show error message
   */
  showError: function(message) {
    var messageEl = document.querySelector('.arc-form__message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = 'arc-form__message arc-form__message--error';
      messageEl.style.display = 'block';
    }
  },

  /**
   * Hide message
   */
  hideMessage: function() {
    var messageEl = document.querySelector('.arc-form__message');
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
      messageEl.className = 'arc-form__message';
    }
  }

};
