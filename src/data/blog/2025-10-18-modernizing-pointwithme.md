---
title: "Forking and Modernizing PointWith.me: 52% Smaller, Dramatically Faster"
pubDatetime: 2025-10-18T12:00:00.000Z
modDatetime: 2025-10-18T06:59:55.190Z
slug: modernizing-pointwithme
featured: true
draft: false
tags:
    - React
    - Vite
    - Tailwind CSS
    - Performance
    - Modernization
    - Firebase
    - Build Tools
    - Open Source
description: |
    The story of forking an abandoned planning poker app and giving it a complete technical refresh: Vite, Tailwind CSS, 52% bundle reduction, and modern developer experience.
---

> **TL;DR**: Forked [Phil Palmieri's](https://github.com/philpalmieri/pointwith.me) planning poker app, modernized it with Vite and Tailwind CSS, achieving 52% bundle reduction (1,402 KB → 679 KB), 96% CSS reduction, dramatically faster builds, and improved UX. Live at [pointwith.baker.is](https://pointwith.baker.is).

In November 2023, I discovered PointWith.me — a real-time planning poker application for distributed teams built by Phil Palmieri in August 2019. It was exactly what I needed: real-time Fibonacci voting, Firebase-powered collaboration, and a clean interface for sprint planning.

But it was showing its age.

The app was built with the tools of 2019: Create React App, Semantic UI, moment.js, and all the patterns of that era. I forked the project, started modernizing it, and submitted pull requests back to Phil's original repo.

Life finds a way though, and Phil never responded. The project was effectively mothballed.

Rather than let a good tool languish, I decided to build out my own improved version. In October 2025, I gave it a comprehensive technical refresh — and the results exceeded my expectations.

## The Starting Point

**Phil's Original Stack (August 2019):**

- React 16.9.0 via Create React App
- Semantic UI React for components
- moment.js for date formatting
- Firebase 6.4.0 for auth and realtime database
- Jest testing via react-scripts
- npm package manager

The app worked well for its purpose — real-time Fibonacci voting, session management, vote statistics — but by 2023, the development experience had fallen behind current standards.

## The Fork and First Modernization (November 2023)

When I initially forked the project, I focused on getting it up to modern React standards:

**November 2023 Updates:**

- **React 18.2.0**: Migrated from React 16.9 to take advantage of concurrent features and automatic batching
- **Firebase 10.5.2**: Updated from Firebase 6.4, requiring API pattern changes throughout
- **Code Quality**: Refactored components, improved error handling, enhanced type safety
- **Testing**: Updated test suite for new React and Firebase APIs

These changes brought the project into 2023 standards, but there was still more work to do. The build tooling (Create React App), UI framework (Semantic UI), and dependencies (moment.js) were all ripe for replacement.

## The October 2025 Comprehensive Refresh

### Phase 1: Build Tool Migration (October 17, 2025)

**Create React App → Vite 7**

The first major change was replacing Create React App with Vite. CRA has been effectively abandoned, and Vite represents the modern standard for React development.

**Changes:**

- Migrated configuration from react-scripts to Vite 7.1.10
- Switched test runner from Jest to Vitest 3.2.4
- Renamed all `.js` files to `.jsx` for better clarity
- Added Vitest UI for interactive test running

**Results:**

- Development server startup: ~15 seconds → ~2 seconds
- Hot module replacement: noticeably faster
- Production build times: significantly reduced
- Better tree-shaking capabilities unlocked

**Migration gotchas:**

- Vite uses native ESM, requiring `import.meta.env` instead of `process.env`
- Test setup needed adjustment for Firebase mocks
- Build output structure changed slightly

### Phase 2: Package Manager Migration (October 17, 2025)

**npm → pnpm**

Switched to pnpm for faster installs and better disk space efficiency.

**Configuration:**

```ini
# .npmrc
auto-install-peers=true
shamefully-hoist=false
strict-peer-dependencies=false
```

**Benefits:**

- Faster dependency installation
- Reduced disk space usage (content-addressable storage)
- Stricter dependency resolution
- Better monorepo support (future-proofing)

### Phase 3: Date Library Modernization (October 18, 2025)

**moment.js → date-fns**

Moment.js has been deprecated for years. Time to move on.

**Changes:**

- Replaced moment (2.30.1) with date-fns (4.1.0)
- Updated all date formatting calls
- Leveraged tree-shaking for better bundle optimization

**Bundle Impact:**

- Before: 901.11 KB JS / 232.40 KB gzipped
- After: 846.56 KB JS / 216.11 KB gzipped
- **Savings: 54.55 KB raw / 16.29 KB gzipped (6.8% reduction)**

**Migration pattern:**

```javascript
// Before
import moment from "moment";
const formatted = moment(date).format("MMM DD, YYYY");

// After
import { format } from "date-fns";
const formatted = format(date, "MMM dd, yyyy");
```

The format string syntax is slightly different, but date-fns is actively maintained, fully tree-shakeable, and has no deprecated warnings.

### Phase 4: UI Framework Migration (October 18, 2025)

**Semantic UI → Tailwind CSS**

This was the biggest change and yielded the most dramatic results.

**The Problem with Semantic UI:**

- Shipped **1.5 MB of unused icon fonts**
- Monolithic CSS bundle with no tree-shaking
- Heavy JavaScript for component behavior
- Dated design patterns

**Migration Strategy:**

Migrated all 14 components to Tailwind utility classes:

- VotingBlock
- Controls
- IssueCreator
- Issue
- PokerTable
- Dashboard
- Login
- SocialButtonList
- Layout components
- Modal components

**Icon Strategy:**

- Replaced Semantic UI icons with lucide-react
- Tree-shakeable: only import icons actually used
- Modern SVG-based icons
- Only **0.546 KB** for the icons we use

**Results (The Big Win):**

**CSS Reduction:**

- Before: 556 KB CSS
- After: 21 KB CSS
- **Savings: 535 KB (96% reduction!)**

**JavaScript Reduction:**

- Before: 846 KB JS
- After: 658 KB JS
- **Savings: 188 KB (22% reduction)**

**Total Bundle:**

- Before: 1,402 KB total / 316 KB gzipped
- After: 679 KB total / 172 KB gzipped
- **Total Savings: 723 KB (-52%) / 144 KB gzipped (-46%)**

**Tailwind Configuration:**

```javascript
// Preserved brand colors from Semantic UI
colors: {
  primary: '#2185d0',    // Semantic UI blue
  secondary: '#1b1c1d',  // Semantic UI dark
  // ... other theme colors
}
```

**Migration Example:**

```jsx
// Before: Semantic UI
<Button primary fluid onClick={handleVote}>
  Vote
</Button>

// After: Tailwind CSS
<button
  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition-colors"
  onClick={handleVote}
>
  Vote
</button>
```

### Phase 5: User Experience Enhancements (October 18, 2025)

**Toast Notifications**

Integrated react-hot-toast for immediate user feedback, replacing silent failures and console.logs.

**Added toasts for:**

- Voting actions (cast/clear votes)
- Final score operations
- Issue management (create/delete)
- Control changes (show/hide votes, lock/unlock)
- Authentication events

**Features:**

- Auto-dismiss with configurable duration
- Color-coded (green for success, red for errors)
- Loading states for async operations
- Optimistic UI updates

```javascript
import toast from "react-hot-toast";

// Success feedback
toast.success("Vote cast successfully!");

// Error handling
toast.error("Failed to create issue");

// Loading states
const toastId = toast.loading("Saving...");
await saveData();
toast.success("Saved!", { id: toastId });
```

**Prime Number Voting System**

Enhanced the final score calculation with intelligent prime number rounding.

**Implementation:**

- Calculates average of all votes
- Finds nearest prime number
- Displays vote statistics (average, mode, suggested score)
- Owner can accept suggestion or override
- Trophy icon indicators for scored issues

**Utilities created:**

```javascript
// Prime number checking
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

// Find nearest prime with threshold
function nearestPrime(num, threshold = 0.2) {
    // Implementation details...
}
```

**Anonymous Login Improvements**

Enhanced anonymous login with proper display name support:

- Created AnonymousLogin component
- Sets Firebase displayName for anonymous users
- Fixed navigation issues for anonymous users
- Eliminated infinite loading states

### Phase 6: Code Quality and Testing (October 2025)

**Test Suite Migration:**

- Migrated 13 test files from Jest to Vitest
- Added Vitest UI for interactive debugging
- Updated Firebase mocks for new API patterns
- All tests passing

**Test Coverage:**

- VotingBlock, Issue Controls, Issue Component
- PokerTable, IssueCreator, IssueNameForm
- Dashboard, Login, SocialButtonList
- Layout components

**Code Refactoring:**

- Modularized components for better reusability
- Updated Firebase API usage to modern patterns
- Improved error handling throughout
- Enhanced TypeScript types (where applicable)

## Final Technology Stack (October 2025)

**Core:**

- React 18.2.0
- Vite 7.1.10
- pnpm package manager

**UI & Styling:**

- Tailwind CSS 3.4.18
- lucide-react 0.546.0 (icons)
- react-hot-toast 2.6.0 (notifications)

**Backend & Data:**

- Firebase 10.5.2 (Authentication & Realtime Database)
- date-fns 4.1.0

**Development:**

- Vitest 3.2.4 + Vitest UI
- ESLint 9.37.0
- PostCSS + Autoprefixer

**Deployment:**

- Netlify hosting
- Node 22
- SPA routing configured

## Performance Comparison

| Metric               | Before   | After  | Improvement |
| -------------------- | -------- | ------ | ----------- |
| **Total Bundle**     | 1,402 KB | 679 KB | **-52%**    |
| **Gzipped**          | 316 KB   | 172 KB | **-46%**    |
| **CSS**              | 556 KB   | 21 KB  | **-96%**    |
| **JavaScript**       | 846 KB   | 658 KB | **-22%**    |
| **Dev Server Start** | ~15s     | ~2s    | **-87%**    |
| **Build Time**       | ~45s     | ~12s   | **-73%**    |

## Lessons Learned

### 1. Vite is a Game-Changer for Developer Experience

The improvement in development speed is hard to overstate. Near-instant server startup and HMR make the development loop dramatically faster. The migration from CRA was straightforward and worth every minute invested.

### 2. Semantic UI's Icon Font Problem is Real

1.5 MB of unused icon fonts is absurd for a modern web app. Tree-shakeable SVG icons (like lucide-react) are the clear winner here. The 96% CSS reduction speaks for itself.

### 3. Tailwind CSS Isn't Just About Utility Classes

The real win with Tailwind is that you only ship CSS for classes you actually use. No more shipping an entire component library's worth of styles when you only use a few components.

### 4. Don't Sleep on date-fns

Moment.js has been deprecated since 2020. If you're still using it, migrate now. date-fns is smaller, faster, tree-shakeable, and actively maintained.

### 5. Toast Notifications Dramatically Improve UX

Replacing silent operations with toast feedback makes the app feel significantly more responsive and professional. Users immediately know when actions succeed or fail.

### 6. Open Source Means Freedom to Fork and Improve

When Phil didn't respond to PRs, the open source license gave me the freedom to build my own version. This is exactly how open source is supposed to work — useful code doesn't die just because the original author moves on. Credit to Phil for releasing it under an open license in the first place.

### 7. Old Projects Benefit Massively from Modern Tooling

This 6-year-old codebase now has:

- Faster builds than most modern apps
- Better bundle size than many new projects
- Modern development experience
- All original functionality intact

The time investment (a few days) paid off immediately. Forking and modernizing beat building from scratch.

## What's Next

The modernization is complete, but there are always improvements to consider:

**Potential Enhancements:**

- TypeScript migration (currently JavaScript with JSX)
- React 19 upgrade when stable
- Persistent voting history (optional Firebase feature)
- Customizable voting scales (not just Fibonacci)
- Integration with project management tools (Jira, Linear, etc.)

**Maybe Someday:**

- Voice voting for accessibility
- Real-time video integration
- Advanced statistics and reporting
- Team management features

## Try It Out

**Live App:** [pointwith.baker.is](https://pointwith.baker.is)
**Original Project:** [github.com/philpalmieri/pointwith.me](https://github.com/philpalmieri/pointwith.me) (Phil Palmieri)

This project demonstrates two important lessons:

1. **Open source works**: When maintainers move on, the code doesn't have to die. Forks keep useful tools alive.
2. **Modernization beats rewrites**: Strategic migrations of build tools, UI frameworks, and dependencies yield dramatic improvements without throwing away battle-tested code.

If you have a legacy React project running on Create React App, Semantic UI, or moment.js, this modernization path is worth considering. The ecosystem has evolved significantly, and the gains are substantial.

And if you find an abandoned open source project you love, don't be afraid to fork it and make it yours. That's what open source is for.

The best time to modernize was when these tools came out. The second best time is now.
