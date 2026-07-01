# APEX Finish Work M5StickC Plus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, test, flash, and verify a Chinese 240×135 APEX finish-work app with real-time salary, overtime loss, retirement countdown, cute pixel pet, M5-only in-app controls, and launcher-owned B switching.

**Architecture:** Keep salary/date/settlement calculations in a hardware-free deep module, render from a view model, isolate NVS in `apex_finish`, and let a standalone launcher own M5 button classification and B. `FinishWorkApp` exposes the lifecycle names `begin/update/render/handleButton/reset` without depending on the unavailable external `app_base.h`, so a later adapter can satisfy its exact signatures.

**Tech Stack:** C++17, Arduino ESP32, M5Unified/M5GFX, Preferences/NVS, PlatformIO, Unity native tests, esptool 4.x.

---

### Task 1: Extend the pure salary and settlement model

**Files:**
- Modify: `firmware/m5stickc-apex/include/finish_work_logic.h`
- Modify: `firmware/m5stickc-apex/src/finish_work_logic.cpp`
- Modify: `firmware/m5stickc-apex/test/test_logic/test_main.cpp`

- [ ] **Step 1: Add failing boundary and settlement tests**

Add tests that construct `SalarySettings{600000, 540, 1020}` (salary stored as cents), assert zero at 08:59:59, approximately half a day at 13:00, full daily salary at 17:00, negative overtime loss after 17:00, and a frozen result after settlement. Add a day-key test for leap day and midnight.

```cpp
const apex::SalarySettings settings{600000, 9 * 60, 17 * 60};
TEST_ASSERT_EQUAL_INT64(0, apex::calculateLiveSalary(settings, 8 * 3600 + 3599).earnedMilliCents);
const auto overtime = apex::calculateLiveSalary(settings, 17 * 3600 + 60);
TEST_ASSERT_GREATER_THAN_INT64(0, overtime.earnedMilliCents);
TEST_ASSERT_GREATER_THAN_INT64(0, overtime.lossMilliCents);
TEST_ASSERT_EQUAL_INT64(overtime.earnedMilliCents - overtime.lossMilliCents,
                        overtime.netMilliCents);
```

- [ ] **Step 2: Run native tests and verify the new symbols fail to compile**

Run:

```bash
pio test -e native
```

Expected: compilation fails because `SalarySettings` and `calculateLiveSalary` do not exist.

- [ ] **Step 3: Implement integer-only salary and settlement calculations**

Add these public types and functions; all monetary calculations use milli-cents internally to avoid floating-point drift and are O(1):

```cpp
struct SalarySettings {
  int64_t monthlySalaryCents;
  uint16_t workStartMinute;
  uint16_t workEndMinute;
};

struct SalaryStatus {
  bool valid;
  WorkState state;
  int64_t earnedMilliCents;
  int64_t lossMilliCents;
  int64_t netMilliCents;
};

SalaryStatus calculateLiveSalary(const SalarySettings& settings,
                                 int currentSecondOfDay);
int32_t calendarDayKey(const CalendarDate& date);
```

Use `monthlySalaryCents / 22`, cap earned seconds at the configured work duration, and start loss seconds at `workEndMinute * 60`. Reject salary outside ¥1000–¥99999 and invalid time ranges.

- [ ] **Step 4: Run the focused native tests**

Run `pio test -e native`. Expected: all date, retirement, salary, overtime, and settlement tests pass.

- [ ] **Step 5: Commit the logic increment**

```bash
git add firmware/m5stickc-apex/include/finish_work_logic.h firmware/m5stickc-apex/src/finish_work_logic.cpp firmware/m5stickc-apex/test/test_logic/test_main.cpp
git commit -m "feat: add finish-work salary calculations"
```

### Task 2: Introduce the app lifecycle, input events, and NVS store

**Files:**
- Create: `firmware/m5stickc-apex/include/app_input.h`
- Create: `firmware/m5stickc-apex/include/finish_work_store.h`
- Create: `firmware/m5stickc-apex/src/finish_work_store.cpp`
- Replace: `firmware/m5stickc-apex/include/finish_work_module.h` with `firmware/m5stickc-apex/include/finish_work_app.h`
- Replace: `firmware/m5stickc-apex/src/finish_work_module.cpp` with `firmware/m5stickc-apex/src/finish_work_app.cpp`
- Create: `firmware/m5stickc-apex/test/test_app/test_main.cpp`

- [ ] **Step 1: Define and test the state transitions before hardware code**

Use an app-owned event enum; B events exist for launcher dispatch but `FinishWorkApp::handleButton` ignores them.

```cpp
enum class ButtonEvent : uint8_t { M5Click, M5DoubleClick, M5Hold, BClick, BHold };
enum class FinishScreen : uint8_t { Main, Detail, Settings };
enum class SettlementPhase : uint8_t { Live, Confirming, Settled };
```

Test that a click enters `Confirming`, a second click within 3000 ms enters `Settled`, timeout returns to `Live`, double click opens settings without changing settlement, hold toggles detail, and B leaves the app state unchanged.

- [ ] **Step 2: Run the app test and confirm it fails before implementation**

Run `pio test -e native`. Expected: missing `FinishWorkAppModel` symbols.

- [ ] **Step 3: Implement the lifecycle and store interface**

Expose only:

```cpp
class FinishWorkApp {
 public:
  void begin();
  void update(uint32_t nowMs);
  void render();
  void handleButton(ButtonEvent event, uint32_t nowMs);
  void reset();
};
```

`FinishWorkStore` opens only namespace `apex_finish`, persists a version, settings, and one daily settlement snapshot. Store all currency as integer milli-cents. `FinishWorkApp` must not call `M5.update()` and must not inspect `M5.BtnB`.

- [ ] **Step 4: Verify transition and persistence serialization tests**

Run `pio test -e native`. Expected: both `test_logic` and `test_app` pass.

- [ ] **Step 5: Commit the lifecycle increment**

```bash
git add firmware/m5stickc-apex/include firmware/m5stickc-apex/src firmware/m5stickc-apex/test/test_app
git commit -m "refactor: isolate finish-work app lifecycle"
```

### Task 3: Build the Chinese 240×135 view and original pet

**Files:**
- Create: `firmware/m5stickc-apex/include/finish_work_view.h`
- Create: `firmware/m5stickc-apex/src/finish_work_view.cpp`
- Create: `firmware/m5stickc-apex/include/layout_bounds.h`
- Create: `firmware/m5stickc-apex/test/test_layout/test_main.cpp`
- Modify: `firmware/m5stickc-apex/src/finish_work_app.cpp`

- [ ] **Step 1: Add deterministic layout-bound tests**

Define rectangles for top bar `(6,4,228,16)`, money `(6,24,157,58)`, pet `(169,24,65,62)`, retirement `(6,88,228,20)`, and footer `(6,113,228,18)`. Assert each lies inside `(4,3,232,129)` and that money/pet/retirement/footer do not intersect.

```cpp
TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kMoneyBounds));
TEST_ASSERT_FALSE(apex::intersects(apex::kMoneyBounds, apex::kPetBounds));
TEST_ASSERT_FALSE(apex::intersects(apex::kRetirementBounds, apex::kFooterBounds));
```

- [ ] **Step 2: Run layout tests and verify failure before adding bounds**

Run `pio test -e native`. Expected: missing `layout_bounds.h`.

- [ ] **Step 3: Implement the view**

Use black background; Google colors `#4285F4/#EA4335/#FBBC05/#34A853`; cream text `#F7F3E8`. Use `fonts::efontCN_12` for Chinese when available and built-in numeric fonts for money/time. Measure strings with `textWidth()` before drawing and reduce numeric font size only when `-¥99999.99` would exceed 157 px.

Draw an original blue/yellow pet from circles, triangles, rectangles, and lines. Restrict all pet primitives and 2–3 frame animation dirt to `kPetBounds`. Implement sleep, earn, overtime, confirm, and celebrate states without bitmap assets.

- [ ] **Step 4: Run native layout tests and embedded build**

Run:

```bash
pio test -e native
pio run -e m5stickc
```

Expected: layout tests pass, Chinese font symbol compiles, Flash fits the application partition, and no new compiler warnings appear.

- [ ] **Step 5: Commit the view increment**

```bash
git add firmware/m5stickc-apex/include/finish_work_view.h firmware/m5stickc-apex/include/layout_bounds.h firmware/m5stickc-apex/src/finish_work_view.cpp firmware/m5stickc-apex/src/finish_work_app.cpp firmware/m5stickc-apex/test/test_layout
git commit -m "feat: add Chinese pixel-pet finish-work UI"
```

### Task 4: Add standalone launcher button classification and RTC synchronization

**Files:**
- Create: `firmware/m5stickc-apex/include/button_classifier.h`
- Create: `firmware/m5stickc-apex/src/button_classifier.cpp`
- Modify: `firmware/m5stickc-apex/src/main.cpp`
- Create: `firmware/m5stickc-apex/test/test_buttons/test_main.cpp`

- [ ] **Step 1: Test delayed single-click classification**

Test: one release emits `M5Click` only after the 300 ms double-click window; two releases inside the window emit only `M5DoubleClick`; 800 ms press emits only `M5Hold`; B click emits a launcher action and is never forwarded to the finish-work app.

- [ ] **Step 2: Implement the classifier and main dispatcher**

`main.cpp` alone calls `M5.update()`. It routes classified A events to `FinishWorkApp::handleButton`, intercepts B click as `nextApp()`, intercepts B hold as `showLauncher()`, then calls app `update()` and `render()`.

Add a line-oriented serial command:

```text
TIME YYYY-MM-DD HH:MM:SS
```

Validate it with `isValidDate`, hour 0–23, minute/second 0–59, write RTC only on success, and print `RTC_SYNC_OK` or `RTC_SYNC_ERROR`.

- [ ] **Step 3: Run classifier tests and embedded build**

Run `pio test -e native && pio run -e m5stickc`. Expected: all tests and build pass.

- [ ] **Step 4: Commit the standalone integration**

```bash
git add firmware/m5stickc-apex/include/button_classifier.h firmware/m5stickc-apex/src/button_classifier.cpp firmware/m5stickc-apex/src/main.cpp firmware/m5stickc-apex/test/test_buttons
git commit -m "feat: add launcher-safe M5 controls and RTC sync"
```

### Task 5: Final audit, backup, flash, and physical verification

**Files:**
- Modify: `firmware/m5stickc-apex/DESIGN.md`
- Generate: `outputs/m5stickc-apex-finish-work-v2-20260701.bin`
- Preserve: `outputs/m5stickc-pre-apex-20260701.bin`

- [ ] **Step 1: Run the full deterministic checks**

Run native tests, embedded build, `git diff --check`, secret/TODO scan, final status, and inspect every current-task diff. Expected: all tests pass, build succeeds, no whitespace errors or secrets, and only authorized files changed.

- [ ] **Step 2: Verify the existing full-device rollback image before writing**

Run SHA-256 check and esptool 4.x `verify_flash 0x0` against the 4MB backup. Expected: both digests match. If either fails, stop before flashing.

- [ ] **Step 3: Upload without erasing unrelated NVS namespaces**

Run `pio run -e m5stickc -t upload` on `/dev/cu.usbserial-AD529FABF7`. Do not run full-chip erase. Expected: bootloader, partition, boot app, and application writes report verified hashes.

- [ ] **Step 4: Synchronize RTC from the Mac**

Open the serial port at 115200, send `TIME $(date '+%Y-%m-%d %H:%M:%S')`, and require `RTC_SYNC_OK`. Compare the next device clock render/log with the host within two seconds.

- [ ] **Step 5: Verify on-flash application and runtime**

Copy the exact uploaded `firmware.bin` to outputs, write its SHA-256 sidecar, run esptool `verify_flash 0x10000`, and monitor boot for `APEX_FW_READY display=240x135`. Exercise M5 click/double/hold and B click through serial event logs; visually inspect clipping, overlap, flicker, and animation dirt.

- [ ] **Step 6: Commit final docs only after evidence is captured**

```bash
git add firmware/m5stickc-apex/DESIGN.md
git commit -m "docs: record finish-work firmware controls"
```
