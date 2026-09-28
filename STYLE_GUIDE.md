# SeniorBarman Design & Component Style Guide

This document defines the authoritative design tokens, layout standards, typography, color palettes, and border-radius rules for SeniorBarman components. All new components and page layouts must strictly adhere to these guidelines to ensure visual consistency and a premium user experience.

---

## 1. Border Radius & Shape Standards

> **Rule:** Do **NOT** use high border-radius utilities such as `rounded-2xl` or `rounded-3xl` for standard layout containers or cards. The app design system uses structured, sharp-to-subtly-rounded geometric shapes (`0.375rem` / `6px` to `0.5rem` / `8px`).

| Component Type | Permitted Tailwind Classes | Equivalent Radius | Use Case |
| --- | --- | --- | --- |
| **Cards & Container Boxes** | `rounded-sm`, `rounded-md`, `rounded-lg` | `2px` – `8px` | Main content cards, section headers, panel containers |
| **Buttons & Input Controls** | `rounded-sm`, `rounded-md` | `2px` – `6px` | Action buttons, text inputs, selects, dropdowns |
| **Data Tables & Grids** | `rounded-sm`, `rounded-md` | `2px` – `6px` | Table wrapper cards, data grids, search bars |
| **Badges & Tags** | `rounded-xs`, `rounded-sm`, `rounded-full` | `2px` – `4px` (or `full` for status dots) | Status badges, category labels, pill indicators |
| **Modals & Dialogs** | `rounded-md`, `rounded-lg` | `6px` – `8px` | Popups, dialogs, slide-over panels |

---

## 2. Color Palette & Dark/Light Mode Hierarchy

SeniorBarman uses curated HSL/Tailwind color tokens that automatically respond to theme toggling:

* **Primary Accent:** `orange-500` (`#f97316`)
* **Success / Money:** `emerald-500` / `emerald-600` (`#10b981`)
* **Warning / Pending:** `amber-500` / `yellow-500`
* **Destructive / Danger:** `red-500` / `red-600`
* **Card & Surface Backgrounds:** `bg-card` with `border-border` (`dark:border-zinc-800`)
* **Subtle Muted Surfaces:** `bg-muted/40` or `bg-muted/60`

---

## 3. Padding & Layout Spacing Guidelines

* **Page Container Padding:**
  - Desktop: `p-6` to `p-10` (`max-w-7xl mx-auto space-y-6` or `space-y-8`)
  - Mobile: `p-4 sm:p-6`
* **Card Padding:**
  - Standard Card: `p-5` or `p-6`
  - Compact Item / Table Row: `p-3` or `py-3 px-4`
* **Header Action Bars:**
  - Use `gap-2.5 flex-wrap` for button groups.
  - Buttons should have height `h-9` or `h-10` with `text-xs font-bold`.

---

## 4. Component Checklist for Developers & AI Agents

1. **Border Radius Check:** Ensure no `rounded-2xl` or `rounded-3xl` are introduced in pages or components.
2. **Typography Hierarchy:**
   - Page Titles: `text-2xl sm:text-3xl font-black tracking-tight`
   - Section Headers: `text-base font-bold`
   - Data Labels: `text-[10px]` or `text-xs font-bold uppercase tracking-wider text-muted-foreground`
3. **Table & Data Display:**
   - Use the shared `DataTable` (`components/ui/data-table.tsx`) component with `rounded-md` boundaries.
   - Include pagination controls for collections exceeding 10 items.
