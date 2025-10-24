# BetterHotel Calendar Widget

Embeddable availability calendar widget for BetterHotel API. Clean vanilla JavaScript implementation with minimal CSS, accessibility support, and easy customization.

## 🚀 Quick Start

### 1. Include Files

```html
<link rel="stylesheet" href="dist/bhc-widget.css">
<script src="dist/bhc-widget.js"></script>
```

### 2. Add Container

```html
<div id="hotel-calendar"></div>
```

### 3. Initialize Widget

```javascript
BHC.createCalendar({
  container: '#hotel-calendar',
  apiBase: 'https://amazing-api.better-hotel.com/api/public',
  clientId: '1441',
  persons: 2,
  currency: 'CZK',
  locale: 'cs-CZ',
  pricePerNight: 1000 // Pevná cena za noc v CZK
});
```

## 💰 Automatický Výpočet Ceny

Widget podporuje automatický výpočet ceny s možností volby mezi pevnou cenou a dynamickými cenami z API. Po výběru termínu se pod kalendářem automaticky zobrazí:

- **Rozpis ceny** - detailní rozpis podle strategie ceny
- **Celková cena** - součet za celý pobyt
- **Formátování** - cena je zobrazena s oddělovači tisíců a měnou
- **Zdroj ceny** - indikace, zda cena pochází z API nebo fallback

### Strategie cen

#### 1. Pevná cena (`pricingStrategy: 'fixed'`)
```javascript
BHC.createCalendar({
  container: '#hotel-calendar',
  apiBase: 'https://amazing-api.better-hotel.com/api/public',
  clientId: '1441',
  pricePerNight: 1500, // 1500 CZK za noc
  pricingStrategy: 'fixed',
  currency: 'CZK',
  locale: 'cs-CZ'
});
```

#### 2. Dynamické ceny z API (`pricingStrategy: 'api'`)
```javascript
BHC.createCalendar({
  container: '#hotel-calendar',
  apiBase: 'https://amazing-api.better-hotel.com/api/public',
  clientId: '1441',
  pricePerNight: 1000, // Fallback cena za noc
  pricingStrategy: 'api',
  currency: 'CZK',
  locale: 'cs-CZ'
});
```

### Zobrazení ceny

#### Pevná cena
- **Rozpis:** "3 noci × 1 000 CZK = 3 000 CZK"
- **Celková cena:** "Celková cena: 3 000 CZK"

#### Dynamické ceny z API
- **Rozpis:** Detailní rozpis každého dne nebo skupin dnů se stejnou cenou
- **Celková cena:** "Celková cena: 3 200 CZK"
- **Zdroj:** "Cena z API" nebo "Cena z fallback"

### Fallback mechanismus

Při použití `pricingStrategy: 'api'`:
- Pokud API obsahuje ceny pro všechny dny → použije se API cena
- Pokud API neobsahuje cenu pro některé dny → použije se `pricePerNight` jako fallback
- Pokud API není dostupné → použije se pouze `pricePerNight`

### Lokalizace

Texty pro cenu jsou lokalizované:

- **Čeština:** "Celková cena", "za noc", "Cena z API", "Cena z fallback"
- **Angličtina:** "Total price", "per night", "Price from API", "Fallback price"

## 🎨 UX Specifikace - Kalendář ve stylu Booking.com

### **Základní princip**

Kalendář umožňuje uživateli vybrat **rozsah pobytu** – tedy **datum příjezdu** (*check-in*) a **datum odjezdu** (*check-out*).
Výběr probíhá interaktivně v jednom kalendářovém widgetu zobrazeném nad vstupním polem.

### **Průběh výběru**

#### 1. **První klik – výběr data příjezdu**

* Po kliknutí do pole pro výběr termínu se otevře kalendář se dvěma měsíci vedle sebe (desktop) nebo jedním (mobil).
* Uživatel klikne na požadované datum příjezdu.
* Toto datum se zvýrazní (např. modrým kruhem nebo zvýrazněným pozadím).
* V tu chvíli se automaticky aktivuje režim **výběru data odjezdu**.

#### 2. **Hover efekt – náhled rozptylu**

* Při najetí kurzorem na jiné datum (před potvrzením odjezdu) se zvýrazní **rozptyl dnů** mezi vybraným datem příjezdu a aktuálním datem pod kurzorem.
* Tento rozptyl má obvykle **světlejší barvu pozadí** nebo přechodový gradient, který vizuálně naznačuje délku pobytu.
* Na mobilu se rozptyl zobrazuje při tapnutí až po druhém výběru, ne při hoveru.

#### 3. **Druhý klik – výběr data odjezdu**

* Po kliknutí na druhé datum se rozptyl **potvrdí**.
* Dny mezi příjezdem a odjezdem se **trvale zvýrazní** – obvykle páskem nebo spojeným pozadím.
* Datum odjezdu se rovněž vizuálně zvýrazní (např. stejný styl jako příjezd, ale s jiným odstínem).

#### 4. **Zápis do polí**

* Po potvrzení druhého data se kalendář automaticky zavře.
* Do políček se vyplní vybraná data ve formátu např. `12. 10. 2025 – 15. 10. 2025`.

### **Interakce a chování**

#### ❌ **Reset výběru**

* Pokud uživatel klikne na jiné datum po dokončení výběru, výběr se resetuje a začne znovu od příjezdu.

#### 🔒 **Nedostupné termíny**

* Nedostupné dny (např. plně obsazené) jsou **neklikatelné** a vizuálně označené (např. šedé, přeškrtnuté nebo se sníženou opacitou).
* Pokud jsou v rozptylu mezi příjezdem a odjezdem nedostupné dny, rozptyl nelze potvrdit – kalendář zůstane ve stavu výběru odjezdu.

#### ⚙️ **Další logika**

* Den odjezdu může být stejný den, kdy někdo jiný přijíždí – tedy **den odjezdu není blokovaný jako obsazený den** (v systému dostupnosti se kontroluje `close_to_arrival` a `close_to_departure`).
* Při výběru rozptylu se respektují pravidla dostupnosti (např. minimální počet nocí).

### **Vizuální stavové prvky**

| Stav                 | Popis                                | Příklad stylu                     |
| -------------------- | ------------------------------------ | --------------------------------- |
| **Defaultní den**    | Běžně dostupný den                   | text tmavě šedý                   |
| **Hoverovaný den**   | Náhled rozptylu (při výběru odjezdu) | světlé modré pozadí               |
| **Vybraný příjezd**  | Aktivní první datum                  | modrý kruh, tučné písmo           |
| **Vybraný odjezd**   | Aktivní druhé datum                  | modrý kruh, tučné písmo           |
| **Rozptyl mezi dny** | Dny mezi příjezdem a odjezdem        | světlé modré pozadí               |
| **Nedostupný den**   | Není možné vybrat                    | šedý, neklikací                   |
| **Dnešní datum**     | Zvýraznění pro orientaci             | modrý rámeček                     |

### **Příklad chování (Booking.com-like):**

1. Klikneš na 12. října → označí se jako příjezd.
2. Najedeš na 15. října → 13. a 14. se zobrazí světle zvýrazněné.
3. Klikneš na 15. října → potvrzeno, rozptyl 12.–15. října je zvýrazněn.
4. Kalendář se zavře a data se propíšou do polí.

---

## 🏡 Výběr termínu pobytu (Check-in / Check-out)

### **1. Základní princip**

Komponenta pro výběr termínu pobytu umožňuje uživateli jednoduše určit:

* **datum příjezdu (check-in)**
* **datum odjezdu (check-out)**

Obě hodnoty se vybírají v jednom sdíleném kalendářovém rozhraní.
Cílem je minimalizovat počet kroků, předejít chybám a vizuálně jasně vyznačit aktuální stav výběru.

### **2. Logika interakce krok za krokem**

#### **Krok 1 – Otevření kalendáře**
* Kliknutím do pole pro výběr data se otevře kalendář se dvěma měsíci vedle sebe (desktop) nebo jedním (mobil).

#### **Krok 2 – Výběr data příjezdu (Check-in)**
* Uživatel klikne na požadované datum příjezdu.
* Toto datum se zvýrazní modrým kruhem.
* Stav komponenty se přepne do režimu **výběru data odjezdu (Check-out)**.

#### **Krok 3 – Náhled rozptylu při hoveru**
* Při pohybu myší nad jinými daty se zobrazí **náhled pobytu** – světle zvýrazněné dny mezi check-inem a aktuálním dnem pod kurzorem.
* Nedostupné dny ukončí rozptyl – nelze přes ně přejít.

#### **Krok 4 – Výběr data odjezdu (Check-out)**
* Druhým kliknutím uživatel potvrdí datum odjezdu.
* Rozptyl dnů mezi příjezdem a odjezdem se **trvale zvýrazní**.

#### **Krok 5 – Automatické uzavření kalendáře**
* Po potvrzení obou dat se kalendář **automaticky zavře**.
* Vybraná data se přenesou do polí.

### **3. Chování a stavy**

| Stav                       | Popis                                      | Příklad                                                |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| **Prázdný výběr**          | Žádné datum zatím vybráno                  | Pole placeholder „Vyberte termín"                      |
| **Vybraný check-in**       | První klik potvrzen, čeká se na check-out  | Datum zvýrazněno, text „Vyberte odjezd" |
| **Hover rozptyl**          | Mezi check-inem a kurzorem                 | Světlejší pás mezi dny                                 |
| **Potvrzený rozptyl**      | Check-in + check-out vybrány               | Dny mezi nimi zvýrazněné                               |
| **Nedostupné dny**         | Není možné vybrat                          | Šedý text, kurzor „not-allowed"                        |
| **Reset výběru**           | Kliknutí na jiné datum po dokončení výběru | Předchozí výběr se smaže, začíná znovu od check-inu    |

### **4. Mikrokopie / textové stavy**

| Kontext               | Text                               |
| --------------------- | ---------------------------------- |
| Před výběrem          | „Vyberte datum příjezdu a odjezdu" |
| Po výběru prvního dne | „Vyberte datum odjezdu"            |
| Při nevalidním výběru | „Vybraný termín není dostupný"     |
| Po potvrzení výběru   | „3 noci, 12.–15. října 2025"       |

### **Implementované funkce v tomto widgetu**

✅ **Všechny výše popsané funkce jsou implementovány:**
- Dvouměsíční zobrazení (desktop) / jednoměsíční (mobil)
- Hover efekt pouze po výběru check-in data
- Automatické zastavení hover efektu u nedostupných dnů
- Validace rozsahu - nelze vybrat rozsah přes nedostupné dny
- Turn-over pravidlo - check-out den může být nedostupný
- Reset výběru při kliknutí na nové datum
- Vizuální rozlišení všech stavů (hover, vybrané, nedostupné)
- Responzivní design
- Přístupnost (ARIA, klávesnice)
- Lokalizace (čeština, angličtina)

## 📋 Features

- ✅ **Availability Display** - Shows hotel availability from BetterHotel API
- ✅ **Date Range Selection** - Check-in and check-out date picker
- ✅ **Turn-over Support** - Respects hotel turn-over rules
- ✅ **No-arrival Validation** - Prevents arrival on `close_to_arrival` days
- ✅ **Price Calculation** - Quote API with nightly sum fallback
- ✅ **Localization** - Czech (cs-CZ) and English (en-US) support
- ✅ **Accessibility** - ARIA labels, keyboard navigation, focus management
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Memory Caching** - Configurable TTL cache for availability data
- ✅ **Dark Mode** - Automatic dark mode support
- ✅ **No Dependencies** - Pure vanilla JavaScript

## ⚙️ Configuration

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | string/HTMLElement | CSS selector or DOM element for widget |
| `apiBase` | string | Base URL for BetterHotel API |
| `clientId` | string | Client ID for API authentication |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `endpoints` | object | `{availability: '/availability', quote: '/price'}` | API endpoint paths |
| `unitId` | string/null | `null` | Specific unit ID (if needed) |
| `persons` | number | `2` | Number of guests |
| `currency` | string | `'CZK'` | Currency code (CZK, EUR, USD) |
| `locale` | string | `'cs-CZ'` | Locale (cs-CZ, en-US) |
| `pricePerNight` | number | `1000` | Fixed price per night for automatic calculation |
| `pricingStrategy` | string | `'fixed'` | Pricing strategy: 'fixed' or 'api' |
| `minNights` | number | `1` | Minimum stay length |
| `maxNights` | number | `30` | Maximum stay length |
| `cacheTtlMs` | number | `2700000` | Cache TTL in milliseconds (45 min) |

### Example Configuration

```javascript
BHC.createCalendar({
  container: '#bhc-calendar',
  apiBase: 'https://amazing-api.better-hotel.com/api/public',
  endpoints: {
    availability: '/availability',
    quote: '/price'
  },
  clientId: '1441',
  unitId: 'room-123',           // Optional
  persons: 4,
  currency: 'EUR',
  locale: 'en-US',
  minNights: 2,
  maxNights: 14,
  cacheTtlMs: 45 * 60 * 1000,  // 45 minutes
  pricingStrategy: 'quote'
});
```

## 🏗️ Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

```bash
# Clone or download the project
cd bhc-widget

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
bhc-widget/
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── README.md                       # This file
├── REFACTORING-DOCUMENTATION.md   # Refactoring documentation
├── TESTING-CHECKLIST.md           # Testing checklist
├── UX-SPECIFICATION.md            # UX specifications
├── UX-FLOW-DIAGRAMS.md            # UX flow diagrams
├── test-refactoring.js            # Automated tests
├── index.html                      # Demo page
└── src/
    ├── bhc-widget.js              # Main widget library (orchestrator)
    ├── styles.css                 # Widget styles
    ├── demo.js                    # Demo initialization
    ├── i18n.js                    # Localization texts
    ├── utils.js                   # Utility functions
    ├── managers/
    │   └── StateManager.js        # State management and history
    ├── services/
    │   └── ApiService.js          # API communication and caching
    ├── renderers/
    │   └── CalendarRenderer.js    # UI rendering and updates
    ├── validators/
    │   └── DateValidator.js       # Date validation and business logic
    └── handlers/
        └── EventHandler.js        # Event handling and keyboard navigation
```

## 🏗️ Architecture

The widget uses a modular architecture with separated concerns:

- **StateManager** - Centralized state management with history and undo/redo
- **ApiService** - API communication with caching and error handling  
- **CalendarRenderer** - UI rendering and visual updates
- **DateValidator** - Date validation and business logic
- **EventHandler** - Event handling and keyboard navigation

For detailed architecture documentation, see [REFACTORING-DOCUMENTATION.md](./REFACTORING-DOCUMENTATION.md).

## 🧪 Testing

### Automated Tests
The widget is designed to be fully testable with comprehensive test coverage planned:

- **Module Testing** - Each module can be tested independently
- **State Management** - State updates, history, undo/redo functionality
- **Date Validation** - Business rules and edge cases
- **API Service** - Data parsing, caching, error handling
- **Event Handling** - User interactions and custom events
- **Rendering** - UI updates and formatting

**Note:** Automated tests are not yet implemented but the architecture supports comprehensive testing.

### Manual Testing
For comprehensive manual testing, see [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md).

### Testing Scenarios

### 1. Cross-Month Selection
- Select check-in at end of month, check-out at start of next month
- Verify calendar navigation works correctly

### 2. No-Arrival Day Validation
- Try selecting a day with red dot (•) as check-in date
- Should show error: "No arrival possible on this day"

### 3. Pricing Fallback
- When quote API fails, should fallback to sum_nightly
- Check browser console for fallback messages

### 4. Minimum Stay Validation
- Select dates shorter than `minNights`
- Should show error with minimum stay requirement

### 5. Localization
- Switch between Czech and English
- Verify all texts are translated correctly

### 6. Keyboard Navigation
- Use arrow keys to navigate calendar
- Press Enter/Space to select dates
- Tab through interactive elements

## 🌐 WordPress Integration

### Custom HTML Block

```html
<link rel="stylesheet" href="https://your-domain.com/path/to/bhc-widget.css">
<div id="hotel-calendar"></div>
<script src="https://your-domain.com/path/to/bhc-widget.js"></script>
<script>
  BHC.createCalendar({
    container: '#hotel-calendar',
    apiBase: 'https://amazing-api.better-hotel.com/api/public',
    clientId: '1441',
    persons: 2,
    currency: 'CZK',
    locale: 'cs-CZ'
  });
</script>
```

### Plugin Integration

For WordPress plugins, you can enqueue the files:

```php
function enqueue_bhc_widget() {
    wp_enqueue_style('bhc-widget', plugin_dir_url(__FILE__) . 'assets/bhc-widget.css');
    wp_enqueue_script('bhc-widget', plugin_dir_url(__FILE__) . 'assets/bhc-widget.js', [], '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_bhc_widget');
```

## 🎨 Customization

### CSS Custom Properties

Override default colors using CSS custom properties:

```css
.bhc-widget {
  --bhc-primary-color: #your-color;
  --bhc-secondary-color: #your-color;
  --bhc-text-color: #your-color;
  --bhc-border-color: #your-color;
  --bhc-background-color: #your-color;
}
```

### Custom Styling

The widget uses semantic CSS classes for easy customization:

```css
/* Custom button styles */
.bhc-btn-calculate {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border: none;
  border-radius: 25px;
}

/* Custom calendar day styles */
.bhc-day-selected-start,
.bhc-day-selected-end {
  background: #your-brand-color;
  color: white;
}
```

## 🔧 API Integration

### Availability Endpoint

**GET** `{apiBase}/availability`

**Parameters:**
- `clientId` (required) - Client identifier
- `from` (required) - Start date (YYYY-MM-DD)
- `to` (required) - End date (YYYY-MM-DD)
- `persons` (required) - Number of guests
- `unitId` (optional) - Specific unit ID

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "availability": true,
    "close_to_arrival": false,
    "price": 1500,
    "min_stay": 1
  }
]
```

### Quote Endpoint

**GET** `{apiBase}/price`

**Parameters:**
- `clientId` (required) - Client identifier
- `from` (required) - Check-in date (YYYY-MM-DD)
- `to` (required) - Check-out date (YYYY-MM-DD)
- `persons` (required) - Number of guests
- `unitId` (optional) - Specific unit ID

**Response:**
```json
{
  "total": 4500,
  "currency": "CZK",
  "breakdown": [...]
}
```

## 🚨 Error Handling

The widget handles various error scenarios:

- **API Unavailable** - Shows error message, disables calendar
- **Invalid Dates** - Validates selection, shows specific errors
- **No Availability** - Disables unavailable dates
- **Pricing Failure** - Falls back to nightly sum calculation
- **Network Issues** - Retries with exponential backoff

## 🔒 Security

- **No Secret Keys** - Uses public BetterHotel API only
- **CORS Safe** - Designed for cross-origin requests
- **XSS Protection** - Sanitizes all user inputs
- **Content Security Policy** - Compatible with strict CSP

## 📱 Browser Support

- **Modern Browsers** - Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile** - iOS Safari 13+, Chrome Mobile 80+
- **Features Used** - ES2015+, CSS Grid, CSS Custom Properties

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues** - Report bugs via GitHub Issues
- **Documentation** - Check this README and inline code comments
- **API** - BetterHotel API documentation
- **Demo** - Run `npm run dev` and visit `http://localhost:3000`

## 📚 Documentation

- [README.md](./README.md) - This file (user documentation)
- [REFACTORING-DOCUMENTATION.md](./REFACTORING-DOCUMENTATION.md) - Architecture and refactoring details
- [TESTING-CHECKLIST.md](./TESTING-CHECKLIST.md) - Comprehensive testing guide
- [UX-SPECIFICATION.md](./UX-SPECIFICATION.md) - Complete UX specifications
- [UX-FLOW-DIAGRAMS.md](./UX-FLOW-DIAGRAMS.md) - Interaction flow diagrams

## 🔄 Changelog

### v1.0.0 (Current)
- **Modular Architecture** - Separated concerns into 5 specialized modules
- **Event-Driven Communication** - Modules communicate via events and callbacks
- **Testable Design** - Architecture supports comprehensive testing
- **Improved Maintainability** - Easier to maintain and extend
- **Better Code Organization** - Clear separation of responsibilities
- **Enhanced Debugging** - Better error handling and logging
- Core calendar functionality
- Czech and English localization
- Accessibility support
- Responsive design
- Memory caching
- Price calculation with fallback
