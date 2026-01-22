# Testing Patterns

**Analysis Date:** 2026-01-22

## Test Framework

**Status:** Not detected

**No Testing Infrastructure:**
- No `jest.config.js`, `vitest.config.ts`, or similar test runner configuration files
- No test dependencies in `package.json` (only contains `tailwindcss` as devDependency)
- No test files (`.test.js`, `.spec.js`, etc.) found in codebase
- No test assertion libraries (Jest, Vitest, Mocha, etc.)

**Current Approach:**
- Manual testing via browser only
- No automated test suite
- No CI/CD testing pipeline configured (render.yaml contains no test commands)

## Test File Organization

**Current State:** Not applicable - no test files exist

**Recommended Structure for Future Implementation:**
```
my-portfolio-website/
├── src/
│   ├── js/
│   │   ├── portfolio.js
│   │   └── portfolio.test.js
│   └── input.css
└── build/
    └── index.html
```

**Naming Convention if Implemented:**
- Test files should follow pattern: `[FileName].test.js` or `[FileName].spec.js`
- Co-located with source files in same directory

## Code Being Tested

The codebase contains three main JavaScript components that would benefit from testing:

### 1. Email Copy Function
**Location:** `build/index.html` lines 1521-1528

```javascript
function copyEmail() {
  const email = document.getElementById('contact-email').value;
  navigator.clipboard.writeText(email).then(function() {
    alert('Email copied to clipboard!');
  }, function(err) {
    alert('Failed to copy email.');
  });
}
```

**Testable Aspects:**
- Retrieves email from DOM element
- Calls Clipboard API
- Handles success and failure paths

### 2. Scroll Position Detection
**Location:** `build/index.html` lines 1532-1540

```javascript
function checkScrollPosition() {
  const scrollBtn = document.getElementById('scrollToTopBtn');
  if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 10) {
    scrollBtn.classList.remove('hidden');
  } else {
    scrollBtn.classList.add('hidden');
  }
}
window.addEventListener('scroll', checkScrollPosition);
```

**Testable Aspects:**
- Calculates scroll position correctly
- Shows/hides scroll button based on position
- Event listener attachment

### 3. TextScramble Class
**Location:** `build/index.html` lines 1544-1615

```javascript
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!@#$%^&*()-_=+[]{};:,.<>?';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    // Animation logic
    const promise = new Promise(resolve => this.resolve = resolve);
    // ... queue building
    this.frameRequest = requestAnimationFrame(this.update);
    return promise;
  }

  update() {
    // Render animation frame
    // ... output building
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}
```

**Testable Aspects:**
- Constructor initialization
- Text queue building
- Animation frame updates
- Promise resolution on completion
- Random character selection from charset

## Recommended Testing Strategy

### Unit Testing Priority

**High Priority (Core Functionality):**
1. `randomChar()` - Pure function, easy to test
2. `checkScrollPosition()` - Pure logic with DOM interaction
3. Email clipboard functionality - Promise-based

**Medium Priority (Complex Logic):**
1. `TextScramble.update()` - Frame animation logic
2. `TextScramble.setText()` - Queue building and promise handling

### Test Patterns to Implement

**DOM Mocking Pattern:**
```javascript
// For functions that interact with DOM
const mockElement = document.createElement('input');
mockElement.id = 'contact-email';
mockElement.value = 'test@example.com';
document.body.appendChild(mockElement);

// Test copyEmail() against mocked element
copyEmail();

// Cleanup
document.body.removeChild(mockElement);
```

**Class Instantiation Pattern:**
```javascript
// For TextScramble class
const el = document.createElement('div');
const scramble = new TextScramble(el);

expect(scramble.el).toBe(el);
expect(scramble.chars).toBeDefined();
expect(typeof scramble.update).toBe('function');
```

**Promise Testing Pattern:**
```javascript
// For setText() which returns Promise
const el = document.createElement('div');
const scramble = new TextScramble(el);

return scramble.setText('Test')
  .then(() => {
    expect(el.innerHTML).toBeDefined();
  });
```

**Event Listener Testing Pattern:**
```javascript
// For scroll event listener
const scrollEvent = new Event('scroll');
window.dispatchEvent(scrollEvent);

// Verify scroll button visibility changed
const scrollBtn = document.getElementById('scrollToTopBtn');
expect(scrollBtn.classList.contains('hidden')).toBe(true | false);
```

## Recommended Framework Selection

**For this static site, recommend:**

1. **Jest** (if using Node.js test runner)
   - Great for DOM testing with jsdom
   - Built-in mocking capabilities
   - Good assertion library
   - Command: `jest --watch`

2. **Vitest** (modern alternative, faster)
   - Drop-in Jest replacement
   - Faster execution
   - Native ES modules support
   - Command: `vitest`

3. **Playwright** (if E2E testing needed)
   - Browser automation
   - Visual regression testing
   - Cross-browser support

## Setup Configuration

**package.json additions (for Jest):**
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**jest.config.js structure:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/js/**/*.test.js'
  ]
};
```

## Current Testing Gaps

**Critical Untested Areas:**

1. **Email Copy Functionality**
   - No validation that email value exists
   - No error handling if DOM element missing
   - Clipboard API errors not gracefully handled
   - Files: `build/index.html` (lines 1521-1528)
   - Risk: Silent failures if contact form input changes

2. **Scroll Position Logic**
   - No bounds checking for edge cases
   - Window resize events not handled
   - Calculation correct but not validated
   - Files: `build/index.html` (lines 1532-1540)
   - Risk: Button visibility inconsistent on mobile/resize

3. **TextScramble Animation**
   - Complex frame-based animation not tested
   - Promise resolution logic untested
   - Random character selection not validated
   - Edge cases (empty text, very long text) not handled
   - Files: `build/index.html` (lines 1544-1615)
   - Risk: Animation breaks silently, poor user experience

4. **Integration Points**
   - Interaction between navigation links and scroll position
   - Text scramble triggering and phrase cycling
   - No validation that DOM elements exist before manipulation
   - Files: `build/index.html` (all script sections)

## Manual Testing Checklist (Current Approach)

Until automated testing is implemented, manual testing should verify:

**Email Copy:**
- [ ] Click email copy button
- [ ] Email appears in clipboard
- [ ] Works on different browsers
- [ ] Works offline

**Scroll to Top:**
- [ ] Button hidden at top of page
- [ ] Button appears near bottom
- [ ] Click navigates to top
- [ ] Works on mobile (small viewport)

**Text Scramble:**
- [ ] Title animates on page load
- [ ] Text cycles through phrases correctly
- [ ] Animation timing consistent
- [ ] Works on slow connections

**Navigation:**
- [ ] All anchor links work
- [ ] Scroll behavior is smooth
- [ ] Mobile nav responsive

---

*Testing analysis: 2026-01-22*
