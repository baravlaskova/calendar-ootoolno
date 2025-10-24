/**
 * State Manager for BetterHotel Calendar Widget
 * Centralized state management with event-driven updates
 */

/**
 * State Manager Class
 */
export class StateManager {
  constructor(initialState = {}, config = {}) {
    this.config = config;
    this.state = {
      startDate: null,
      endDate: null,
      currentMonth: new Date(),
      availability: new Map(),
      loading: false,
      calculating: false,
      error: null,
      hoverStartDate: null,
      hoverEndDate: null,
      nights: 0,
      totalPrice: 0,
      priceBreakdown: [],
      pricingStrategy: 'fixed',
      hasApiPrices: false,
      ...initialState
    };
    
    this.listeners = new Map();
    this.history = [];
    this.maxHistorySize = 10;
  }

  /**
   * Get current state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get specific state property
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set state property and notify listeners
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // Save to history
    this.saveToHistory(key, oldValue, value);
    
    // Notify listeners
    this.notifyListeners(key, value, oldValue);
  }

  /**
   * Update multiple state properties at once
   * @param {Object} updates
   */
  update(updates) {
    const changes = {};
    
    Object.keys(updates).forEach(key => {
      const oldValue = this.state[key];
      const newValue = updates[key];
      
      if (oldValue !== newValue) {
        this.state[key] = newValue;
        changes[key] = { oldValue, newValue };
      }
    });
    
    // Save to history
    this.saveToHistory('batch', null, changes);
    
    // Notify listeners for each change
    Object.keys(changes).forEach(key => {
      this.notifyListeners(key, changes[key].newValue, changes[key].oldValue);
    });
  }

  /**
   * Set date selection
   * @param {Date|null} startDate
   * @param {Date|null} endDate
   */
  setDateSelection(startDate, endDate) {
    const nights = this.calculateNights(startDate, endDate);
    const availability = this.state.availability;
    const priceCalculation = this.calculateTotalPrice(nights, startDate, endDate, availability);
    
    this.update({
      startDate,
      endDate,
      nights,
      totalPrice: priceCalculation.totalPrice,
      priceBreakdown: priceCalculation.priceBreakdown,
      pricingStrategy: priceCalculation.pricingStrategy,
      hasApiPrices: priceCalculation.hasApiPrices
    });
  }

  /**
   * Calculate number of nights between dates
   * @param {Date|null} startDate
   * @param {Date|null} endDate
   * @returns {number}
   */
  calculateNights(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Calculate total price based on nights and pricing strategy
   * @param {number} nights
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Map} availability
   * @returns {Object} - { totalPrice, priceBreakdown, pricingStrategy }
   */
  calculateTotalPrice(nights, startDate, endDate, availability) {
    const pricingStrategy = this.config.pricingStrategy || 'fixed';
    
    if (pricingStrategy === 'api' && availability && startDate && endDate) {
      return this.calculateApiPrice(nights, startDate, endDate, availability);
    } else {
      return this.calculateFixedPrice(nights);
    }
  }

  /**
   * Calculate price using API data
   * @param {number} nights
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Map} availability
   * @returns {Object}
   */
  calculateApiPrice(nights, startDate, endDate, availability) {
    const priceBreakdown = [];
    let totalPrice = 0;
    let hasApiPrices = false;
    
    const current = new Date(startDate);
    while (current < endDate) {
      const dateStr = this.formatDate(current);
      const dayData = availability.get(dateStr);
      
      if (dayData && dayData.price > 0) {
        priceBreakdown.push({
          date: new Date(current),
          price: dayData.price,
          source: 'api'
        });
        totalPrice += dayData.price;
        hasApiPrices = true;
      } else {
        // Fallback to fixed price for missing API data
        const fallbackPrice = this.config.pricePerNight || 1000;
        priceBreakdown.push({
          date: new Date(current),
          price: fallbackPrice,
          source: 'fallback'
        });
        totalPrice += fallbackPrice;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return {
      totalPrice,
      priceBreakdown,
      pricingStrategy: hasApiPrices ? 'api' : 'fallback',
      hasApiPrices
    };
  }

  /**
   * Calculate price using fixed price per night
   * @param {number} nights
   * @returns {Object}
   */
  calculateFixedPrice(nights) {
    const pricePerNight = this.config.pricePerNight || 1000;
    const totalPrice = nights * pricePerNight;
    
    return {
      totalPrice,
      priceBreakdown: [{
        price: pricePerNight,
        nights: nights,
        source: 'fixed'
      }],
      pricingStrategy: 'fixed',
      hasApiPrices: false
    };
  }

  /**
   * Format date to YYYY-MM-DD string
   * @param {Date} date
   * @returns {string}
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Set current month
   * @param {Date} month
   */
  setCurrentMonth(month) {
    this.set('currentMonth', month);
  }

  /**
   * Set availability data
   * @param {Map} availability
   */
  setAvailability(availability) {
    this.set('availability', availability);
  }

  /**
   * Set loading state
   * @param {boolean} loading
   */
  setLoading(loading) {
    this.set('loading', loading);
  }

  /**
   * Set calculating state
   * @param {boolean} calculating
   */
  setCalculating(calculating) {
    this.set('calculating', calculating);
  }

  /**
   * Set error message
   * @param {string|null} error
   */
  setError(error) {
    this.set('error', error);
  }


  /**
   * Set hover dates
   * @param {Date|null} hoverStartDate
   * @param {Date|null} hoverEndDate
   */
  setHoverDates(hoverStartDate, hoverEndDate) {
    this.update({
      hoverStartDate,
      hoverEndDate
    });
  }

  /**
   * Clear date selection
   */
  clearSelection() {
    this.update({
      startDate: null,
      endDate: null,
      hoverStartDate: null,
      hoverEndDate: null,
      nights: 0,
      totalPrice: 0,
      priceBreakdown: [],
      pricingStrategy: 'fixed',
      hasApiPrices: false
    });
  }

  /**
   * Clear error
   */
  clearError() {
    this.set('error', null);
  }

  /**
   * Reset to initial state
   */
  reset() {
    const initialState = {
      startDate: null,
      endDate: null,
      currentMonth: new Date(),
      availability: new Map(),
      loading: false,
      calculating: false,
      error: null,
      hoverStartDate: null,
      hoverEndDate: null,
      nights: 0,
      totalPrice: 0,
      priceBreakdown: [],
      pricingStrategy: 'fixed',
      hasApiPrices: false
    };
    
    this.update(initialState);
  }

  /**
   * Add state change listener
   * @param {string} key - State key to listen for (or '*' for all)
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Notify listeners of state change
   * @param {string} key
   * @param {any} newValue
   * @param {any} oldValue
   */
  notifyListeners(key, newValue, oldValue) {
    // Notify specific key listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          // console.error('State listener error:', error);
        }
      });
    }
    
    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(this.state, { [key]: oldValue }, key);
        } catch (error) {
          // console.error('State listener error:', error);
        }
      });
    }
  }

  /**
   * Save state change to history
   * @param {string} key
   * @param {any} oldValue
   * @param {any} newValue
   */
  saveToHistory(key, oldValue, newValue) {
    const historyEntry = {
      timestamp: Date.now(),
      key,
      oldValue,
      newValue,
      state: { ...this.state }
    };
    
    this.history.push(historyEntry);
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get state history
   * @returns {Array}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Undo last state change
   * @returns {boolean} - Success
   */
  undo() {
    if (this.history.length === 0) {
      return false;
    }
    
    const lastChange = this.history.pop();
    
    if (lastChange.key === 'batch') {
      // Handle batch updates
      Object.keys(lastChange.newValue).forEach(key => {
        this.state[key] = lastChange.newValue[key].oldValue;
      });
    } else {
      // Handle single property update
      this.state[lastChange.key] = lastChange.oldValue;
    }
    
    // Notify listeners
    this.notifyListeners('undo', this.state, lastChange.state);
    
    return true;
  }

  /**
   * Get state statistics
   * @returns {Object}
   */
  getStats() {
    return {
      listenersCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
      historySize: this.history.length,
      stateKeys: Object.keys(this.state),
      lastChange: this.history.length > 0 ? this.history[this.history.length - 1] : null
    };
  }

  /**
   * Create state snapshot
   * @returns {Object}
   */
  createSnapshot() {
    return {
      timestamp: Date.now(),
      state: { ...this.state },
      availability: new Map(this.state.availability)
    };
  }

  /**
   * Restore state from snapshot
   * @param {Object} snapshot
   */
  restoreSnapshot(snapshot) {
    if (snapshot && snapshot.state) {
      this.update(snapshot.state);
      if (snapshot.availability) {
        this.set('availability', new Map(snapshot.availability));
      }
    }
  }

  /**
   * Check if state has specific property
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return key in this.state;
  }

  /**
   * Get state keys
   * @returns {string[]}
   */
  keys() {
    return Object.keys(this.state);
  }

  /**
   * Get state values
   * @returns {any[]}
   */
  values() {
    return Object.values(this.state);
  }

  /**
   * Get state entries
   * @returns {Array}
   */
  entries() {
    return Object.entries(this.state);
  }

  /**
   * Destroy state manager and clean up
   */
  destroy() {
    this.listeners.clear();
    this.history = [];
    this.state = {};
  }
}
