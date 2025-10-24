/**
 * Internationalization texts for BetterHotel Calendar Widget
 */

export const texts = {
  'cs-CZ': {
    // Month names
    months: [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ],
    
    // Day names (short)
    days: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
    
    // UI texts
    selectDates: 'Vyberte datum příjezdu a odjezdu',
    clear: 'Vymazat',
    refreshData: 'Aktualizovat data',
    loading: 'Načítám...',
    noAvailability: 'Žádná dostupnost',
    selectCheckIn: 'Vyberte datum příjezdu',
    selectCheckOut: 'Vyberte datum odjezdu',
    invalidRange: 'Neplatný rozsah dat',
    noArrivalDay: 'V tento den není možný příjezd',
    minStayRequired: 'Minimální pobyt: {nights} nocí',
    nights: 'nocí',
    night: 'noc',
    nights2to4: 'noci',
    pricePerNight: 'za noc',
    totalPrice: 'Celková cena',
    priceCalculation: 'Výpočet ceny',
    priceFromApi: 'Cena z API',
    priceFallback: 'Cena z fallback',
    bookNow: 'Rezervovat',
    bookingButton: 'Rezervovat za {price} {currency}',
    
    
    // Errors
    errorLoadingAvailability: 'Chyba při načítání dostupnosti',
    errorInvalidDates: 'Neplatná data',
    errorNoAvailability: 'Žádná dostupnost pro vybrané období',
    errorUnavailableInRange: 'Vybrané období obsahuje nedostupné dny',
    
    // Accessibility
    ariaCalendar: 'Kalendář dostupnosti',
    ariaPreviousMonth: 'Předchozí měsíc',
    ariaNextMonth: 'Následující měsíc',
    ariaSelectDate: 'Vybrat datum {date}',
    ariaSelectedStart: 'Datum příjezdu: {date}',
    ariaSelectedEnd: 'Datum odjezdu: {date}',
    ariaInRange: 'V rozsahu pobytu',
    ariaNotAvailable: 'Nedostupné',
    ariaNoArrival: 'Není možný příjezd',
    ariaPastDay: 'Minulý den',
    ariaCheckoutAvailable: 'Možný odjezd',
    ariaCheckoutOnly: 'Dostupné pouze pro odjezd',
    ariaCanSelectAsCheckIn: 'Může být vybrán jako příjezd',
    ariaLoading: 'Načítám dostupnost',
    
    // Tooltips
    tooltipAvailable: 'Dostupné',
    tooltipNotAvailable: 'Nedostupné',
    tooltipNoArrival: 'Není možný příjezd (•)',
    tooltipCanSelectAsCheckIn: 'Klikněte pro výběr jako příjezd',
    tooltipDisabled: 'Nedostupné pro aktuální výběr',
    tooltipOutOfRange: 'Mimo rozsah pro aktuální výběr',
    tooltipSelected: 'Vybrané',
    tooltipInRange: 'V rozsahu pobytu',
    
    // Microcopy states
    placeholderSelectDates: 'Vyberte datum příjezdu a odjezdu',
    selectCheckOutPrompt: 'Vyberte datum odjezdu',
    invalidSelectionMessage: 'Vybraný termín není dostupný',
    selectionSummary: '{nights} nocí, {startDate} – {endDate}'
  },
  
  'en-US': {
    // Month names
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    
    // Day names (short)
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    
    // UI texts
    selectDates: 'Select check-in and check-out dates',
    clear: 'Clear',
    refreshData: 'Refresh Data',
    loading: 'Loading...',
    noAvailability: 'No availability',
    selectCheckIn: 'Select check-in date',
    selectCheckOut: 'Select check-out date',
    invalidRange: 'Invalid date range',
    noArrivalDay: 'No arrival possible on this day',
    minStayRequired: 'Minimum stay: {nights} nights',
    nights: 'nights',
    night: 'night',
    nights2to4: 'nights',
    pricePerNight: 'per night',
    totalPrice: 'Total price',
    priceCalculation: 'Price calculation',
    priceFromApi: 'Price from API',
    priceFallback: 'Fallback price',
    bookNow: 'Book Now',
    bookingButton: 'Book for {price} {currency}',
    
    
    // Errors
    errorLoadingAvailability: 'Error loading availability',
    errorInvalidDates: 'Invalid dates',
    errorNoAvailability: 'No availability for selected period',
    errorUnavailableInRange: 'Selected period contains unavailable days',
    
    // Accessibility
    ariaCalendar: 'Availability calendar',
    ariaPreviousMonth: 'Previous month',
    ariaNextMonth: 'Next month',
    ariaSelectDate: 'Select date {date}',
    ariaSelectedStart: 'Check-in date: {date}',
    ariaSelectedEnd: 'Check-out date: {date}',
    ariaInRange: 'In stay range',
    ariaNotAvailable: 'Not available',
    ariaNoArrival: 'No arrival possible',
    ariaPastDay: 'Past day',
    ariaCheckoutAvailable: 'Checkout available',
    ariaCheckoutOnly: 'Available for checkout only',
    ariaCanSelectAsCheckIn: 'Can be selected as check-in',
    ariaLoading: 'Loading availability',
    
    // Tooltips
    tooltipAvailable: 'Available',
    tooltipNotAvailable: 'Not available',
    tooltipNoArrival: 'No arrival possible (•)',
    tooltipCanSelectAsCheckIn: 'Click to select as check-in',
    tooltipDisabled: 'Not available for current selection',
    tooltipOutOfRange: 'Out of range for current selection',
    tooltipSelected: 'Selected',
    tooltipInRange: 'In stay range',
    
    // Microcopy states
    placeholderSelectDates: 'Select check-in and check-out dates',
    selectCheckOutPrompt: 'Select check-out date',
    invalidSelectionMessage: 'Selected term is not available',
    selectionSummary: '{nights} nights, {startDate} – {endDate}'
  }
};

/**
 * Get text for current locale
 * @param {string} locale
 * @param {string} key
 * @param {Object} params
 * @returns {string}
 */
export function getText(locale, key, params = {}) {
  const localeTexts = texts[locale] || texts['cs-CZ'];
  let text = localeTexts[key] || key;
  
  // Replace parameters
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}


/**
 * Format date according to locale
 * @param {Date} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDateLocale(date, locale) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
