# DESIGN: Mobile-First Redesign & Dedicated Mobile Control Panel

## UX & Visual Design System

### Design Philosophy
1. **Mobile-First Thinking**: Design for narrow touchscreens first, then progressively enhance for tablet and desktop viewports.
2. **Thumb-Zone Ergonomics**: Place primary live broadcast actions (Next Stanza, Prev Stanza, Blank) within natural reach of the user's thumb at the bottom 1/3 of the screen.
3. **High Contrast & Clarity**: Use dark theme surface backgrounds (`bg-slate-900`, `bg-slate-800`), crisp white typography, and vibrant status colors (Emerald for active broadcast, Amber for logo, Rose for blank).
4. **Touch-First Micro-Interactions**: Active tap scale effect (`active:scale-95`), tactile haptic-feel visual feedback, and smooth spring animations via Motion.

---

## Typography & Component Specifications

### 1. Mobile Top Header & Navigation Drawer
* **Header Height**: `56px` (`h-14`), sticky top `top-0 z-40`.
* **Hamburger Icon**: `24x24px` within a `48x48px` touch target.
* **Drawer Overlay**: Slide from left (`-translate-x-full` to `translate-x-0`), dark backdrop blur (`backdrop-blur-md bg-black/60`).

### 2. Mobile Live Control Panel
* **Setlist Quick Switcher Pill**:
  * Button at top of control panel: `bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 min-h-[48px]`.
  * Single tap opens bottom sheet drawer showing all songs in setlist with badges.
* **Stanza Card**:
  * Base: `bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 mb-3 cursor-pointer select-none active:scale-[0.98] transition-transform`.
  * Active Broadcast State: `bg-indigo-950/80 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20`.
  * Badge Label: `text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400`.
* **Sticky Bottom Stepper**:
  * Fixed bar: `fixed bottom-0 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-30 pb-safe`.
  * Prev Button: `flex-1 py-3.5 px-4 bg-slate-800 text-white font-bold rounded-xl text-center text-sm min-h-[48px] active:bg-slate-700`.
  * Next Button: `flex-1 py-3.5 px-4 bg-indigo-600 text-white font-bold rounded-xl text-center text-sm min-h-[48px] shadow-md shadow-indigo-600/30 active:bg-indigo-500`.

---

## Screen Breakpoint Map

```
+-------------------------------------------------------------+
| Viewport Width | Layout Mode        | Mobile Features       |
+----------------+--------------------+-----------------------+
| < 640px        | Mobile Portrait    | Full Mobile CP, Drawer|
| 640px - 767px  | Mobile Landscape   | Compact CP + Stepper  |
| 768px - 1023px | Tablet Hybrid      | 2-Column Responsive   |
| >= 1024px      | Desktop Full View  | 3-Column Studio CP    |
+----------------+--------------------+-----------------------+
```
