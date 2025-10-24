/**
 * Demo initialization for BetterHotel Calendar Widget
 */

// Initialize the calendar widget when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if BHC is available
  if (typeof window.BHC === 'undefined') {
    // console.error('BetterHotel Calendar Widget not loaded');
    return;
  }

  // Create calendar instance
  const calendar = window.BHC.createCalendar({
    container: '#bhc-calendar',
    apiBase: 'https://amazing-api.better-hotel.com/api/public',
    endpoints: {
      availability: '/availability'
    },
    clientId: '1441',
    unitId: null, // Set to specific unit ID if needed
    persons: 2,
    currency: 'CZK',
    locale: 'cs-CZ',
    minNights: 1,
    maxNights: 30,
    cacheTtlMs: 24 * 60 * 60 * 1000 // 24 hodiny
  });

  // Store reference for debugging
  window.demoCalendar = calendar;

  // Add some demo controls
  addDemoControls();
});

/**
 * Add demo controls for testing different configurations
 */
function addDemoControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.innerHTML = `
    <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3>Demo Controls</h3>
      <div style="margin-bottom: 10px;">
        <label>
          <input type="radio" name="locale" value="cs-CZ" checked> Czech (cs-CZ)
        </label>
        <label style="margin-left: 20px;">
          <input type="radio" name="locale" value="en-US"> English (en-US)
        </label>
      </div>
      <div style="margin-bottom: 10px;">
        <label>
          Currency: 
          <select id="currency-select">
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>
      <div style="margin-bottom: 10px;">
        <label>
          Persons: 
          <input type="number" id="persons-input" value="2" min="1" max="10">
        </label>
      </div>
      <div style="margin-bottom: 10px;">
        <label>
          Pricing Strategy: 
          <select id="pricing-strategy">
            <option value="quote">Quote API</option>
            <option value="sum_nightly">Sum Nightly</option>
          </select>
        </label>
      </div>
      <button id="reload-calendar" style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Reload Calendar
      </button>
    </div>
  `;

  document.body.insertBefore(controlsContainer, document.body.firstChild);

  // Add event listeners
  document.getElementById('reload-calendar').addEventListener('click', function() {
    const locale = document.querySelector('input[name="locale"]:checked').value;
    const currency = document.getElementById('currency-select').value;
    const persons = parseInt(document.getElementById('persons-input').value);

    // Destroy existing calendar
    if (window.demoCalendar) {
      window.demoCalendar.destroy();
    }

    // Create new calendar with updated config
    window.demoCalendar = window.BHC.createCalendar({
      container: '#bhc-calendar',
      apiBase: 'https://amazing-api.better-hotel.com/api/public',
      endpoints: {
        availability: '/availability'
      },
      clientId: '1441',
      unitId: null,
      persons: persons,
      currency: currency,
      locale: locale,
      minNights: 1,
      maxNights: 30,
      cacheTtlMs: 24 * 60 * 60 * 1000
    });
  });
}
