/**
 * Event Handler for BetterHotel Calendar Widget
 * Centralized event handling and keyboard navigation
 */

import { formatDate, parseDate, addDays, isSameDay } from '../utils.js';

/**
 * Event Handler Class
 */
export class EventHandler {
  constructor(config, dependencies) {
    this.config = config;
    this.stateManager = dependencies.stateManager;
    this.validator = dependencies.validator;
    this.element = null;
    this.handleDayClick = null;
  }

  /**
   * Initialize event handler with DOM element
   * @param {HTMLElement} element
   */
  init(element) {
    this.element = element;
    this.attachEventListeners();
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Navigation buttons
    this.element.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'prev') {
          this.handlePreviousMonth();
        } else if (action === 'next') {
          this.handleNextMonth();
        }
      });
    });


    // Clear button
    this.element.querySelector('.bhc-btn-clear').addEventListener('click', () => {
      this.handleClearSelection();
    });

    // Refresh button
    const refreshBtn = this.element.querySelector('.bhc-btn-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.handleRefreshData();
      });
    }

    // Keyboard navigation
    this.element.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Day click handlers
    this.attachDayClickHandlers();
  }

  /**
   * Attach click handlers to calendar days using event delegation
   */
  attachDayClickHandlers() {
    // Remove existing handler if it exists
    if (this.handleDayClick) {
      this.element.removeEventListener('click', this.handleDayClick);
    }
    
    // Use event delegation on the main widget element
    this.handleDayClick = (e) => {
      // Find the closest .bhc-day element (handles clicks on child elements like .bhc-day-number)
      const dayElement = e.target.closest('.bhc-day');
      if (dayElement) {
        const date = parseDate(dayElement.dataset.date);
        this.handleDateClick(date);
      }
    };
    
    // Attach event listener to main widget element
    this.element.addEventListener('click', this.handleDayClick);
  }

  /**
   * Handle date click
   * @param {Date} date
   */
  handleDateClick(date) {
    const dateStr = formatDate(date);
    const dayData = this.stateManager.get('availability').get(dateStr);
    const isPast = date < new Date() && !isSameDay(date, new Date());
    
    // console.log('🖱️ Date clicked:', dateStr, {
    //   dayData,
    //   isPast,
    //   hasStartDate: !!this.stateManager.get('startDate'),
    //   hasEndDate: !!this.stateManager.get('endDate'),
    //   currentState: {
    //     startDate: this.stateManager.get('startDate') ? formatDate(this.stateManager.get('startDate')) : null,
    //     endDate: this.stateManager.get('endDate') ? formatDate(this.stateManager.get('endDate')) : null
    //   }
    // });
    
    // Determine current selection state
    const hasStartDate = !!this.stateManager.get('startDate');
    const hasEndDate = !!this.stateManager.get('endDate');
    
    // console.log('🔍 Selection state:', { hasStartDate, hasEndDate });
    
    if (!hasStartDate) {
      // No start date selected - validate check-in date
      // console.log('📍 First click - selecting start date');
      
      const validation = this.validator.validateCheckInDate(date, this.stateManager.get('availability'));
      if (!validation.isValid) {
        // console.log('❌ Invalid check-in date:', validation.error);
        this.stateManager.setError(validation.error);
        return;
      }
      
      // console.log('✅ Setting start date:', dateStr);
      this.stateManager.setDateSelection(date, null);
    } else if (hasStartDate && !hasEndDate) {
      // Start date selected, choosing end date
      // console.log('📍 Second click - selecting end date');
      
      // Check if clicking on the same date as start date
      if (isSameDay(date, this.stateManager.get('startDate'))) {
        // console.log('📍 Clicked on same date as start - starting new selection');
        this.stateManager.setDateSelection(date, null);
        return;
      }
      
      // Check if this date is out of range but can be selected as check-in
      const maxEndDate = this.validator.getMaxEndDate(this.stateManager.get('startDate'), this.stateManager.get('availability'));
      const isOutOfRange = date > maxEndDate;
      
      if (isOutOfRange && dayData && dayData.available && !dayData.closeToArrival) {
        // This out-of-range date can be selected as check-in - start new selection
        // console.log('📍 Out-of-range date clicked - selecting as new check-in');
        this.stateManager.setDateSelection(date, null);
        return;
      }
      
      // Handle date swapping if needed
      const swapResult = this.validator.handleDateSwapping(this.stateManager.get('startDate'), date);
      let proposedStartDate = swapResult.newStart;
      let proposedEndDate = swapResult.newEnd;
      
      if (swapResult.needsSwap) {
        // console.log('🔄 Swapping dates:', formatDate(proposedStartDate), '->', formatDate(proposedEndDate));
      }
      
      // Validate the proposed selection
      const validation = this.validator.validateSelection(proposedStartDate, proposedEndDate, this.stateManager.get('availability'));
      if (!validation.isValid) {
        // console.log('❌ Validation failed:', validation.error);
        this.stateManager.setError(validation.error);
        return;
      }
      
      // console.log('✅ Validation passed, keeping new dates');
      this.stateManager.setDateSelection(proposedStartDate, proposedEndDate);
    } else {
      // Both dates selected - any day can be clicked to start new selection
      // console.log('📍 Third click - starting new selection');
      this.stateManager.setDateSelection(date, null);
    }
    
    this.stateManager.clearError();
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e
   */
  handleKeyboard(e) {
    const { key } = e;
    const focused = document.activeElement;
    
    if (focused.classList.contains('bhc-day')) {
      const currentDate = parseDate(focused.dataset.date);
      let newDate = null;
      
      switch (key) {
        case 'ArrowLeft':
          newDate = addDays(currentDate, -1);
          break;
        case 'ArrowRight':
          newDate = addDays(currentDate, 1);
          break;
        case 'ArrowUp':
          newDate = addDays(currentDate, -7);
          break;
        case 'ArrowDown':
          newDate = addDays(currentDate, 7);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.handleDateClick(currentDate);
          return;
      }
      
      if (newDate) {
        e.preventDefault();
        const newElement = this.element.querySelector(`[data-date="${formatDate(newDate)}"]`);
        if (newElement) {
          newElement.focus();
        }
      }
    }
  }

  /**
   * Handle previous month navigation
   */
  handlePreviousMonth() {
    const currentMonth = this.stateManager.get('currentMonth');
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    this.stateManager.setCurrentMonth(newMonth);
    
    // Trigger custom event for external handling
    this.triggerEvent('monthChanged', {
      direction: 'previous',
      newMonth: newMonth,
      oldMonth: currentMonth
    });
  }

  /**
   * Handle next month navigation
   */
  handleNextMonth() {
    const currentMonth = this.stateManager.get('currentMonth');
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    this.stateManager.setCurrentMonth(newMonth);
    
    // Trigger custom event for external handling
    this.triggerEvent('monthChanged', {
      direction: 'next',
      newMonth: newMonth,
      oldMonth: currentMonth
    });
  }


  /**
   * Handle clear selection button click
   */
  handleClearSelection() {
    this.stateManager.clearSelection();
    
    // Trigger custom event for external handling
    this.triggerEvent('selectionCleared', {
      previousSelection: {
        startDate: this.stateManager.get('startDate'),
        endDate: this.stateManager.get('endDate')
      }
    });
  }

  /**
   * Handle refresh data button click
   */
  handleRefreshData() {
    // Trigger custom event for external handling
    this.triggerEvent('refreshData', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle hover range preview
   * @param {Date} hoveredDate
   */
  handleHoverRange(hoveredDate) {
    // Only show hover if check-in is selected but check-out is not
    if (!this.stateManager.get('startDate') || this.stateManager.get('endDate')) {
      return;
    }
    
    // Don't show hover on mobile devices
    if (window.innerWidth <= 768) {
      return;
    }
    
    // Set hover end to the currently hovered date
    const hoverEndDate = this.findHoverEndDate(hoveredDate);
    this.stateManager.setHoverDates(this.stateManager.get('startDate'), hoverEndDate);
  }

  /**
   * Handle hover range hide
   */
  handleHoverRangeHide() {
    this.stateManager.setHoverDates(null, null);
  }

  /**
   * Find the end date for hover range
   * @param {Date} hoverDate
   * @returns {Date}
   */
  findHoverEndDate(hoverDate) {
    const startDate = this.stateManager.get('startDate');
    const maxEndDate = this.validator.getMaxEndDate(startDate, this.stateManager.get('availability'));
    
    // Return the hovered date, but limit it to the maximum possible end date
    return hoverDate <= maxEndDate ? new Date(hoverDate) : new Date(maxEndDate);
  }

  /**
   * Trigger custom event
   * @param {string} eventName
   * @param {Object} detail
   */
  triggerEvent(eventName, detail) {
    if (this.element) {
      const event = new CustomEvent(`bhc-${eventName}`, {
        detail: detail,
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Add custom event listener
   * @param {string} eventName
   * @param {Function} callback
   */
  addEventListener(eventName, callback) {
    if (this.element) {
      this.element.addEventListener(`bhc-${eventName}`, callback);
    }
  }

  /**
   * Remove custom event listener
   * @param {string} eventName
   * @param {Function} callback
   */
  removeEventListener(eventName, callback) {
    if (this.element) {
      this.element.removeEventListener(`bhc-${eventName}`, callback);
    }
  }

  /**
   * Check if two dates are the same day
   * @param {Date} date1
   * @param {Date} date2
   * @returns {boolean}
   */
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Get event statistics
   * @returns {Object}
   */
  getEventStats() {
    return {
      hasElement: !!this.element,
      hasDayClickHandler: !!this.handleDayClick,
      listenersCount: this.element ? this.element.addEventListener.toString().length : 0
    };
  }

  /**
   * Destroy event handler and clean up
   */
  destroy() {
    if (this.handleDayClick && this.element) {
      this.element.removeEventListener('click', this.handleDayClick);
    }
    
    // Remove all event listeners by cloning the element
    if (this.element && this.element.parentNode) {
      const newElement = this.element.cloneNode(true);
      this.element.parentNode.replaceChild(newElement, this.element);
    }
    
    this.element = null;
    this.handleDayClick = null;
  }
}
