/**
 * Calendar Renderer for BetterHotel Calendar Widget
 * Handles all DOM rendering and visual updates
 */

import { 
  formatDate, 
  parseDate, 
  isSameDay, 
  getCleanMonthDays,
  isInRange,
  addDays
} from '../utils.js';
import { getText, formatDateLocale } from '../i18n.js';

/**
 * Calendar Renderer Class
 */
export class CalendarRenderer {
  constructor(config) {
    this.config = config;
    this.element = null;
  }

  /**
   * Initialize renderer with container element
   * @param {HTMLElement} container
   */
  init(container) {
    this.container = container;
  }

  /**
   * Render the complete calendar widget
   * @param {Object} state - Current widget state
   * @returns {HTMLElement} - The rendered element
   */
  render(state) {
    // console.log('🎨 Rendering calendar widget...');
    this.element = document.createElement('div');
    this.element.className = 'bhc-widget';
    this.element.setAttribute('role', 'application');
    this.element.setAttribute('aria-label', getText(this.config.locale, 'ariaCalendar'));
    
    this.element.innerHTML = this.getWidgetHTML(state);
    
    this.container.appendChild(this.element);
    // console.log('✅ Calendar widget rendered and appended to container');
    
    return this.element;
  }

  /**
   * Get complete widget HTML
   * @param {Object} state
   * @returns {string}
   */
  getWidgetHTML(state) {
    return `
      <div class="bhc-header">
        <h3 class="bhc-title">${getText(this.config.locale, 'selectDates')}</h3>
        <div class="bhc-controls">
          <button class="bhc-btn bhc-btn-clear">
            ${getText(this.config.locale, 'clear')}
          </button>
          <button class="bhc-btn bhc-btn-refresh">
            ${getText(this.config.locale, 'refreshData')}
          </button>
        </div>
      </div>
      
      <div class="bhc-calendar-container">
        <div class="bhc-calendar-header">
          <button class="bhc-btn bhc-btn-nav" data-action="prev" aria-label="${getText(this.config.locale, 'ariaPreviousMonth')}">
            ‹
          </button>
          <h4 class="bhc-month-year"></h4>
          <button class="bhc-btn bhc-btn-nav" data-action="next" aria-label="${getText(this.config.locale, 'ariaNextMonth')}">
            ›
          </button>
        </div>
        
        <div class="bhc-calendar-grid">
          <div class="bhc-weekdays"></div>
          <div class="bhc-days"></div>
        </div>
      </div>
      
      <div class="bhc-info">
        <div class="bhc-selection"></div>
        <div class="bhc-price-calculation"></div>
        <div class="bhc-error"></div>
        <div class="bhc-legend">
          <div class="bhc-legend-item">
            <span class="bhc-legend-dot bhc-dot-no-arrival">•</span>
            ${getText(this.config.locale, 'tooltipNoArrival')}
          </div>
        </div>
      </div>
      
      <div class="bhc-loading" style="display: none;">
        ${getText(this.config.locale, 'loading')}
      </div>
    `;
  }

  /**
   * Update calendar display
   * @param {Object} state
   */
  updateCalendar(state) {
    this.updateMonthYear(state);
    this.updateDays(state);
    this.updateSelection(state);
    this.updatePriceCalculation(state);
  }

  /**
   * Update month/year header
   * @param {Object} state
   */
  updateMonthYear(state) {
    const monthYear = this.element.querySelector('.bhc-month-year');
    const currentMonth = state.currentMonth;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
    const month1Name = getText(this.config.locale, 'months')[currentMonth.getMonth()];
    const month2Name = getText(this.config.locale, 'months')[nextMonth.getMonth()];
    
    monthYear.innerHTML = `
      <div class="bhc-month-pair">
        <div class="bhc-month-item">
          <span class="bhc-month-name">${month1Name} ${currentMonth.getFullYear()}</span>
        </div>
        <div class="bhc-month-item">
          <span class="bhc-month-name">${month2Name} ${nextMonth.getFullYear()}</span>
        </div>
      </div>
    `;
  }

  /**
   * Update calendar days
   * @param {Object} state
   */
  updateDays(state) {
    const daysContainer = this.element.querySelector('.bhc-days');
    const currentMonth = state.currentMonth;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
    const currentMonthDays = getCleanMonthDays(currentMonth);
    const nextMonthDays = getCleanMonthDays(nextMonth);
    
    // Render first month (current)
    const firstMonthHTML = this.renderMonthDays(currentMonthDays, currentMonth, state);
    
    // Render second month (next)
    const secondMonthHTML = this.renderMonthDays(nextMonthDays, nextMonth, state);
    
    daysContainer.innerHTML = `
      <div class="bhc-month-grid">
        <div class="bhc-month-calendar">
          ${firstMonthHTML}
        </div>
        <div class="bhc-month-calendar">
          ${secondMonthHTML}
        </div>
      </div>
    `;
  }

  /**
   * Render days for a single month
   * @param {Date[]} calendarDays
   * @param {Date} month
   * @param {Object} state
   * @returns {string}
   */
  renderMonthDays(calendarDays, month, state) {
    const days = getText(this.config.locale, 'days');
    const weekdaysHTML = days.map(day => 
      `<div class="bhc-weekday">${day}</div>`
    ).join('');
    
    // Create a proper grid with empty cells for proper day positioning
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday = 0
    
    let daysHTML = '';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      daysHTML += '<div class="bhc-day-empty"></div>';
    }
    
    // Add actual days
    daysHTML += calendarDays.map(date => {
      return this.renderSingleDay(date, month, state);
    }).join('');
    
    return `
      <div class="bhc-weekdays">${weekdaysHTML}</div>
      <div class="bhc-days">${daysHTML}</div>
    `;
  }

  /**
   * Render a single day
   * @param {Date} date
   * @param {Date} month
   * @param {Object} state
   * @returns {string}
   */
  renderSingleDay(date, month, state) {
    const dateStr = formatDate(date);
    const dayData = state.availability.get(dateStr);
    const isCurrentMonth = date.getMonth() === month.getMonth();
    const isToday = isSameDay(date, new Date());
    const isPast = date < new Date() && !isToday;
    
    let classes = ['bhc-day'];
    let ariaLabel = getText(this.config.locale, 'ariaSelectDate', { date: formatDateLocale(date, this.config.locale) });
    
    if (!isCurrentMonth) {
      classes.push('bhc-day-other-month');
    }
    
    if (isToday) {
      classes.push('bhc-day-today');
    }
    
    // Determine if day is clickable and its state
    let isClickable = false;
    let isDisabled = false;
    let isOutOfRange = false;
    let canSelectAsCheckIn = false;
    
    if (isCurrentMonth && !isPast) {
      if (!state.startDate) {
        // No start date selected - only available days without close_to_arrival can be clicked
        isClickable = dayData && dayData.available && !dayData.closeToArrival;
        isDisabled = !isClickable;
      } else if (state.startDate && !state.endDate) {
        // Start date selected, choosing end date
        const maxEndDate = this.getMaxEndDate(state.startDate, state.availability);
        isClickable = date <= maxEndDate;
        isOutOfRange = date > maxEndDate;
        
        // Check if this out-of-range date could be selected as check-in
        if (isOutOfRange && dayData && dayData.available && !dayData.closeToArrival) {
          canSelectAsCheckIn = true;
        }
      } else {
        // Both dates selected - any day can be clicked to start new selection
        isClickable = true;
      }
    } else {
      isDisabled = true;
    }
    
    // Apply visual states based on clickability and availability
    if (isPast) {
      // Past days are always disabled
      classes.push('bhc-day-past');
      ariaLabel += ` - ${getText(this.config.locale, 'ariaPastDay')}`;
    } else if (dayData) {
      // Check selection states first (out-of-range, disabled)
      if (isOutOfRange && canSelectAsCheckIn) {
        // Out of range but can be selected as check-in
        classes.push('bhc-day-out-of-range-checkin');
      } else if (isOutOfRange) {
        // Out of range for current selection - keep normal appearance but not clickable
        classes.push('bhc-day-out-of-range');
      } else if (isDisabled) {
        // Disabled for current selection
        classes.push('bhc-day-disabled');
      } else if (!dayData.available) {
        // Unavailable days are always disabled
        classes.push('bhc-day-unavailable');
        ariaLabel += ` - ${getText(this.config.locale, 'ariaNotAvailable')}`;
      } else if (dayData.closeToArrival) {
        // Close to arrival days - check if we're selecting checkout
        if (state.startDate && !state.endDate) {
          // Available for checkout only
          classes.push('bhc-day-checkout-only');
          ariaLabel += ` - ${getText(this.config.locale, 'ariaCheckoutOnly')}`;
        } else {
          // Not available for check-in
          classes.push('bhc-day-no-arrival');
          ariaLabel += ` - ${getText(this.config.locale, 'ariaNoArrival')}`;
        }
      } else {
        // Available days for check-in and checkout
        classes.push('bhc-day-available');
      }
    } else {
      classes.push('bhc-day-loading');
    }
    
    // Selection states
    if (state.startDate && isSameDay(date, state.startDate)) {
      classes.push('bhc-day-selected-start');
      ariaLabel = getText(this.config.locale, 'ariaSelectedStart', { date: formatDateLocale(date, this.config.locale) });
    } else if (state.endDate && isSameDay(date, state.endDate)) {
      classes.push('bhc-day-selected-end');
      ariaLabel = getText(this.config.locale, 'ariaSelectedEnd', { date: formatDateLocale(date, this.config.locale) });
    } else if (state.startDate && state.endDate && isInRange(date, state.startDate, state.endDate)) {
      classes.push('bhc-day-in-range');
      ariaLabel += ` - ${getText(this.config.locale, 'ariaInRange')}`;
    }
    
    // Update aria label for out-of-range check-in dates
    if (canSelectAsCheckIn) {
      ariaLabel += ` - ${getText(this.config.locale, 'ariaCanSelectAsCheckIn')}`;
    }
    
    return `
      <div 
        class="${classes.join(' ')}"
        data-date="${dateStr}"
        data-clickable="${isClickable}"
        data-can-select-checkin="${canSelectAsCheckIn}"
        data-out-of-range="${isOutOfRange}"
        tabindex="${isClickable ? '0' : '-1'}"
        role="button"
        aria-label="${ariaLabel}"
        ${isClickable ? 
          (dayData && dayData.closeToArrival && state.startDate && !state.endDate ? 
            `title="${getText(this.config.locale, 'ariaCheckoutOnly')}"` :
            `title="${getText(this.config.locale, 'tooltipAvailable')}"`) : 
          canSelectAsCheckIn ? `title="${getText(this.config.locale, 'tooltipCanSelectAsCheckIn')}"` :
          isOutOfRange ? `title="${getText(this.config.locale, 'tooltipOutOfRange')}"` :
          !dayData ? `title="${getText(this.config.locale, 'tooltipNotAvailable')}"` :
          dayData.closeToArrival ? `title="${getText(this.config.locale, 'tooltipNoArrival')}"` :
          isPast ? `title="${getText(this.config.locale, 'ariaPastDay')}"` : 
          `title="${getText(this.config.locale, 'tooltipDisabled')}"`}
      >
        <span class="bhc-day-number">${date.getDate()}</span>
        ${dayData && dayData.closeToArrival ? '<span class="bhc-dot-no-arrival">•</span>' : ''}
      </div>
    `;
  }

  /**
   * Update selection display
   * @param {Object} state
   */
  updateSelection(state) {
    const selection = this.element.querySelector('.bhc-selection');
    
    if (state.startDate && state.endDate) {
      const nights = this.calculateNights(state.startDate, state.endDate);
      const nightsText = nights === 1 ? 
        getText(this.config.locale, 'night') : 
        nights < 5 ? getText(this.config.locale, 'nights2to4') : 
        getText(this.config.locale, 'nights');
      
      // Use microcopy for completed selection
      const summaryText = getText(this.config.locale, 'selectionSummary', {
        nights: nights,
        startDate: formatDateLocale(state.startDate, this.config.locale),
        endDate: formatDateLocale(state.endDate, this.config.locale)
      });
      
      selection.innerHTML = `
        <div class="bhc-selection-item">
          <strong>${getText(this.config.locale, 'selectCheckIn')}:</strong>
          ${formatDateLocale(state.startDate, this.config.locale)}
        </div>
        <div class="bhc-selection-item">
          <strong>${getText(this.config.locale, 'selectCheckOut')}:</strong>
          ${formatDateLocale(state.endDate, this.config.locale)}
        </div>
        <div class="bhc-selection-item">
          <strong>${nights} ${nightsText}</strong>
        </div>
        <div class="bhc-selection-summary">
          ${summaryText}
        </div>
      `;
    } else if (state.startDate) {
      // Use microcopy for check-out prompt
      selection.innerHTML = `
        <div class="bhc-selection-item">
          <strong>${getText(this.config.locale, 'selectCheckIn')}:</strong>
          ${formatDateLocale(state.startDate, this.config.locale)}
        </div>
        <div class="bhc-selection-item">
          <em>${getText(this.config.locale, 'selectCheckOutPrompt')}</em>
        </div>
      `;
    } else {
      // Use microcopy for placeholder
      selection.innerHTML = `
        <div class="bhc-selection-item">
          <em>${getText(this.config.locale, 'placeholderSelectDates')}</em>
        </div>
      `;
    }
  }

  /**
   * Update price calculation display
   * @param {Object} state
   */
  updatePriceCalculation(state) {
    const priceContainer = this.element.querySelector('.bhc-price-calculation');
    
    if (state.startDate && state.endDate && state.nights > 0) {
      const nights = state.nights;
      const nightsText = nights === 1 ? 
        getText(this.config.locale, 'night') : 
        nights < 5 ? getText(this.config.locale, 'nights2to4') : 
        getText(this.config.locale, 'nights');
      
      let priceHTML = '';
      
      if (state.pricingStrategy === 'api' && state.priceBreakdown && state.priceBreakdown.length > 0) {
        // API pricing with detailed breakdown
        priceHTML = this.renderApiPriceBreakdown(state, nightsText);
      } else {
        // Fixed pricing
        priceHTML = this.renderFixedPriceBreakdown(state, nightsText);
      }
      
      priceContainer.innerHTML = `
        <div class="bhc-price-calculation-content">
          <div class="bhc-price-breakdown">
            ${priceHTML}
          </div>
          <div class="bhc-booking-section">
            <div class="bhc-total-price">
              <strong>${getText(this.config.locale, 'totalPrice')}: ${state.totalPrice.toLocaleString()} ${this.config.currency}</strong>
              ${state.pricingStrategy === 'api' && state.hasApiPrices ? 
                `<div class="bhc-price-source">${getText(this.config.locale, 'priceFromApi')}</div>` : 
                state.pricingStrategy === 'fallback' ? 
                  `<div class="bhc-price-source">${getText(this.config.locale, 'priceFallback')}</div>` : 
                  ''}
            </div>
            <a href="${this.buildBookingUrl(state)}" class="bhc-btn bhc-btn-booking" target="_blank">
              ${getText(this.config.locale, 'bookingButton', { 
                price: state.totalPrice.toLocaleString(), 
                currency: this.config.currency 
              })}
            </a>
          </div>
        </div>
      `;
      priceContainer.style.display = 'block';
    } else {
      priceContainer.style.display = 'none';
    }
  }

  /**
   * Render API price breakdown
   * @param {Object} state
   * @param {string} nightsText
   * @returns {string}
   */
  renderApiPriceBreakdown(state, nightsText) {
    const breakdown = state.priceBreakdown || [];
    let html = '';
    
    // Group consecutive days with same price
    const groupedPrices = this.groupConsecutivePrices(breakdown);
    
    groupedPrices.forEach(group => {
      if (group.nights === 1) {
        html += `
          <div class="bhc-price-item">
            <span class="bhc-price-label">${this.formatDateLocale(group.startDate, this.config.locale)}</span>
            <span class="bhc-price-value">${group.price.toLocaleString()} ${this.config.currency}</span>
          </div>
        `;
      } else {
        html += `
          <div class="bhc-price-item">
            <span class="bhc-price-label">${group.nights} ${nightsText} × ${group.price.toLocaleString()} ${this.config.currency}</span>
            <span class="bhc-price-value">${group.total.toLocaleString()} ${this.config.currency}</span>
          </div>
        `;
      }
    });
    
    return html;
  }

  /**
   * Render fixed price breakdown
   * @param {Object} state
   * @param {string} nightsText
   * @returns {string}
   */
  renderFixedPriceBreakdown(state, nightsText) {
    const pricePerNight = this.config.pricePerNight || 1000;
    
    return `
      <div class="bhc-price-item">
        <span class="bhc-price-label">${state.nights} ${nightsText} × ${pricePerNight.toLocaleString()} ${this.config.currency}</span>
        <span class="bhc-price-value">${state.totalPrice.toLocaleString()} ${this.config.currency}</span>
      </div>
    `;
  }

  /**
   * Group consecutive days with same price
   * @param {Array} breakdown
   * @returns {Array}
   */
  groupConsecutivePrices(breakdown) {
    if (!breakdown || breakdown.length === 0) return [];
    
    const groups = [];
    let currentGroup = null;
    
    breakdown.forEach(item => {
      if (!currentGroup || currentGroup.price !== item.price || currentGroup.source !== item.source) {
        // Start new group
        currentGroup = {
          startDate: item.date,
          endDate: item.date,
          price: item.price,
          source: item.source,
          nights: 1,
          total: item.price
        };
        groups.push(currentGroup);
      } else {
        // Extend current group
        currentGroup.endDate = item.date;
        currentGroup.nights++;
        currentGroup.total += item.price;
      }
    });
    
    return groups;
  }



  /**
   * Set loading state
   * @param {boolean} loading
   */
  setLoading(loading) {
    const loadingEl = this.element.querySelector('.bhc-loading');
    loadingEl.style.display = loading ? 'block' : 'none';
  }


  /**
   * Show error message
   * @param {string} message
   */
  showError(message) {
    const errorContainer = this.element.querySelector('.bhc-error');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Add error class to calendar for visual feedback
    this.element.classList.add('bhc-error-state');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  /**
   * Clear error message
   */
  clearError() {
    const errorContainer = this.element.querySelector('.bhc-error');
    errorContainer.style.display = 'none';
    
    // Remove error class from calendar
    this.element.classList.remove('bhc-error-state');
  }

  /**
   * Calculate number of nights between dates
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {number}
   */
  calculateNights(startDate, endDate) {
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Get the maximum possible end date for a given start date
   * @param {Date} startDate
   * @param {Map} availability
   * @returns {Date}
   */
  getMaxEndDate(startDate, availability) {
    const maxEndDate = addDays(startDate, this.config.maxNights);
    const current = new Date(startDate);
    
    // Find the last available day within maxNights range
    while (current < maxEndDate) {
      current.setDate(current.getDate() + 1);
      const dateStr = formatDate(current);
      const dayData = availability.get(dateStr);
      
      // If day is not available, return the previous day
      if (dayData && !dayData.available) {
        current.setDate(current.getDate() - 1);
        break;
      }
    }
    
    return current;
  }

  /**
   * Validate date selection (simplified version for rendering)
   * @param {Object} state
   * @returns {boolean}
   */
  validateSelection(state) {
    if (!state.startDate || !state.endDate) {
      return true;
    }
    
    const nights = this.calculateNights(state.startDate, state.endDate);
    
    // Check minimum nights
    if (nights < this.config.minNights) {
      return false;
    }
    
    // Check maximum nights
    if (nights > this.config.maxNights) {
      return false;
    }
    
    return true;
  }


  /**
   * Build booking URL with check-in and check-out parameters
   * @param {Object} state
   * @returns {string}
   */
  buildBookingUrl(state) {
    if (!state.startDate || !state.endDate) {
      return '#';
    }
    
    // Format dates as YYYY-MM-DD
    const checkIn = this.formatDateForUrl(state.startDate);
    const checkOut = this.formatDateForUrl(state.endDate);
    
    // Get booking URL from config or use default
    const baseUrl = this.config.bookingUrl || 'https://booking.example.com';
    
    // Build URL with parameters
    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      guests: this.config.persons || 2,
      currency: this.config.currency || 'CZK'
    });
    
    // Add unit ID if specified
    if (this.config.unitId) {
      params.set('unit', this.config.unitId);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Format date for URL parameter (YYYY-MM-DD)
   * @param {Date} date
   * @returns {string}
   */
  formatDateForUrl(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the rendered element
   * @returns {HTMLElement|null}
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy the rendered element
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
