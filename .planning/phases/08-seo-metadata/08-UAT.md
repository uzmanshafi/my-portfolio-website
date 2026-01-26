---
status: complete
phase: 08-seo-metadata
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md]
started: 2026-01-26T06:20:00Z
updated: 2026-01-26T06:25:00Z
---

## Current Test

[testing complete]

## Tests

### 1. SEO in Sidebar Navigation
expected: Go to /backstage/dashboard. In the sidebar, you should see "SEO" as a nav item with a Settings icon, positioned after "Contact".
result: pass

### 2. SEO Admin Page Loads
expected: Click "SEO" in sidebar. Page loads at /backstage/dashboard/seo showing OG Image section and text fields for SEO Title and SEO Description.
result: pass

### 3. OG Image Upload
expected: Click "Upload Image" or the image preview area. Select an image. ImageCropper opens with a rectangular crop area (1200x630 aspect ratio). After cropping, image uploads and toast shows "OG image now live".
result: pass

### 4. SEO Title Field
expected: SEO Title input field shows character counter (e.g., "0/60"). Type some text - counter updates. Cannot type more than 60 characters.
result: pass

### 5. SEO Description Field
expected: SEO Description textarea shows character counter (e.g., "0/160"). Type some text - counter updates. Cannot type more than 160 characters.
result: pass

### 6. Save SEO Settings
expected: After editing title or description, Save button becomes enabled. Click Save. Toast shows "SEO settings now live". Changes persist after page refresh.
result: pass

### 7. Open Graph Meta Tags
expected: Visit your public portfolio (https://www.uzm4n.xyz), right-click > View Page Source. Search for "og:". You should see og:title, og:description, og:image, og:type tags in the HTML head.
result: pass

### 8. Twitter Card Meta Tags
expected: In page source, search for "twitter:". You should see twitter:card (set to "summary_large_image"), twitter:title, twitter:description, twitter:image tags.
result: pass

### 9. JSON-LD Structured Data
expected: In page source, search for "application/ld+json". You should see two script blocks: one with "@type": "Person" (name, jobTitle, sameAs) and one with "@type": "WebSite".
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
