# 🧪 Testovací Checklist - Refaktorovaný BetterHotel Calendar Widget

## ✅ Automatické testy
- [ ] **Poznámka**: Automatické testy nejsou ještě implementované
- [ ] Architektura widgetu je navržena pro snadné testování
- [ ] Každý modul může být testován samostatně
- [ ] Pro testování použijte manuální testy níže

## 🖱️ Manuální testy funkcionality

### Základní funkcionalita
- [ ] **Inicializace widgetu** - Kalendář se načte bez chyb
- [ ] **Načítání dostupnosti** - API data se načtou a zobrazí
- [ ] **Výběr dat** - Kliknutí na datum funguje správně
- [ ] **Navigace měsíců** - Tlačítka předchozí/následující měsíc fungují

### Výběr dat
- [ ] **První klik** - Výběr data příjezdu
- [ ] **Druhý klik** - Výběr data odjezdu
- [ ] **Prohození dat** - Pokud vyberete odjezd před příjezdem, data se prohodí
- [ ] **Reset výběru** - Kliknutí na nové datum po dokončení výběru resetuje výběr

### Validace
- [ ] **Minimální pobyt** - Výběr kratšího pobytu než minNights zobrazí chybu
- [ ] **No-arrival dny** - Kliknutí na den s červenou tečkou (•) zobrazí chybu
- [ ] **Nedostupné dny** - Nedostupné dny jsou neklikatelné
- [ ] **Minulé dny** - Minulé dny jsou neklikatelné

### Výpočet ceny
- [ ] **Tlačítko "Spočítat cenu"** - Je aktivní pouze při platném výběru
- [ ] **Quote API** - Pokud funguje, zobrazí se cena z API
- [ ] **Fallback pricing** - Pokud quote API selže, použije se sum_nightly
- [ ] **Zobrazení ceny** - Cena se zobrazí ve správném formátu

### Lokalizace
- [ ] **Čeština** - Všechny texty jsou v češtině
- [ ] **Formátování dat** - Data jsou formátována podle české lokalizace
- [ ] **Formátování cen** - Ceny jsou formátovány podle české lokalizace

### Přístupnost
- [ ] **Keyboard navigation** - Kalendář lze ovládat pomocí šipek
- [ ] **Enter/Space** - Potvrzení výběru pomocí Enter nebo Space
- [ ] **ARIA labely** - Screen reader kompatibilita
- [ ] **Focus management** - Focus se správně pohybuje mezi prvky

### Responzivita
- [ ] **Desktop** - Dva měsíce vedle sebe
- [ ] **Tablet** - Dva měsíce pod sebou
- [ ] **Mobil** - Jeden měsíc, responzivní ovládání

### Event handling
- [ ] **Custom eventy** - Kalendář vysílá custom eventy
- [ ] **External integration** - Eventy lze zachytit zvenčí
- [ ] **Error handling** - Chyby se zobrazují správně

## 🔍 Testovací scénáře

### Scénář 1: Základní výběr
1. Klikněte na dostupný den (např. 15. prosince)
2. Klikněte na jiný dostupný den (např. 18. prosince)
3. Klikněte na "Spočítat cenu"
4. **Očekávaný výsledek**: Zobrazí se cena za 3 noci

### Scénář 2: Prohození dat
1. Klikněte na 20. prosince
2. Klikněte na 15. prosince
3. **Očekávaný výsledek**: Data se prohodí (15.-20. prosince)

### Scénář 3: Chybný výběr
1. Klikněte na den s červenou tečkou (•)
2. **Očekávaný výsledek**: Zobrazí se chyba "V tento den není možný příjezd"

### Scénář 4: Minimální pobyt
1. Vyberte dva po sobě jdoucí dny
2. Klikněte na "Spočítat cenu"
3. **Očekávaný výsledek**: Pokud je minNights > 1, zobrazí se chyba

### Scénář 5: Keyboard navigation
1. Klikněte na kalendář
2. Použijte šipky pro pohyb mezi dny
3. Stiskněte Enter pro výběr
4. **Očekávaný výsledek**: Kalendář reaguje na klávesnici

## 📊 Výsledky testů

### Automatické testy
- ⏳ **Status**: Neimplementované
- 📋 **Poznámka**: Architektura podporuje testování, ale testy nejsou ještě napsané

### Manuální testy
- ✅ Prošlo: ___/___
- ❌ Selhalo: ___/___

## 🎯 Závěr
- [ ] Všechny manuální testy prošly
- [ ] Widget funguje správně
- [ ] Architektura je připravena pro implementaci automatických testů
- [ ] Refaktorování bylo úspěšné

---

**Poznámka**: Pokud některý test selže, zkontrolujte Developer Console pro chybové zprávy a kontaktujte vývojáře.
