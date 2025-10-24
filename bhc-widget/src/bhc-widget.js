/**
 * BetterHotel Calendar Widget - Main Library
 * Embeddable availability calendar widget
 */

import { 
  formatDate, 
  parseDate, 
  addDays, 
  daysBetween, 
  isSameDay, 
  isInRange
} from './utils.js';
import { getText, formatDateLocale } from './i18n.js';
import { ApiService } from './services/ApiService.js';
import { CalendarRenderer } from './renderers/CalendarRenderer.js';
import { DateValidator } from './validators/DateValidator.js';
import { StateManager } from './managers/StateManager.js';
import { EventHandler } from './handlers/EventHandler.js';

/**
 * Main BetterHotel Calendar Widget Class
 */
class BetterHotelCalendar {
  constructor(config) {
    this.config = this.mergeConfig(config);
    
    // Initialize state manager
    this.stateManager = new StateManager({}, this.config);
    
    // Initialize services
    this.apiService = new ApiService(this.config);
    this.renderer = new CalendarRenderer(this.config);
    this.validator = new DateValidator(this.config);
    this.eventHandler = new EventHandler(this.config, {
      stateManager: this.stateManager,
      validator: this.validator
    });
    this.container = null;
    this.element = null;
    
    // Setup state listeners
    this.setupStateListeners();
    
    this.init();
  }

  /**
   * Setup state change listeners
   */
  setupStateListeners() {
    // Listen for state changes and update renderer
    this.stateManager.subscribe('*', (newState) => {
      if (this.renderer && this.renderer.getElement()) {
        this.renderer.updateCalendar(newState);
        this.eventHandler.attachDayClickHandlers();
      }
    });
    
    // Listen for error changes
    this.stateManager.subscribe('error', (error) => {
      if (error) {
        this.renderer.showError(error);
      } else {
        this.renderer.clearError();
      }
    });
    
    // Listen for loading state changes
    this.stateManager.subscribe('loading', (loading) => {
      this.renderer.setLoading(loading);
    });
    
    // Listen for calculating state changes
    this.stateManager.subscribe('calculating', (calculating) => {
      this.renderer.setCalculating(calculating);
    });
    
    
    // Setup event handler listeners
    this.setupEventHandlerListeners();
  }

  /**
   * Setup event handler listeners
   */
  setupEventHandlerListeners() {
    // Listen for month changes
    this.eventHandler.addEventListener('monthChanged', (e) => {
      this.loadAvailability();
    });
    
    
    // Listen for selection cleared events
    this.eventHandler.addEventListener('selectionCleared', (e) => {
      // console.log('Selection cleared:', e.detail);
    });
  }

  /**
   * Merge user config with defaults
   */
  mergeConfig(userConfig) {
    const defaults = {
      apiBase: 'https://amazing-api.better-hotel.com/api/public',
      endpoints: {
        availability: '/availability',
        quote: '/price'
      },
      clientId: '1779',
      unitId: null,
      persons: 2,
      currency: 'CZK',
      locale: 'cs-CZ',
      minNights: 1,
      maxNights: 30,
      cacheTtlMs: 24 * 60 * 60 * 1000, // 24 hodines
      pricePerNight: 1000, // Pevná cena za noc v CZK
      pricingStrategy: 'fixed', // 'fixed' nebo 'api'
      bookingUrl: 'https://booking.example.com', // URL rezervačního systému
    };
    
    return { ...defaults, ...userConfig };
  }

  /**
   * Initialize the widget
   */
  async init() {
    try {
      this.container = this.resolveContainer();
      if (!this.container) {
        throw new Error('Container element not found');
      }
      
      this.render();
      
      // Setup refresh event listener AFTER rendering
      this.element.addEventListener('bhc-refreshData', (e) => {
        this.handleRefreshData();
      });
      
      // Load initial availability AFTER rendering
      await this.loadAvailability();
      
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Resolve container element
   */
  resolveContainer() {
    if (typeof this.config.container === 'string') {
      return document.querySelector(this.config.container);
    }
    return this.config.container;
  }

  /**
   * Render the calendar widget
   */
  render() {
    this.renderer.init(this.container);
    this.element = this.renderer.render(this.stateManager.getState());
    this.eventHandler.init(this.element);
    this.updateCalendar();
  }


  /**
   * Update calendar display
   */
  updateCalendar() {
    this.renderer.updateCalendar(this.stateManager.getState());
    if (this.eventHandler) {
      this.eventHandler.attachDayClickHandlers();
    }
  }



  /**
   * Validate date selection
   */
  validateSelection() {
    const validation = this.validator.validateSelection(
      this.stateManager.get('startDate'), 
      this.stateManager.get('endDate'), 
      this.stateManager.get('availability')
    );
    
    if (!validation.isValid) {
      this.stateManager.setError(validation.error);
      return false;
    }
    
    return true;
  }



  /**
   * Close calendar (trigger event, but don't hide it)
   */
  closeCalendar() {
    // Trigger custom event for external handling
    if (this.container) {
      const event = new CustomEvent('bhc-calendar-closed', {
        detail: {
          startDate: this.state.startDate,
          endDate: this.state.endDate,
          nights: this.state.startDate && this.state.endDate ? 
            daysBetween(this.state.startDate, this.state.endDate) : 0
        }
      });
      this.container.dispatchEvent(event);
    }
  }

  /**
   * Open calendar (show it)
   */
  openCalendar() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Load availability data
   */
  async loadAvailability() {
    const currentMonth = this.stateManager.get('currentMonth');
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
    
    this.stateManager.setLoading(true);
    
    try {
      const availability = await this.apiService.loadAvailability(startDate, endDate);
      this.stateManager.setAvailability(availability);
    } catch (error) {
      // console.error('❌ API Error:', error);
      this.handleError(error);
    } finally {
      this.stateManager.setLoading(false);
    }
  }

  /**
   * Handle refresh data request
   */
  async handleRefreshData() {
    const currentMonth = this.stateManager.get('currentMonth');
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0);
    
    this.stateManager.setLoading(true);
    
    try {
      // Force refresh from API
      const availability = await this.apiService.forceRefreshAvailability(startDate, endDate);
      this.stateManager.setAvailability(availability);
    } catch (error) {
      console.error('❌ Refresh Error:', error);
      this.handleError(error);
    } finally {
      this.stateManager.setLoading(false);
    }
  }




  /**
   * Handle errors
   */
  handleError(error) {
    // console.error('BetterHotel Calendar Error:', error);
    
    // Determine error type and show appropriate message
    let errorMessage = getText(this.config.locale, 'errorLoadingAvailability');
    
    if (error.message) {
      if (error.message.includes('HTTP')) {
        errorMessage = getText(this.config.locale, 'errorLoadingAvailability');
      } else if (error.message.includes('unavailable')) {
        errorMessage = getText(this.config.locale, 'invalidSelectionMessage');
      } else {
        errorMessage = error.message;
      }
    }
    
    this.stateManager.setError(errorMessage);
  }

  /**
   * Destroy widget
   */
  destroy() {
    if (this.renderer) {
      this.renderer.destroy();
    }
    if (this.eventHandler) {
      this.eventHandler.destroy();
    }
    if (this.stateManager) {
      this.stateManager.destroy();
    }
    this.element = null;
  }
}

/**
 * Global BHC namespace
 */
window.BHC = {
  createCalendar: (config) => {
    return new BetterHotelCalendar(config);
  }
};

export default BetterHotelCalendar;
