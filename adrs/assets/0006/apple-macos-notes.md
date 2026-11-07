# Apple's macOS guidance for the desktop layout (2026-11-07)

V = read on an Apple HIG or WebKit page. U = not in what we read; our own choice.

## Type (HIG Typography, macOS column, V), size/line height in pt (≈ CSS px)
- Large Title 26/32, Title 1 22/26, Title 2 17/22, Title 3 15/20
- Headline 13/16 bold, Body 13/16, Callout 12/15, Subheadline 11/14, Footnote and Captions 10/13
- Default 13, minimum 10. Avoid Ultralight, Thin and Light. The phone's clock uses Light; we keep it for consistency (U).

## Layout (V unless marked)
- The Layout page gives no macOS margins or readable width. Our spacing is our own: 32px page padding, 20px gaps, 20px card padding, 18px card corners (U).
- Widgets: 16pt margins (11 for tight groups), concentric corners. Cards borrow this (V).
- Toolbar: three item groups or fewer; window titles short. Height not given; we use 52px (U).
- Segmented controls are not for switching main views; use tabs (V).

## Colour and materials (V)
- Liquid Glass is for the functional layer only (toolbars, sidebars), not for cards or backgrounds.
- Toolbars: no custom backgrounds or tinted controls; content drives colour.
- No numeric values are given for macOS roles such as windowBackgroundColor. Ours are approximations (U):
  - light keeps the phone palette
  - dark uses greys instead of the phone's black: bg #161618, cards #242426, separators #3a3a3c
- The glass is `backdrop-filter: blur()` over a translucent background (U, no Apple web guidance).

## Charts (HIG Charts, V)
- Bars from a zero baseline, familiar ticks (0, 4, 8), few light grid lines, short labels.
- A summary title, a text equivalent of the values, and nothing that needs hover or colour alone.

## Web (WebKit, V)
- Safari 17's Add to Dock opens the app in its own window, using the manifest's name, display mode and start URL.
- Whether macOS uses `theme-color` for the title bar is unconfirmed, so nothing depends on it.

Sources: developer.apple.com/design/human-interface-guidelines/ typography, layout, sidebars, toolbars, segmented-controls, materials, color, widgets, charts; webkit.org/blog/14445/webkit-features-in-safari-17-0/
