---
status: complete
phase: 04-github-integration
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md]
started: 2026-01-23T06:00:00Z
updated: 2026-01-23T06:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Connect GitHub Account
expected: On /backstage/dashboard/github page, click "Connect GitHub". You're redirected to GitHub OAuth. After authorizing, you return to the dashboard showing your GitHub username and avatar.
result: pass

### 2. View Repository List
expected: After connecting, repository browser appears. Shows your GitHub repos as cards with name, description, stars, language. "Load More" button at bottom if you have many repos.
result: pass

### 3. Search Repositories
expected: Type in the search box. Repo list filters to only show repos matching your search text (by name).
result: pass

### 4. Filter by Language
expected: Use the language dropdown. Repo list filters to show only repos with that language.
result: pass

### 5. Import Repos as Projects
expected: Select 1-2 repos using checkboxes, click "Add to Portfolio". Toast shows "Imported X projects". Repos now show green "Added" badge and checkboxes are hidden.
result: pass

### 6. View Imported Projects
expected: Go to /backstage/dashboard/projects. Imported repos appear as projects with a "Synced" badge showing GitHub icon. Title, description, language match the GitHub repo.
result: pass

### 7. Edit GitHub-Synced Project
expected: Click edit on a synced project. Form shows info banner about GitHub sync. Change the title and save. Change persists.
result: pass

### 8. Reset Field to GitHub
expected: After editing a synced project's title, reopen edit modal. "Reset to GitHub" button appears next to title field. Click it - title reverts to original GitHub repo name. Button disappears.
result: pass

### 9. Disconnect GitHub
expected: On /backstage/dashboard/github, click "Disconnect". Confirmation appears. After disconnect, page shows "Connect GitHub" button again (no repos browser).
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
