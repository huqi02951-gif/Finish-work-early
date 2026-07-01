#include <M5Unified.h>

#include <stdio.h>
#include <string.h>

#include "app_launcher.h"
#include "button_classifier.h"
#include "focus_fruit_app.h"
#include "finish_work_app.h"
#include "finish_work_logic.h"

namespace {

apex::AppLauncher launcher;
apex::FinishWorkApp finishWork;
apex::FocusFruitApp focusFruit;
apex::ButtonClassifier m5Button;
apex::ButtonClassifier sideButton;
char serialLine[48]{};
size_t serialLength = 0;
uint32_t releasedSinceMs = 0;
bool inputReady = false;

apex::ButtonEvent m5Event(apex::ClassifiedPress press) {
  if (press == apex::ClassifiedPress::Click) {
    return apex::ButtonEvent::M5Click;
  }
  if (press == apex::ClassifiedPress::DoubleClick) {
    return apex::ButtonEvent::M5DoubleClick;
  }
  return apex::ButtonEvent::M5Hold;
}

void handleTimeCommand(const char* line) {
  int year = 0;
  int month = 0;
  int day = 0;
  int hour = 0;
  int minute = 0;
  int second = 0;
  char tail = '\0';
  const int count = sscanf(line, "TIME %d-%d-%d %d:%d:%d%c", &year,
                           &month, &day, &hour, &minute, &second, &tail);
  if (count != 6 || !apex::isValidDate({year, month, day}) ||
      hour < 0 || hour > 23 || minute < 0 || minute > 59 ||
      second < 0 || second > 59) {
    Serial.println("RTC_SYNC_ERROR");
    return;
  }
  m5::rtc_datetime_t clock{};
  clock.date.year = year;
  clock.date.month = month;
  clock.date.date = day;
  int weekday = static_cast<int>((apex::daysFromCivil({year, month, day}) + 4) % 7);
  clock.date.weekDay = weekday < 0 ? weekday + 7 : weekday;
  clock.time.hours = hour;
  clock.time.minutes = minute;
  clock.time.seconds = second;
  Serial.println(finishWork.setClock(clock) ? "RTC_SYNC_OK"
                                             : "RTC_SYNC_ERROR");
}

void resetButtonClassifiers() {
  m5Button = apex::ButtonClassifier{};
  sideButton = apex::ButtonClassifier{};
  releasedSinceMs = 0;
  inputReady = false;
}

void renderActiveApp() {
  if (launcher.activeApp() == apex::AppId::FinishWork) {
    finishWork.render();
  } else {
    focusFruit.render();
  }
}

void updateActiveApp(uint32_t nowMs) {
  finishWork.update(nowMs);
  focusFruit.update(nowMs);
}

void forwardToActiveApp(apex::ButtonEvent event, uint32_t nowMs) {
  if (launcher.activeApp() == apex::AppId::FinishWork) {
    finishWork.handleButton(event, nowMs);
  } else {
    focusFruit.handleButton(event, nowMs);
  }
}

void applyLauncherDecision(const apex::LauncherDecision& decision,
                           apex::ButtonEvent event, uint32_t nowMs) {
  if (decision.action == apex::LauncherAction::ForwardToApp) {
    forwardToActiveApp(event, nowMs);
  } else if (decision.action == apex::LauncherAction::SwitchedApp) {
    focusFruit.setActive(decision.target == apex::AppId::FocusFruit);
    Serial.printf("LAUNCHER_SWITCH app=%s\n",
                  apex::appIdName(decision.target));
    renderActiveApp();
  } else if (decision.action == apex::LauncherAction::MenuRequested) {
    Serial.printf("LAUNCHER_MENU active=%s\n",
                  apex::appIdName(decision.target));
  }
}

void updateSerial() {
  while (Serial.available() > 0) {
    const char value = static_cast<char>(Serial.read());
    if (value == '\r') continue;
    if (value == '\n') {
      serialLine[serialLength] = '\0';
      if (serialLength > 0) handleTimeCommand(serialLine);
      serialLength = 0;
      continue;
    }
    if (serialLength + 1 < sizeof(serialLine)) {
      serialLine[serialLength++] = value;
    } else {
      serialLength = 0;
      Serial.println("RTC_SYNC_ERROR");
    }
  }
}

void updateButtons(uint32_t nowMs) {
  if (!inputReady) {
    if (!M5.BtnA.isPressed() && !M5.BtnB.isPressed()) {
      if (releasedSinceMs == 0) releasedSinceMs = nowMs;
      if (nowMs - releasedSinceMs >= 500) inputReady = true;
    } else {
      releasedSinceMs = 0;
    }
    return;
  }

  const auto front = m5Button.update(M5.BtnA.isPressed(), nowMs);
  if (front != apex::ClassifiedPress::None) {
    const apex::ButtonEvent event = m5Event(front);
    applyLauncherDecision(launcher.handleButton(event), event, nowMs);
  }

  const auto side = sideButton.update(M5.BtnB.isPressed(), nowMs);
  if (side == apex::ClassifiedPress::Click) {
    const apex::ButtonEvent event = apex::ButtonEvent::BClick;
    applyLauncherDecision(launcher.handleButton(event), event, nowMs);
  } else if (side == apex::ClassifiedPress::DoubleClick) {
    const apex::ButtonEvent event = apex::ButtonEvent::BClick;
    applyLauncherDecision(launcher.handleButton(event), event, nowMs);
  } else if (side == apex::ClassifiedPress::Hold) {
    const apex::ButtonEvent event = apex::ButtonEvent::BHold;
    applyLauncherDecision(launcher.handleButton(event), event, nowMs);
  }
}

}  // namespace

void setup() {
  auto config = M5.config();
  M5.begin(config);
  Serial.begin(115200);
  finishWork.begin();
  focusFruit.begin();
  focusFruit.setActive(false);
  resetButtonClassifiers();
}

void loop() {
  M5.update();
  const uint32_t nowMs = millis();
  updateSerial();
  updateButtons(nowMs);
  updateActiveApp(nowMs);
  renderActiveApp();
  M5.delay(8);
}
