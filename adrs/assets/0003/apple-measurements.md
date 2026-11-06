# Apple iPhone measurements for the phone tokens (2026-11-05)

V = from an Apple HIG page. M = UIKit defaults or community knowledge, not published by Apple.

## Type (HIG Typography, V), size/leading pt, regular weight unless noted
- Large Title 34/41 (bold when emphasized)
- Title 1 28/34, Title 2 22/28, Title 3 20/25
- Headline 17/22 semibold, Body 17/22
- Callout 16/21, Subhead 15/20, Footnote 13/18
- Caption 1 12/16, Caption 2 11/13
- Tracking in em: 11 +0.006, 13 -0.006, 15 -0.016, 16 -0.02, 17 -0.026, 20 -0.023, 22 -0.012, 28 +0.014. There's no row for 34; use about +0.012 (between 32 and 36).

## Targets (V)
- 44×44 minimum hit area.
- Spacing around controls: about 12 with a bezel, about 24 without.

## Bars (M)
- Tab bar about 49 plus the bottom safe area, labels 10.
- Navigation bar 44; with a large title about 96.
- Use env(safe-area-inset-*) and never hard-code the status bar.

## Lists, sheets, controls (M)
- Row 44 minimum. Separator inset 16 (20 on iOS 26).
- Inset-grouped margin 16, radius 10 (about 26 on iOS 26).
- Section header Footnote 13, uppercase, secondary label.
- Grabber 36×5. Sheet radius 10 (about 38 on iOS 26). Medium detent about half height (V).
- Switch 51×31. Segmented control about 32 tall, 5 segments or fewer on iPhone (V).
- Margins 16 (20 on large phones).

## Colours
- The HIG says not to hard-code system colours (V). Ours are a palette inspired by them.
- systemRed #FF383C / dark #FF4245 (V); systemGreen #34C759 / dark #30D158 (V).
- Background #f2f2f7 / #000, cells #fff / #1c1c1e, separators #c6c6c8 / #38383a (M).
- Secondary label: the system value is rgba(60,60,67,0.6), about #8a8a8e on white (M). We use #6c6c70 for better contrast.
- Green text on white fails contrast at #34C759, so keep #248a3d for green text in light mode.
