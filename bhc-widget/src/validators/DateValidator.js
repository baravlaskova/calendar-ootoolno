/**
 * Date Validator for BetterHotel Calendar Widget
 * Handles all date validation logic and business rules
 */

import { formatDate, daysBetween, isSameDay, addDays } from '../utils.js';
import { getText } from '../i18n.js';

/**
 * Date Validator Class
 */
export class DateValidator {
  constructor(config) {
    this.config = config;
  }

  /**
   * Validate complete date selection
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Map} availability
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  validateSelection(startDate, endDate, availability) {
    if (!startDate || !endDate) {
      return { isValid: true, error: null };
    }
    
    const nights = daysBetween(startDate, endDate);
    
    // Check minimum nights
    if (nights < this.config.minNights) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'minStayRequired', { nights: this.config.minNights })
      };
    }
    
    // Check maximum nights
    if (nights > this.config.maxNights) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'invalidRange')
      };
    }
    
    // Check no-arrival on start date
    const startDateStr = formatDate(startDate);
    const startDayData = availability.get(startDateStr);
    
    if (startDayData && startDayData.closeToArrival) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'noArrivalDay')
      };
    }
    
    // Check availability for all nights in the range (excluding check-out day)
    // Turn-over rule: check-out day can be unavailable
    const availabilityCheck = this.validateAvailabilityInRange(startDate, endDate, availability);
    if (!availabilityCheck.isValid) {
      return availabilityCheck;
    }
    
    return { isValid: true, error: null };
  }

  /**
   * Validate availability for all nights in date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Map} availability
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  validateAvailabilityInRange(startDate, endDate, availability) {
    const current = new Date(startDate);
    while (current < endDate) {
      const dateStr = formatDate(current);
      const dayData = availability.get(dateStr);
      
      // Only check availability if we have data for this day
      // If no data is available, assume it's available (API might not return all days)
      if (dayData && !dayData.available) {
        return {
          isValid: false,
          error: getText(this.config.locale, 'errorUnavailableInRange')
        };
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return { isValid: true, error: null };
  }

  /**
   * Validate if a date can be selected as check-in date
   * @param {Date} date
   * @param {Map} availability
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  validateCheckInDate(date, availability) {
    const dateStr = formatDate(date);
    const dayData = availability.get(dateStr);
    const isPast = date < new Date() && !isSameDay(date, new Date());
    
    // Past days are not valid
    if (isPast) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'ariaPastDay')
      };
    }
    
    // If we have availability data, check it
    if (dayData) {
      if (!dayData.available) {
        return {
          isValid: false,
          error: getText(this.config.locale, 'ariaNotAvailable')
        };
      }
      
      if (dayData.closeToArrival) {
        return {
          isValid: false,
          error: getText(this.config.locale, 'ariaNoArrival')
        };
      }
    }
    
    return { isValid: true, error: null };
  }

  /**
   * Validate if a date can be selected as check-out date
   * @param {Date} date
   * @param {Date} startDate
   * @param {Map} availability
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  validateCheckOutDate(date, startDate, availability) {
    // Check-out date must be after check-in date
    if (date <= startDate) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'invalidRange')
      };
    }
    
    // Validate the complete range
    return this.validateSelection(startDate, date, availability);
  }

  /**
   * Check if a date is clickable based on current state
   * @param {Date} date
   * @param {Date} month
   * @param {Object} state
   * @returns {boolean}
   */
  isDateClickable(date, month, state) {
    const dateStr = formatDate(date);
    const dayData = state.availability.get(dateStr);
    const isCurrentMonth = date.getMonth() === month.getMonth();
    const isPast = date < new Date() && !isSameDay(date, new Date());
    
    if (!isCurrentMonth || isPast) {
      return false;
    }
    
    if (!state.startDate) {
      // No start date selected - only available days without close_to_arrival can be clicked
      return dayData && dayData.available && !dayData.closeToArrival;
    } else if (state.startDate && !state.endDate) {
      // Start date selected, choosing end date - check if date is within valid range AND available
      const maxEndDate = this.getMaxEndDate(state.startDate, state.availability);
      const isWithinRange = date <= maxEndDate;
      
      // If out of range, check if it can be selected as check-in
      if (!isWithinRange) {
        const validation = this.canSelectAsCheckIn(date, state.availability);
        return validation.isValid;
      }
      
      // If within range, check availability
      return dayData && dayData.available;
    } else {
      // Both dates selected - only days that can be selected as check-in can be clicked
      const validation = this.canSelectAsCheckIn(date, state.availability);
      return validation.isValid;
    }
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
   * Check if a date can be selected as check-in when clicking on disabled date
   * @param {Date} date
   * @param {Map} availability
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  canSelectAsCheckIn(date, availability) {
    const dateStr = formatDate(date);
    const dayData = availability.get(dateStr);
    const isPast = date < new Date() && !isSameDay(date, new Date());
    
    // Past days are not valid
    if (isPast) {
      return {
        isValid: false,
        error: getText(this.config.locale, 'ariaPastDay')
      };
    }
    
    // If we have availability data, check it
    if (dayData) {
      if (!dayData.available) {
        return {
          isValid: false,
          error: getText(this.config.locale, 'ariaNotAvailable')
        };
      }
      
      if (dayData.closeToArrival) {
        return {
          isValid: false,
          error: getText(this.config.locale, 'ariaNoArrival')
        };
      }
    }
    
    return { isValid: true, error: null };
  }

  /**
   * Determine if date swapping is needed and return swapped dates
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Object} - { needsSwap: boolean, newStart: Date, newEnd: Date }
   */
  handleDateSwapping(startDate, endDate) {
    if (endDate < startDate) {
      return {
        needsSwap: true,
        newStart: endDate,
        newEnd: startDate
      };
    }
    
    return {
      needsSwap: false,
      newStart: startDate,
      newEnd: endDate
    };
  }

  /**
   * Calculate number of nights between dates
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {number}
   */
  calculateNights(startDate, endDate) {
    return daysBetween(startDate, endDate);
  }

  /**
   * Check if selection meets minimum nights requirement
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {boolean}
   */
  meetsMinimumNights(startDate, endDate) {
    const nights = this.calculateNights(startDate, endDate);
    return nights >= this.config.minNights;
  }

  /**
   * Check if selection meets maximum nights requirement
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {boolean}
   */
  meetsMaximumNights(startDate, endDate) {
    const nights = this.calculateNights(startDate, endDate);
    return nights <= this.config.maxNights;
  }

  /**
   * Get validation summary for current selection
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Map} availability
   * @returns {Object}
   */
  getValidationSummary(startDate, endDate, availability) {
    if (!startDate || !endDate) {
      return {
        isValid: true,
        nights: 0,
        errors: [],
        warnings: []
      };
    }
    
    const validation = this.validateSelection(startDate, endDate, availability);
    const nights = this.calculateNights(startDate, endDate);
    
    return {
      isValid: validation.isValid,
      nights: nights,
      errors: validation.isValid ? [] : [validation.error],
      warnings: []
    };
  }


  /**
   * Get business rules configuration
   * @returns {Object}
   */
  getBusinessRules() {
    return {
      minNights: this.config.minNights,
      maxNights: this.config.maxNights,
      allowPastDates: false,
      allowSameDayCheckout: false,
      turnOverRule: true, // Check-out day can be unavailable
      closeToArrivalRule: true // Days with close_to_arrival cannot be check-in
    };
  }

  /**
   * Update validator configuration
   * @param {Object} newConfig
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}
