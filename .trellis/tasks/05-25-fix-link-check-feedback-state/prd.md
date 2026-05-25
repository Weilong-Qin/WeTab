# PRD: Fix Link Check Feedback State

## Problem
Clicking "检查链接" leaves the result message visible indefinitely and the button feels repeatedly clickable without a clear in-progress state.

## Goal
Make link checking behave like a transient action:
- show a clear "checking" state while validation runs
- disable repeated submissions while validation is in flight
- clear the success/error message after a short delay so the UI does not accumulate stale feedback

## Scope
- Update the visible bookmark link validation flow in the new tab page.
- Keep the existing validation behavior and messages, but make the feedback transient.

## Success Criteria
- While validation is running, the button is visibly busy and cannot be spam-clicked.
- After validation completes, the result message is shown briefly and then dismissed automatically.
- No regression in bookmark validation or refresh behavior.
