# BetterHotel Calendar Widget - Produkční verze

## 🚀 Nasazení

### Soubory k nasazení:
- `dist/bhc-widget.iife.js` - Hlavní JavaScript soubor
- `dist/bhc-widget.css` - CSS styly
- `production.html` - Ukázková implementace

### Rychlé začlenění:

```html
<!-- 1. Přidejte CSS a JS soubory -->
<link rel="stylesheet" href="dist/bhc-widget.css">
<script src="dist/bhc-widget.iife.js"></script>

<!-- 2. Přidejte kontejner -->
<div id="my-calendar"></div>

<!-- 3. Inicializujte kalendář -->
<script>
  BHC.createCalendar({
    container: '#my-calendar',
    apiBase: 'https://amazing-api.better-hotel.com/api/public',
    clientId: '1441',
    persons: 2,
    currency: 'CZK',
    locale: 'cs-CZ',
    pricePerNight: 1000,
    bookingUrl: 'https://your-booking-system.com'
  });
</script>
```

## ✨ Nové funkce

### Rezervační tlačítko
- Zobrazuje se po výběru termínu
- Generuje URL s parametry: `checkin`, `checkout`, `guests`, `currency`, `unit`
- Otevírá novou záložku (`target="_blank"`)

### URL parametry
```
https://your-booking-system.com?checkin=2025-11-04&checkout=2025-11-07&guests=2&currency=CZK&unit=123
```

## 🔧 Konfigurace

| Parametr | Typ | Výchozí | Popis |
|----------|-----|---------|-------|
| `container` | string/HTMLElement | - | CSS selektor nebo DOM element |
| `apiBase` | string | - | Základní URL API |
| `clientId` | string | - | ID klienta |
| `bookingUrl` | string | - | URL rezervačního systému |
| `persons` | number | 2 | Počet osob |
| `currency` | string | 'CZK' | Měna |
| `locale` | string | 'cs-CZ' | Lokalizace |
| `pricePerNight` | number | 1000 | Pevná cena za noc |
| `unitId` | string | null | ID jednotky |

## 📱 Testování

1. Otevřete `production.html` v prohlížeči
2. Vyberte datum příjezdu a odjezdu
3. Klikněte na zelené rezervační tlačítko
4. Ověřte, že se otevře nová záložka s správnými parametry

## 🎯 Verze

- **Verze**: 1.0.0
- **Build**: Produkční
- **Datum**: $(date)
- **Branch**: promote-test
