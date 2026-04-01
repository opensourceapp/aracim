

# Araç Teslim Kontrol Listesi (New Car Delivery Checklist)

## Overview
A mobile-first Turkish-language checklist app for car dealership staff to verify new vehicle delivery items. Pure client-side with localStorage persistence.

## Layout & UX

### Top Bar (sticky)
- App title: "Araç Teslim Kontrol Listesi"
- Circular progress indicator showing percentage complete
- Text: "32/58 tamamlandı" style counter
- Progress bar underneath

### Checklist Body
- 7 collapsible sections, each with a header showing section name + section progress (e.g., "4/6")
- All sections expanded by default
- Each item is a tappable row with:
  - Checkbox on the left
  - Item text
  - Tag badge on the right: amber/orange for `[critical]`, blue for `[tip]`
  - Checked items get a subtle strikethrough + muted style
- Large tap targets (min 48px height) for mobile usability

### Completion State
- When 100% complete, show a celebratory success banner with confetti-style animation
- "Tüm kontroller tamamlandı! 🎉" message

### Reset Button
- Fixed at bottom or in header
- Shows confirmation dialog: "Tüm ilerleme sıfırlansın mı?" with confirm/cancel
- Clears all localStorage checklist state

## Styling
- Clean, modern mobile UI using Tailwind
- White background, subtle section dividers
- Critical items: amber/orange left border + badge
- Tip items: blue left border + badge
- Smooth check/uncheck animations

## Data & State
- Checklist data hardcoded as a typed constant (7 sections, ~58 items)
- State stored in localStorage keyed by item index
- Loads saved state on mount, saves on every toggle

## Pages
- Single page app — just the index route with the checklist

