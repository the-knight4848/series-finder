# Series Finder — Presentation Outline (2–3 Minutes)

This presentation outline is designed for a concise 2–3 minute demonstration of the **Series Finder** React application. It can be directly presented or converted into a 3–5 slide deck in PDF or PPTX format.

---

## Slide 1: Title & Project Concept

### Content:
- **Project Title:** Series Finder
- **Subtitle:** Modern TV Show Discovery with React & TVmaze API
- **Presenter:** [Student Name] (Student ID: [Student ID])
- **Tech Stack:** React 19, Vite, JavaScript, CSS3, TVmaze Public API

### Key Speaking Points (30 seconds):
> "Hello everyone. Today I'm presenting **Series Finder**, a web application built with React and Vite that connects to the public TVmaze REST API. The objective was to build a polished, intuitive application for television enthusiasts and casual viewers to search for series, view ratings, explore cast and synopsis data, and discover official broadcast channels—all without needing a custom backend server."

---

## Slide 2: UI/UX Design & User Journey

### Content:
- **Visual Direction:**
  - Deep Purple primary theme (`#7c3aed`, `#4c1d95`) with light lavender accents and dark entertainment atmosphere.
  - High-contrast typography, rounded cards (`border-radius: 16px`), and smooth hover elevations.
- **User Journey in 5 Steps:**
  1. **Landing:** Welcomed by hero guide and quick-pick cards (e.g. "Batman", "Stranger Things").
  2. **Search:** Types in a query or clicks a suggestion chip, submitting via button or Enter key.
  3. **Feedback:** Views skeleton loaders and live progress during the search request.
  4. **Exploration:** Browses responsive cards with premiere years, ratings, and genre tags.
  5. **Deep Dive:** Clicks "View Details" to open an accessible modal with full synopsis and official links.

### Key Speaking Points (30 seconds):
> "We chose a cinema-inspired dark palette with deep purple and lavender to match popular streaming platforms like HBO Max and Netflix. We focused on clarity: before searching, the user sees a welcoming guide. During the search, skeleton loaders prevent UI layout shift. If no results are found, helpful tips guide the user rather than leaving them at a blank screen."

---

## Slide 3: Complete Data Flow Architecture

### Content:
- **Step 1: Form Validation**
  - Controlled React input with `.trim()`.
  - Empty queries display an inline validation warning without making redundant API requests.
- **Step 2: API Request (`services/tvmaze.js`)**
  - Uses `URLSearchParams` to format the dynamic query.
  - Native `fetch()` with `async/await`.
  - `AbortController` signal to cancel obsolete requests and avoid race conditions.
- **Step 3: React State Management (`App.jsx`)**
  - States: `query`, `shows`, `loading`, `error`, `selectedShow`, `validationMessage`.
  - Stale responses safely discarded.
  - URL query parameter synchronization (`?q=batman`).
- **Step 4: UI Rendering**
  - Unidirectional data flow drives 4 UI states: **Loading**, **Success**, **Empty**, and **Error**.

### Key Speaking Points (45 seconds):
> "The core requirement of this project was demonstrating a complete unidirectional data flow: **Form → API → State → UI**. When the user submits, we validate the input and construct the URL with `URLSearchParams`. Using `AbortController`, if a user types another search quickly, the previous request is safely aborted. State updates trigger React re-renders, and the UI dynamically displays one of our distinct states. The URL also updates seamlessly so users can bookmark or share search results."

---

## Slide 4: Live Demonstration & Core Features

### Demonstration Script (45 seconds):
1. **Initial View:** Show the clean landing page with quick suggestions.
2. **Empty Validation:** Click Search with an empty box—observe the validation error banner.
3. **Happy Path:** Type `Batman` and press Enter. Show skeleton loading, then the 10 returned series cards with ratings and genres.
4. **Detail Modal:** Click "View Details" on the 1966 Batman show. Highlight the sanitized synopsis, full metadata, and the official link. Press `Escape` to close the modal.
5. **No Results Query:** Search for `xyz999notfound`—showcase the friendly Empty State with search tips and suggestions.
6. **Responsive Layout:** Switch DevTools to Mobile View to demonstrate grid reflow and touch-friendly controls.

---

## Slide 5: Challenges & Solutions

### Content:
| Challenge Encountered | How It Was Solved |
|---|---|
| **Untrusted HTML in Summaries** | Created `SafeSummary` component using native `DOMParser` to parse safe tags (`<p>`, `<b>`, `<i>`) into React virtual DOM elements—**zero** use of `dangerouslySetInnerHTML`. |
| **Missing API Data & Broken Images** | Built `PosterImage` component with fallback placeholder and default values (`Year N/A`, `Unrated`, `Genre unlisted`). |
| **Stale Responses / Race Conditions** | Managed in-flight requests with React `useRef(AbortController)` to cancel previous searches when new searches begin. |
| **Accessibility Compliance** | Implemented keyboard navigation (`Escape` closes modal, focus restoration, body scroll lock, WCAG AA contrast). |

### Key Speaking Points (30 seconds):
> "Our main engineering challenges were security and edge cases. TVmaze summaries contain HTML markup, but instead of dangerously setting inner HTML, we parsed safe nodes into native React components. We also handled missing posters and null ratings so the UI never crashes or looks broken. Thank you, and I welcome any questions!"
