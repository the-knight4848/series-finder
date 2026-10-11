# Series Finder

> **A modern, responsive TV series search application powered by React and the TVmaze API.**

Series Finder is a frontend web application that allows users to quickly search, discover, and inspect TV series from around the world. Designed with an entertainment-first aesthetic featuring deep purple and lavender accents, the application provides an intuitive search experience with robust error handling, accessible navigation, and zero external backend requirements.

---

## 📌 Student Submission Information

- **Student Name:** `[Your Name Here]`
- **Student ID:** `[Your Student ID Here]`
- **Course / Module:** Frontend Web Development / React Practical Assignment
- **Project Name:** Series Finder (React + TVmaze REST API)
- **Repository / Submission Date:** 2026-10-11

---

## 🚀 Technology Stack

- **Frontend Library:** [React 19](https://react.dev/)
- **Build Tool & Bundler:** [Vite 8](https://vitejs.dev/)
- **Language:** JavaScript (ESNext, modern modules)
- **Markup & Styling:** HTML5 Semantic Elements & CSS3 (Custom Properties, Flexbox, Grid, Reduced Motion)
- **Data Fetching:** Native `fetch()` API with `async/await`, `AbortController`, and `URLSearchParams`
- **State Management:** React Hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
- **Testing & Verification:** [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/), [jsdom](https://github.com/jsdom/jsdom)
- **Linting:** [oxlint](https://oxc.rs/)

---

## 🌐 API Integration

This application interacts directly with the public **TVmaze REST API**:

- **Endpoint:** `https://api.tvmaze.com/search/shows?q={query}`
- **Authentication:** None required (Public REST API)
- **Data Flow:** Requests are constructed dynamically using the native `URLSearchParams` API:
  ```javascript
  const params = new URLSearchParams({
    q: searchQuery
  });
  const url = `https://api.tvmaze.com/search/shows?${params.toString()}`;
  ```

### API Fields Utilized:
- `show.id`: Unique series identifier used as the React key.
- `show.name`: Series title.
- `show.image.medium` / `show.image.original`: Poster art with automatic fallback to a custom styled placeholder if missing or failed to load.
- `show.summary`: Synopsis safely parsed and rendered without untrusted raw HTML injection.
- `show.premiered`: Premiere release date (and year extraction).
- `show.rating.average`: Community viewer rating out of 10.
- `show.genres`: Array of genre tags.
- `show.status`: Series broadcast status (*Running*, *Ended*, etc.).
- `show.language`: Primary audio language.
- `show.officialSite`: Direct link to official broadcast network site.
- `show.url`: Direct link to the TVmaze series page.

---

## 🔄 Data Flow Architecture

The application strictly models a clean unidirectional data flow:

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│   Search Form   │ ────> │  TVmaze API Request  │ ────> │   React State   │ ────> │   UI Rendering   │
│ (User Input/    │       │ (URLSearchParams +   │       │ (shows, loading,│       │ (Cards, Modal,   │
│  Quick-Picks)   │       │  fetch async/await)  │       │  error, query)  │       │  Feedback Views) │
└─────────────────┘       └──────────────────────┘       └─────────────────┘       └──────────────────┘
```

1. **Form Input:**
   The user types into a controlled search field or clicks a suggestion chip ("Batman", "Stranger Things", etc.). The input is validated: whitespace is trimmed with `.trim()`, and empty inputs trigger an instant inline validation alert without triggering an unnecessary network request.

2. **API Request (`services/tvmaze.js`):**
   The query parameters are encoded using `URLSearchParams`. An `AbortController` signal is passed into `fetch()` to automatically cancel any in-flight request if the user fires a newer search, preventing race conditions or stale responses from overwriting fresh data.

3. **React State (`App.jsx`):**
   - `query`: Current input text in the search bar.
   - `shows`: Array of returned series objects (or `null` before first search).
   - `loading`: Boolean indicating whether an HTTP request is currently pending.
   - `error`: Error message string if a network or server failure occurs.
   - `selectedShow`: Object holding the show currently viewed in the details modal.
   - `validationMessage`: Feedback displayed when the input is empty or invalid.
   - Loading state is guaranteed to reset in a `finally` block.

4. **UI Rendering:**
   The component hierarchy renders one of the four required UI states conditionally, syncing URL query parameters via `window.history.pushState`.

---

## 🎨 UI States Handled

| State | Visual Behavior | User Experience |
|---|---|---|
| **1. Initial / Welcome** | Hero banner, feature highlights, and popular quick-search chips. | Provides immediate clarity and guidance before any search is executed. |
| **2. Loading** | Shimmering card skeletons, animated spinner, and "Searching for series...". | Disables submit button to prevent duplicate clicks; announces status to assistive tech. |
| **3. Success** | Responsive grid of show cards with posters, ratings, years, and genres. | Displays result count (e.g. `Found 10 series for "Batman"`), with interactive detail modals. |
| **4. Empty** | Friendly "No series found" graphic with spelling tips and alternate queries. | Guides user to refine terms without confusing lack of results with a system error. |
| **5. Error** | High-contrast error banner with detailed message and "Retry Search" button. | Retains application usability and allows 1-click retry. |

---

## 🛡️ Security & Safe HTML Rendering

TVmaze series summaries contain HTML formatting tags (e.g., `<p>`, `<b>`, `<i>`). In compliance with modern web security practices:
- **No untrusted HTML injection:** The application does **not** use `dangerouslySetInnerHTML`.
- **Safe React Element Conversion (`utils/sanitize.jsx`):** The summary string is parsed using `DOMParser`, checked against a strict whitelist of safe formatting tags (`p`, `b`, `strong`, `i`, `em`, `span`, `br`, `ul`, `ol`, `li`), and converted directly into native React Virtual DOM elements with unique keys. Dangerous tags (`<script>`, `<iframe>`, `<object>`) and malicious attributes (`onclick`, `javascript:`) are completely eliminated.

---

## ♿ Accessibility & Responsive Design

- **Semantic HTML:** Uses `<header>`, `<main>`, `<section>`, `<article>`, `<form>`, `<label>`, and `<dialog>` semantics.
- **Keyboard Navigation:** Every interactive element is accessible via `Tab`, `Enter`, and `Space`.
- **Accessible Modal:**
  - Locks background scroll while open.
  - Closes with the `Escape` key, close button, or backdrop click.
  - Properly attributes `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="show-detail-title"`.
- **Accessible Contrast:** Meets WCAG AA contrast ratio across all backgrounds.
- **Reduced Motion:** Fully honors `prefers-reduced-motion: reduce` by disabling smooth transforms and animations for sensitive users.
- **Responsive Layout:** Adaptive CSS Grid spans gracefully from 4K displays down to 320px mobile screens without horizontal scroll.

---

## 📦 Project Directory Structure

```text
series-finder/
├── public/
│   ├── favicon.svg             # Application SVG icon
│   └── icons.svg
├── src/
│   ├── __tests__/
│   │   ├── App.test.jsx        # Integration tests for all UI states and interactions
│   │   └── tvmaze.test.js      # Unit tests for TVmaze API service
│   ├── components/
│   │   ├── EmptyState.jsx      # Empty search results with refinement tips
│   │   ├── ErrorState.jsx      # Error banner with retry mechanism
│   │   ├── Header.jsx          # App branding, title, and API status indicator
│   │   ├── InitialState.jsx    # Welcome view with suggestion chips
│   │   ├── LoadingState.jsx    # Animated spinner and skeleton placeholders
│   │   ├── PosterImage.jsx     # Safe poster image with fallback placeholder
│   │   ├── SearchForm.jsx      # Controlled input with validation & quick chips
│   │   ├── ShowCard.jsx        # Individual series card with metadata
│   │   ├── ShowDetails.jsx     # Accessible detail modal with safe summary
│   │   └── ShowGrid.jsx        # Responsive card grid with results counter
│   ├── services/
│   │   └── tvmaze.js           # API request logic using URLSearchParams & fetch
│   ├── utils/
│   │   ├── sanitize.jsx        # Safe DOM-to-React parser (no raw HTML injection)
│   │   └── stringUtils.js      # Plain text stripper utility
│   ├── App.jsx                 # Central state orchestration and URL synchronization
│   ├── index.css               # Design system, theme variables, and responsive CSS
│   └── main.jsx                # React root entrypoint
├── index.html                  # HTML5 document template
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite bundler & Vitest configuration
└── README.md                   # Documentation and assignment deliverables
```

---

## 💻 Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher (v20+ recommended)
- `npm` v9.0.0 or higher

### Installation Steps

1. **Extract or clone the project directory:**
   ```bash
   cd series-finder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your web browser.

4. **Run automated test suite:**
   ```bash
   npm run test
   ```

5. **Run code linter:**
   ```bash
   npm run lint
   ```

6. **Create an optimized production build:**
   ```bash
   npm run build
   ```

7. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## 📦 Preparing for Assignment Submission

When submitting this project as a ZIP archive:

1. **Do NOT include `node_modules` or `dist`:**
   ```bash
   # Windows PowerShell
   Compress-Archive -Path src, public, index.html, package.json, vite.config.js, README.md, PRESENTATION.md -DestinationPath Series-Finder-Submission.zip
   ```
2. The grading instructor can run `npm install` and `npm run dev` to launch the application.

---

## 📄 License
This project was created for educational purposes as a React Practical Assignment. TV show metadata and imagery are provided by the [TVmaze API](https://www.tvmaze.com/api).
