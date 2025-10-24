# 🔄 UX Flow Diagrams - BetterHotel Calendar Widget

## 📊 Diagram toku interakce (UX Flow)

```mermaid
flowchart TD
    A[Uživatel klikne na pole pro výběr data] --> B[Otevře se kalendář]
    B --> C[Načtou se data dostupnosti z API]
    C --> D[Zobrazí se dva měsíce vedle sebe]
    
    D --> E{Uživatel klikne na datum}
    E --> F{Je datum dostupné?}
    F -->|Ne| G[Zobrazí se chyba - nedostupný den]
    F -->|Ano| H{Je to první klik?}
    
    H -->|Ano| I[Vybere se datum příjezdu - modrý kruh]
    I --> J[Aktivuje se režim výběru odjezdu]
    J --> K[Zobrazí se text: 'Vyberte datum odjezdu']
    
    H -->|Ne| L{Je odjezd dříve než příjezd?}
    L -->|Ano| M[Prohodí se data - příjezd = odjezd]
    L -->|Ne| N[Vybere se datum odjezdu]
    
    M --> O[Validace výběru]
    N --> O
    
    O --> P{Je rozsah validní?}
    P -->|Ne| Q[Zobrazí se chyba]
    P -->|Ano| R[Rozptyl se zvýrazní světle modře]
    R --> S[Zobrazí se počet nocí]
    S --> T[Kalendář se automaticky zavře]
    T --> U[Data se přenesou do polí]
    
    Q --> D
    G --> D
    
    %% Hover efekt
    J --> V{Uživatel najede myší na jiné datum}
    V -->|Ano| W[Zobrazí se náhled rozptylu]
    W --> X{Končí rozptyl u nedostupného dne?}
    X -->|Ano| Y[Rozptyl se zastaví u nedostupného dne]
    X -->|Ne| Z[Rozptyl pokračuje až k hoverovanému dni]
    Y --> V
    Z --> V
    V -->|Ne| AA[Skryje se náhled rozptylu]
    AA --> V
```

## 🔄 Stavový diagram komponenty

```mermaid
stateDiagram-v2
    [*] --> PrázdnýVýběr: Inicializace
    
    PrázdnýVýběr --> VybranýCheckIn: Klik na dostupný den
    PrázdnýVýběr --> PrázdnýVýběr: Klik na nedostupný den
    
    VybranýCheckIn --> HoverRozptyl: Hover nad jiným dnem
    VybranýCheckIn --> PotvrzenýRozptyl: Klik na dostupný den
    VybranýCheckIn --> PrázdnýVýběr: Klik na nedostupný den
    
    HoverRozptyl --> HoverRozptyl: Hover nad dalším dnem
    HoverRozptyl --> VybranýCheckIn: Hover mimo kalendář
    HoverRozptyl --> PotvrzenýRozptyl: Klik na dostupný den
    
    PotvrzenýRozptyl --> PrázdnýVýběr: Reset výběru
    PotvrzenýRozptyl --> [*]: Kalendář se zavře
    
    note right of VybranýCheckIn
        Modrý kruh pro příjezd
        Text: "Vyberte datum odjezdu"
    end note
    
    note right of HoverRozptyl
        Světle modré pozadí
        Rozptyl až k nedostupnému dni
    end note
    
    note right of PotvrzenýRozptyl
        Modré kruhy pro oba dny
        Světle modrý rozptyl mezi nimi
        Počet nocí zobrazen
    end note
```

## 🎨 Vizuální stavový diagram

```mermaid
graph LR
    A[Prázdný výběr] --> B[Vybraný check-in]
    B --> C[Hover rozptyl]
    C --> D[Potvrzený rozptyl]
    D --> A
    
    A --> A2[Nedostupný den]
    B --> B2[Nedostupný den]
    C --> C2[Nedostupný den]
    
    A2 --> A
    B2 --> A
    C2 --> A
    
    style A fill:#f9f9f9,stroke:#333,stroke-width:2px
    style B fill:#dbeafe,stroke:#3b82f6,stroke-width:2px
    style C fill:#dbeafe,stroke:#1e40af,stroke-width:2px
    style D fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    style A2 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px
    style B2 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px
    style C2 fill:#f3f4f6,stroke:#6b7280,stroke-width:2px
```

## 📱 Responzivní chování

```mermaid
flowchart TD
    A[Uživatel otevře kalendář] --> B{Typ zařízení}
    
    B -->|Desktop| C[Zobrazí se dva měsíce vedle sebe]
    B -->|Tablet| D[Zobrazí se dva měsíce pod sebou]
    B -->|Mobil| E[Zobrazí se jeden měsíc]
    
    C --> F[Hover efekt aktivní]
    D --> G[Hover efekt aktivní]
    E --> H[Hover efekt neaktivní - pouze tap]
    
    F --> I[Interakce s myší]
    G --> I
    H --> J[Interakce s dotykem]
    
    I --> K[Výběr dokončen]
    J --> K
```

## 🔧 API integrace flow

```mermaid
sequenceDiagram
    participant U as Uživatel
    participant C as Kalendář
    participant API as BetterHotel API
    participant Cache as Cache
    
    U->>C: Otevře kalendář
    C->>Cache: Kontrola cache
    Cache-->>C: Cache miss
    
    C->>API: GET /availability
    API-->>C: Data dostupnosti
    C->>Cache: Uložení do cache
    C->>U: Zobrazení kalendáře
    
    U->>C: Vybere datum příjezdu
    C->>U: Aktivuje hover efekt
    
    U->>C: Vybere datum odjezdu
    C->>API: GET /price (quote)
    API-->>C: Cena pobytu
    C->>U: Zobrazení ceny
    
    Note over U,C: Kalendář se zavře
```

## 🎯 User Journey Map

```mermaid
journey
    title Výběr termínu pobytu
    section Otevření
      Klikne na pole: 5: Uživatel
      Otevře se kalendář: 4: Uživatel
    section Výběr příjezdu
      Vybere datum příjezdu: 5: Uživatel
      Vidí modrý kruh: 4: Uživatel
    section Hover efekt
      Najede myší na jiné datum: 3: Uživatel
      Vidí náhled rozptylu: 4: Uživatel
    section Výběr odjezdu
      Vybere datum odjezdu: 5: Uživatel
      Vidí zvýrazněný rozptyl: 5: Uživatel
    section Dokončení
      Vidí počet nocí: 4: Uživatel
      Kalendář se zavře: 5: Uživatel
```

## 📋 Checklist implementace podle diagramů

- [x] **Prázdný výběr** - Inicializace kalendáře
- [x] **Vybraný check-in** - Modrý kruh, text "Vyberte odjezd"
- [x] **Hover rozptyl** - Světle modré pozadí, zastavení u nedostupných dnů
- [x] **Potvrzený rozptyl** - Modré kruhy, světle modrý rozptyl, počet nocí
- [x] **Reset výběru** - Kliknutí na nové datum
- [x] **API integrace** - Cache, quote pricing, fallback
- [x] **Responzivní design** - Desktop/tablet/mobil
- [x] **Error handling** - Nedostupné dny, nevalidní rozsah
- [x] **Accessibility** - ARIA, keyboard navigation
- [x] **Localization** - Česká/anglická lokalizace

## 🎨 Design System Integration

```mermaid
graph TB
    A[Design System] --> B[Calendar Component]
    B --> C[Date Picker]
    B --> D[Availability Display]
    B --> E[Price Calculator]
    
    C --> F[Check-in State]
    C --> G[Check-out State]
    C --> H[Hover State]
    
    D --> I[Available Days]
    D --> J[Unavailable Days]
    D --> K[No-arrival Days]
    
    E --> L[Quote Pricing]
    E --> M[Sum Pricing]
    E --> N[Price Display]
    
    style A fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style C fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

---

**Použití diagramů:**
- **UX Flow** - Pro pochopení celkového toku interakce
- **State Diagram** - Pro implementaci stavového stroje
- **Visual State** - Pro design a vizuální konzistenci
- **Responsive** - Pro responzivní implementaci
- **API Integration** - Pro technickou implementaci
- **User Journey** - Pro UX testování a optimalizaci
- **Design System** - Pro integraci do design systému
