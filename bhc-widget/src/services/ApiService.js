/**
 * API Service for BetterHotel Calendar Widget
 * Handles all API communication and data parsing
 */

import { formatDate } from '../utils.js';

/**
 * API Service Class
 */
export class ApiService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cacheTtlMs = config.cacheTtlMs || 24 * 60 * 60 * 1000; // 24 hours default
    this.globalAvailabilityCache = new Map(); // Global cache for all availability data
    this.storageKey = `bhc-cache-${config.clientId}`;
    
    // Load cache from localStorage on initialization
    this.loadCacheFromStorage();
  }

  /**
   * Load availability data for date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Map>}
   */
  async loadAvailability(startDate, endDate, forceRefresh = false) {
    const cacheKey = `availability_${formatDate(startDate)}_${formatDate(endDate)}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached && !forceRefresh) {
      return new Map(cached);
    }
    
    if (forceRefresh) {
      // Force refresh from API
    }
    
    try {
      const url = this.buildAvailabilityUrl(startDate, endDate);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const availability = this.parseAvailabilityData(data);
      
      // Cache the result
      this.setCache(cacheKey, Array.from(availability.entries()));
      
      return availability;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }


  /**
   * Build availability API URL
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {string}
   */
  buildAvailabilityUrl(startDate, endDate) {
    const params = new URLSearchParams({
      clientId: this.config.clientId,
      from: formatDate(startDate),
      to: formatDate(endDate),
      persons: this.config.persons
    });
    
    if (this.config.unitId) {
      params.append('unitId', this.config.unitId);
    }
    
    const url = `${this.config.apiBase}${this.config.endpoints.availability}?${params}`;
    // console.log('🌐 Building API URL:', {
    //   apiBase: this.config.apiBase,
    //   endpoint: this.config.endpoints.availability,
    //   clientId: this.config.clientId,
    //   from: formatDate(startDate),
    //   to: formatDate(endDate),
    //   persons: this.config.persons,
    //   unitId: this.config.unitId,
    //   fullUrl: url
    // });
    
    return url;
  }

  /**
   * Parse availability API response
   * @param {Array} data
   * @returns {Map}
   */
  parseAvailabilityData(data) {
    const availability = new Map();
    
    // console.log('🔍 Parsing API data:', data);
    
    if (Array.isArray(data)) {
      // console.log(`📅 Processing ${data.length} days from API`);
      
      data.forEach(item => {
        if (item.date) {
          const dayData = {
            available: Boolean(item.availability),
            closeToArrival: Boolean(item.close_to_arrival),
            price: Number(item.price) || 0,
            minStay: Number(item.min_stay) || 1
          };
          
          
          availability.set(item.date, dayData);
          // console.log(`📅 ${item.date}:`, dayData);
        }
      });
    } else {
      // console.warn('⚠️ API returned non-array data:', data);
    }
    
    // console.log(`✅ Parsed ${availability.size} days total`);
    return availability;
  }

  /**
   * Get data from cache
   * @param {string} key
   * @returns {any|null}
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Set data in cache
   * @param {string} key
   * @param {any} value
   */
  setCache(key, value) {
    const timestamp = Date.now();
    this.cache.set(key, {
      value,
      timestamp: timestamp
    });
    // Save to localStorage after each cache update
    this.saveCacheToStorage();
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    this.globalAvailabilityCache.clear();
    localStorage.removeItem(this.storageKey);
    // console.log('🗑️ Cache cleared');
  }

  /**
   * Force refresh all availability data
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Map>}
   */
  async forceRefreshAvailability(startDate, endDate) {
    return this.loadAvailability(startDate, endDate, true);
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      ttlMs: this.cacheTtlMs,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Log current cache contents
   */
  logCacheContents() {
    // Cache logging removed for production
  }

  /**
   * Load cache from localStorage
   */
  loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const now = Date.now();
        
        // Check if cache is still valid
        if (cacheData.timestamp && (now - cacheData.timestamp) < this.cacheTtlMs) {
          this.cache = new Map(cacheData.cache);
          // console.log('📦 Loaded cache from localStorage:', this.cache.size, 'entries');
        } else {
          // console.log('⏰ Cache expired, clearing localStorage');
          localStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCacheToStorage() {
    try {
      const cacheData = {
        timestamp: Date.now(),
        cache: Array.from(this.cache.entries())
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
      // console.log('💾 Saved cache to localStorage:', this.cache.size, 'entries');
    } catch (error) {
      console.warn('⚠️ Failed to save cache to localStorage:', error);
    }
  }
}
