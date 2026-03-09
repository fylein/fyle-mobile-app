# In-App Rating Prompt — Engineering Solution Document

## Objective

Implement a structured, in-app rating prompt system that triggers native App Store / Play Store review dialogs after defined success moments, with client-side eligibility checks, two-tier cooldowns, and smart re-engagement for users who haven't rated yet.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Add/Edit Expense Page (trigger point)              │
│  On successful expense save (finalize)              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  AppRatingService.attemptRatingPrompt()     │    │
│  │                                             │    │
│  │  1. Check LaunchDarkly flag                 │    │
│  │  2. Check eligibility (all conditions)      │    │
│  │  3. Show pre-prompt modal                   │    │
│  │  4. If accepted → native review dialog      │    │
│  │  5. Record interaction in FeatureConfig     │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `AppRatingService` | New service — eligibility checks, prompt orchestration, interaction tracking |
| `PopupAlertComponent` (existing) | Reused for the pre-prompt "Enjoying the app?" screen |
| `FeatureConfigService` (existing) | Persist per-user prompt history (native prompts + dismissals) |
| `LaunchDarklyService` (existing) | Feature flag `in_app_rating` to gate the feature |
| `@capawesome/capacitor-app-review` | Capacitor plugin — triggers native review dialog |

---

## Capacitor Plugin

**Plugin:** `@capawesome/capacitor-app-review`

```bash
npm install @capawesome/capacitor-app-review
npx cap sync
```

**API used:**
- `AppReview.requestReview()` — triggers the native in-app review dialog (StoreKit on iOS, Play In-App Review on Android)

> **Note:** Verify version compatibility with Capacitor 7.x (current project version). The latest plugin version targets Capacitor 8.x. Use the appropriate 7.x-compatible release, or evaluate upgrading Capacitor if planned.

**Platform behavior:**
- Both platforms may silently suppress the dialog (no callback/error when suppressed)
- iOS: System-enforced limit of 3 prompts per 365 days
- Android: Quota-based, undisclosed limit
- No way to know if the user actually rated — we can only track **attempts**

---

## Eligibility Conditions

All conditions must be met before showing the pre-prompt modal:

| # | Condition | Data Source | Check |
|---|-----------|-------------|-------|
| 1 | Feature flag enabled | `LaunchDarklyService.getVariation('in_app_rating', false)` | Boolean check |
| 2 | Non-demo org | `eou.ou.org_name` doesn't contain "fyle for" | Reuse `RefinerService.isNonDemoOrg()` pattern |
| 3 | Not a delegator | `OrgUserService.isSwitchedToDelegator()` | Must be `false` |
| 4 | Network connected | `NetworkService.isOnline()` | Must be `true` |
| 5 | User on platform >= 30 days | `eou.ou.created_at` | `now - created_at >= 30 days` |
| 6 | Total expenses saved >= 5 | `ExpensesService.getExpenseStats()` (platform API `/expenses/stats`) | `count >= 5` |
| 7 | No native prompt in last 6 months | `FeatureConfigService` — `nativePrompts` array | No entry in `nativePrompts` within last 180 days |
| 8 | No pre-prompt shown in last 2 months | `FeatureConfigService` — `dismissals` array | No entry in `dismissals` within last 60 days |

### Two-tier cooldown logic

The system tracks two distinct user actions and applies different cooldowns:

| User action on pre-prompt modal | What gets recorded | Cooldown before next pre-prompt |
|---------------------------------|--------------------|---------------------------------|
| **"Leave a rating"** (accepted) | Entry in `nativePrompts` | **6 months (180 days)** |
| **"Not now"** (dismissed) | Entry in `dismissals` | **2 months (60 days)** |

**How it works:**

1. If the user clicked **"Leave a rating"** at any point in the last 6 months -> the OS popup was already triggered -> **do not show pre-prompt at all**
2. If no native prompt in the last 6 months, but the pre-prompt was shown (and dismissed) within the last 2 months -> **do not show pre-prompt yet** (cooldown not met)
3. If neither condition blocks -> **show the pre-prompt**

**Why this approach:**

- Users who dismiss with "Not now" get gently re-prompted every ~2 months (up to ~6 pre-prompts/year), without wasting any native prompt quota
- Users who tap "Leave a rating" are left alone for 6 months, naturally capping native prompts to ~2/year — aligned with iOS/Android platform limits
- This maximizes conversion by re-engaging undecided users, while respecting users who already took the rating action

---

## Data Storage — FeatureConfig Schema

Use the existing `FeatureConfigService` (backend-persisted, per-user) to track prompt history. This survives app reinstalls and device changes.

```typescript
// FeatureConfig entry
{
  feature: 'IN_APP_RATING',
  key: 'PROMPT_HISTORY',
  target_client: 'MOBILEAPP',
  is_shared: false,
  value: {
    // Timestamps when user clicked "Leave a rating" (OS popup was triggered)
    nativePrompts: [
      '2026-06-15T14:22:00.000Z'
    ],
    // Timestamps when user dismissed with "Not now"
    dismissals: [
      '2026-02-24T10:30:00.000Z',
      '2026-04-28T09:15:00.000Z'
    ]
  }
}
```

Cooldown evaluation from this data:

```typescript
// Given today = 2026-08-20

// Check 1: Any native prompt in last 180 days?
// Last nativePrompt: 2026-06-15 → 66 days ago → YES, within 180 days
// Result: BLOCKED — user already rated recently, don't show pre-prompt

// ---

// If nativePrompts was empty or last entry > 180 days ago:
// Check 2: Any dismissal in last 60 days?
// Last dismissal: 2026-04-28 → 114 days ago → NO, outside 60 days
// Result: ELIGIBLE — show pre-prompt
```

**Why FeatureConfig over local StorageService?**
- Persists across app reinstalls and device changes
- Consistent with existing patterns (walkthrough state, opt-in modals)
- Avoids gaming the system by clearing app data

---

## New Service: `AppRatingService`

**Path:** `src/app/core/services/app-rating.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class AppRatingService {
  // Injected dependencies
  private launchDarklyService = inject(LaunchDarklyService);
  private authService = inject(AuthService);
  private networkService = inject(NetworkService);
  private orgUserService = inject(OrgUserService);
  private featureConfigService = inject(FeatureConfigService);
  private expensesService = inject(ExpensesService);
  private modalController = inject(ModalController);

  private readonly FEATURE_KEY = 'IN_APP_RATING';
  private readonly CONFIG_KEY = 'PROMPT_HISTORY';
  private readonly MIN_DAYS_ON_PLATFORM = 30;
  private readonly MIN_EXPENSE_COUNT = 5;
  private readonly NATIVE_PROMPT_COOLDOWN_DAYS = 180;  // 6 months
  private readonly DISMISSAL_COOLDOWN_DAYS = 60;       // 2 months

  attemptRatingPrompt(): void {
    // 1. Check feature flag
    // 2. Gather user data (eou, network, delegator status)
    // 3. Run eligibility checks (fail-fast)
    // 4. If eligible -> show pre-prompt modal
    // 5. If user taps "Leave a rating" -> call AppReview.requestReview() -> record as nativePrompt
    // 6. If user taps "Not now" -> record as dismissal
  }
}
```

### Core Methods

| Method | Purpose |
|--------|---------|
| `attemptRatingPrompt()` | Entry point — orchestrates the full flow |
| `checkEligibility()` | Runs all eligibility conditions, returns `Observable<boolean>` |
| `isUserOldEnough(eou)` | Checks `created_at` >= 30 days ago |
| `hasEnoughExpenses()` | Calls expense stats API, checks count >= 5 |
| `getPromptHistory()` | Fetches FeatureConfig for prompt history |
| `isNativePromptCooldownMet(history)` | Checks no entry in `nativePrompts` within last 180 days |
| `isDismissalCooldownMet(history)` | Checks no entry in `dismissals` within last 60 days |
| `showPrePromptModal()` | Opens the "Enjoying the app?" modal |
| `triggerNativeReview()` | Calls `AppReview.requestReview()` |
| `recordNativePrompt(history)` | Appends timestamp to `nativePrompts` in FeatureConfig |
| `recordDismissal(history)` | Appends timestamp to `dismissals` in FeatureConfig |


---

## Pre-Prompt Popover (reuses `PopupAlertComponent`)

The pre-prompt reuses the existing `PopupAlertComponent` via `PopoverController` — no new component needed. This is required because:
- Native dialogs are system-controlled and limited in frequency
- A pre-prompt lets us filter out uninterested users before spending a native prompt attempt
- Only users who tap "Leave a rating" trigger the native dialog and enter the longer 6-month cooldown

### UI Spec

| Element | Content |
|---------|---------|
| Title | "Enjoying the app so far?" |
| Body | "If Sage Expense Management has been helpful, would you like to leave a quick rating?" |
| Primary CTA | "Leave a rating" -> triggers native review + records as `nativePrompt` |
| Secondary CTA | "Not now" -> dismisses modal + records as `dismissal` |

### What each CTA does

| CTA | Records | Next pre-prompt eligible in | Native dialog triggered? |
|-----|---------|----------------------------|--------------------------|
| **"Leave a rating"** | `nativePrompts[]` entry | 6 months | Yes |
| **"Not now"** | `dismissals[]` entry | 2 months | No |

This is the key design insight: "Not now" costs nothing in terms of native prompt quota, so we can afford to ask again sooner. "Leave a rating" fires the OS dialog (consuming platform quota), so we back off for much longer.

### Modal Flow

```
User saves expense (5+ total)
        |
        v
  Eligibility check passes
        |
        v
  +---------------------+
  |  Pre-prompt Modal    |
  |                      |
  |  "Enjoying the app?" |
  |                      |
  |  [Leave a rating]    |--- record nativePrompt ---> AppReview.requestReview()
  |  [Not now]           |--- record dismissal ------> Dismiss (no native dialog)
  +---------------------+
        |
        v
  Next eligible:
    - If rated:    in 6 months
    - If dismissed: in 2 months
```

### Example user journey

```
Day 0:   User downloads app

Day 35:  User saves 5th expense. Eligible!
         -> Pre-prompt shown -> User taps "Not now"
         -> Recorded as dismissal. Next eligible in 2 months.

Day 96:  User saves an expense. 2-month cooldown passed. Eligible!
         -> Pre-prompt shown -> User taps "Not now" again
         -> Recorded as dismissal. Next eligible in 2 months.

Day 160: User saves an expense. 2-month cooldown passed. Eligible!
         -> Pre-prompt shown -> User taps "Leave a rating"
         -> Native OS dialog triggered. Recorded as nativePrompt.
         -> Next eligible in 6 months.

Day 200: User saves an expense. Only 40 days since native prompt.
         -> NOT eligible. No prompt shown.

Day 345: User saves an expense. 6-month cooldown passed. Eligible!
         -> Pre-prompt shown again (cycle restarts)
```

---

## Integration Point: Add/Edit Expense Page

The trigger hooks into the existing expense save flow in `add-edit-expense.page.ts`, following the same pattern as the NPS survey.

### Current NPS trigger (for reference)

```typescript
// add-edit-expense.page.ts (existing)
triggerNpsSurvey(): void {
  this.launchDarklyService.getVariation('nps_survey', false).subscribe((showNpsSurvey) => {
    if (showNpsSurvey) {
      this.refinerService.startSurvey({ actionName: 'Save Expense' });
    }
  });
}
```

### New rating trigger (proposed)

```typescript
// add-edit-expense.page.ts
triggerAppRating(): void {
  this.appRatingService.attemptRatingPrompt();
}
```

Called from the same `finalize()` blocks where `triggerNpsSurvey()` is called:

- `addExpense()` -> `finalize()`
- `editExpense()` -> `finalize()`
- `checkIfReceiptIsMissingAndMandatory()` -> `finalize()`

> **Note:** `triggerAppRating()` and `triggerNpsSurvey()` should NOT run simultaneously. Add logic to ensure only one prompt type fires per save action (e.g., rating takes priority when eligible, NPS otherwise).

---

## Feature Flag

**LaunchDarkly flag key:** `in_app_rating`

| Property | Value |
|----------|-------|
| Key | `in_app_rating` |
| Type | Boolean |
| Default | `false` |
| Targeting | Roll out by org, percentage, or user segment |

This allows:
- Gradual rollout (e.g., 10% -> 50% -> 100%)
- Kill switch if ratings trend negatively
- A/B testing different user segments

---

## Analytics & Tracking

Since platforms don't report whether the review dialog was actually shown or if the user rated, we track what we can:

| Event | When | Properties |
|-------|------|------------|
| `in_app_rating_eligible` | User passes all eligibility checks | `user_id`, `org_id`, `expense_count`, `platform` |
| `in_app_rating_pre_prompt_shown` | Pre-prompt modal is displayed | `user_id`, `org_id`, `platform` |
| `in_app_rating_accepted` | User taps "Leave a rating" | `user_id`, `org_id`, `platform` |
| `in_app_rating_dismissed` | User taps "Not now" | `user_id`, `org_id`, `platform` |
| `in_app_rating_native_triggered` | `requestReview()` is called | `user_id`, `org_id`, `platform` |

Use the existing `TrackingService` for these events.

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `package.json` | Modify | Add `@capawesome/capacitor-app-review@^7.0.0` dependency |
| `src/app/core/services/app-rating.service.ts` | **New** | Core service with eligibility logic, prompt orchestration, interaction tracking |
| `src/app/core/models/app-rating-history.model.ts` | **New** | Interface for the FeatureConfig value shape |
| `src/app/fyle/add-edit-expense/add-edit-expense.page.ts` | Modify | Add `triggerAppRating()` method + call in all 3 `finalize()` blocks |
| `src/app/core/mock-data/ld-all-flags.data.ts` | Modify | Add `in_app_rating` flag for tests |
| `src/assets/i18n/en.json` | Modify | Add translation keys for rating prompt UI copy |

---

## Edge Cases & Considerations

| Scenario | Handling |
|----------|----------|
| User is offline when save completes | Eligibility check fails at network check — no prompt |
| FeatureConfig API fails | Catch error, skip prompt silently (don't block expense save) |
| FeatureConfig returns empty/null | Treat as first-time user — both cooldowns pass (no prior history) |
| `requestReview()` fails or is suppressed by OS | Still record as `nativePrompt` — we can't distinguish suppression from display |
| User reinstalls app | FeatureConfig is backend-stored, so history persists |
| User switches orgs | FeatureConfig is per-user (not per-org), history carries over |
| Both NPS and rating eligible | Rating prompt takes priority; skip NPS for that save action |
| Expense save fails | `finalize()` runs on both success and error — guard rating trigger behind a success flag |
| User dismisses pre-prompt 6 times in a year | That's fine — no native quota is consumed, and the 2-month gap keeps it non-intrusive |

### Important: Guard against failed saves

Currently, `triggerNpsSurvey()` runs in `finalize()` which fires regardless of success/failure. For the rating prompt, we should only trigger on **successful** saves. Track a `saveSucceeded` flag:

```typescript
// In addExpense() / editExpense()
tap(() => { this.lastSaveSucceeded = true; }),
catchError(() => { this.lastSaveSucceeded = false; ... }),
finalize(() => {
  if (this.lastSaveSucceeded) {
    this.triggerAppRating();
  }
})
```

---
