# Design Guide for SINTESA

## Theme: Warm Research Desk

SINTESA's interface design evokes a professional yet intuitive research experience, aligning with the template "scholar's parchment behind clean glass." A modern light theme complements the engineering and multimedia deepfake detection context.

---

## Tokens — Colors

| Name       | Value     | Token                 | Role                                                                           |
|------------|-----------|-----------------------|--------------------------------------------------------------------------------|
| Parchment  | `#faf8f5` | `--color-parchment`  | Main page canvas, card surfaces, and backgrounds for a warm, parchment look.  |
| Soft Paper | `#fdfbfa` | `--color-soft-paper` | Elevated card surfaces for enhanced focus (e.g., detection results or outputs).|
| Warm Mist  | `#d1d1cd` | `--color-warm-mist`  | Hairline borders for cards, buttons, and containers.                          |
| Ash        | `#92918b` | `--color-ash`        | Helper text, label descriptions in UI components.                              |
| Graphite   | `#72706b` | `--color-graphite`   | Secondary UI elements (e.g., inactive navbar text, muted labels).             |
| Ink        | `#27251e` | `--color-ink`        | Main text color ensuring high contrast with the parchment background.          |
| Deep Teal  | `#016a71` | `--color-deep-teal`  | Highlighting primary actions, active elements, and accents.                   |

---

## Typography

**Primary Font:** Inter, system-ui, -apple-system, sans-serif

### Font Tokens

| Role   | Weight | Size  | Line Height | Token          |
|--------|--------|-------|-------------|----------------|
| Body   | 400    | 16px  | 1.5         | `--text-body`  |
| UI     | 400    | 14px  | 1.43        | `--text-ui`    |
| Mini   | 500    | 12px  | 1.43        | `--text-mini`  |
| Badge  | 500    | 11px  | 1.33        | `--text-badge` |

---

## Spacing & Layout

### Spacing Scale

| Unit | Value     | Token          |
|------|-----------|----------------|
| s    | 4px       | `--spacing-s`  |
| m    | 8px       | `--spacing-m`  |
| l    | 16px      | `--spacing-l`  |
| xl   | 32px      | `--spacing-xl` |

### Border Radii

| Element       | Value |
|---------------|-------|
| Card          | 16px  |
| Input         | 12px  |
| Button        | 6px   |
| Default Chip  | 9999px|

---

## Component Design

### Search Input
- **Role:** Central query field for image/audio deepfake detection.
- **Styles:** `#faf8f5` background, `--color-warm-mist` thin border, inset padding, and rounded at 12px radius.
- **Placeholder Typography:** Graphite at 16px with 1.5 line height.
- **Special Feature:** Integrates inline labels for live-record mode.

### Detection Result Cards
- **Background:** Soft Paper (`#fdfbfa`).
- **Highlight color:** Deep Teal for `DEEPFAKE`. Emerald Green (`#2ecc71`) for `ORISINIL`.
- Use subtle shadows for the base contrast (e.g., `--shadow-subtle`).
- Pair visualizations (ELA and spectrogram) side-by-side compactly.

### Sidebar Nav Items
- **Default State:** Graphite icons with no background.
- **Active State:** Fills with `#016a71` (Deep Teal); transitions text color to white for high contrast.
- **Typography:** Sidebar labels at 14px to maintain compactness.

### Visual Analysis Cards
- **Background:** Soft Paper with subtle shadow.
- **Text Highlights:** `Ink` for neutral content.
- Ensure compact layout with side-to-side content summarizing inference dimensions or other test details.

---

## Color Application

- Avoid overuse of `--color-deep-teal`; reserve its presence for rare action buttons as impactful calls-to-action highly emphasizing selected user queries.
- Else, supplementary-neutral tones help multi-tier-level flexibilities.
