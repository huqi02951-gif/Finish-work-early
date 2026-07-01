#include "finish_work_app.h"

#include <algorithm>
#include <stdio.h>
#include <string.h>

namespace apex {
namespace {

int wrapValue(int value, int minimum, int maximum) {
  const int width = maximum - minimum + 1;
  int normalized = (value - minimum) % width;
  if (normalized < 0) normalized += width;
  return minimum + normalized;
}

int weekdayFor(const CalendarDate& date) {
  int value = static_cast<int>((daysFromCivil(date) + 4) % 7);
  return value < 0 ? value + 7 : value;
}

}  // namespace

void FinishWorkApp::begin() {
  M5.Display.setRotation(1);
  M5.Display.setBrightness(82);
  M5.Display.setTextWrap(false);
  store_.load(settings_, settlement_);
  ensureClock();
  if (!view_.begin()) Serial.println("VIEW_ERROR sprite");
  refreshData();
  Serial.printf(
      "APEX_FW_READY display=%dx%d salary=%ld birth=%u retire=%u "
      "work=%02u:%02u-%02u:%02u nvs=apex_finish\n",
      M5.Display.width(), M5.Display.height(),
      static_cast<long>(settings_.monthlySalaryCents / 100),
      settings_.birthYear, settings_.retirementAge,
      settings_.workStartMinute / 60, settings_.workStartMinute % 60,
      settings_.workEndMinute / 60, settings_.workEndMinute % 60);
  dirty_ = true;
}

void FinishWorkApp::update(uint32_t nowMs) {
  nowMs_ = nowMs;
  model_.update(nowMs);
  refreshData();
}

void FinishWorkApp::render() {
  if (!dirty_ && nowMs_ - lastRenderMs_ < 250) return;
  view_.render(makeViewModel());
  lastRenderMs_ = nowMs_;
  dirty_ = false;
}

void FinishWorkApp::handleButton(ButtonEvent event, uint32_t nowMs) {
  const FinishScreen previous = model_.screen();
  const AppAction action = model_.handleButton(event, nowMs);
  if (previous != FinishScreen::Settings &&
      model_.screen() == FinishScreen::Settings) {
    openSettings();
  }
  if (action == AppAction::SettleNow) settleNow();
  if (action == AppAction::AdjustUp) adjustSetting(1);
  if (action == AppAction::AdjustDown) adjustSetting(-1);
  if (action == AppAction::NextSetting) nextSetting();
  dirty_ = true;
  Serial.printf("INPUT event=%u screen=%u action=%u\n",
                static_cast<unsigned>(event),
                static_cast<unsigned>(model_.screen()),
                static_cast<unsigned>(action));
}

void FinishWorkApp::reset() {
  model_ = FinishWorkModel{};
  settings_ = FinishSettings{};
  settlement_ = SettlementSnapshot{};
  store_.load(settings_, settlement_);
  ensureClock();
  refreshData();
  dirty_ = true;
}

bool FinishWorkApp::setClock(const m5::rtc_datetime_t& clock) {
  if (!isValidDate(toCalendarDate(clock)) || clock.time.hours > 23 ||
      clock.time.minutes > 59 || clock.time.seconds > 59 ||
      !M5.Rtc.isEnabled()) {
    return false;
  }
  M5.Rtc.setDateTime(clock);
  clock_ = clock;
  dirty_ = true;
  return true;
}

void FinishWorkApp::ensureClock() {
  if (!M5.Rtc.isEnabled()) {
    Serial.println("RTC_ERROR not-found");
    clock_ = buildClock();
    return;
  }
  clock_ = M5.Rtc.getDateTime();
  if (!isValidDate(toCalendarDate(clock_))) {
    clock_ = buildClock();
    M5.Rtc.setDateTime(clock_);
    Serial.println("RTC_INIT build-time");
  }
}

void FinishWorkApp::refreshData() {
  if (M5.Rtc.isEnabled()) clock_ = M5.Rtc.getDateTime();
  const CalendarDate today = toCalendarDate(clock_);
  if (!isValidDate(today)) return;
  const int32_t todayKey = calendarDayKey(today);
  if (model_.dayKey() != todayKey) {
    model_.resetForDay(todayKey);
    if (settlement_.settled && settlement_.dayKey == todayKey) {
      model_.restoreSettled(todayKey);
    } else if (settlement_.settled) {
      settlement_ = SettlementSnapshot{};
      store_.clearSettlement();
    }
    dirty_ = true;
  }

  const int secondOfDay = clock_.time.hours * 3600 +
                          clock_.time.minutes * 60 + clock_.time.seconds;
  salary_ = calculateLiveSalary(
      {settings_.monthlySalaryCents, settings_.workStartMinute,
       settings_.workEndMinute},
      secondOfDay);
  if (model_.settlementPhase() == SettlementPhase::Settled &&
      settlement_.settled && settlement_.dayKey == todayKey) {
    salary_.earnedMilliCents = settlement_.earnedMilliCents;
    salary_.lossMilliCents = settlement_.lossMilliCents;
    salary_.netMilliCents = settlement_.netMilliCents;
  }
  retirement_ = calculateRetirement(
      today, {static_cast<int>(settings_.birthYear), 1, 1},
      settings_.retirementAge);
}

void FinishWorkApp::openSettings() {
  draftClock_ = clock_;
  settingField_ = SettingField::Salary;
  normalizeDraftClock();
}

void FinishWorkApp::adjustSetting(int direction) {
  switch (settingField_) {
    case SettingField::Salary:
      settings_.monthlySalaryCents = wrapValue(
          settings_.monthlySalaryCents + direction * 10000,
          100000, 9999900);
      break;
    case SettingField::WorkStart:
      settings_.workStartMinute = wrapValue(
          settings_.workStartMinute + direction * 15, 0, 22 * 60 + 45);
      if (settings_.workStartMinute >= settings_.workEndMinute) {
        settings_.workEndMinute = settings_.workStartMinute + 15;
      }
      break;
    case SettingField::WorkEnd:
      settings_.workEndMinute = wrapValue(
          settings_.workEndMinute + direction * 15, 15, 23 * 60 + 45);
      if (settings_.workEndMinute <= settings_.workStartMinute) {
        settings_.workEndMinute = settings_.workStartMinute + 15;
      }
      break;
    case SettingField::BirthYear:
      settings_.birthYear = wrapValue(settings_.birthYear + direction,
                                      1950, 2020);
      break;
    case SettingField::RetirementAge:
      settings_.retirementAge = wrapValue(
          settings_.retirementAge + direction, 40, 80);
      break;
    case SettingField::DateYear:
      draftClock_.date.year = wrapValue(
          draftClock_.date.year + direction, 2024, 2099);
      break;
    case SettingField::DateMonth:
      draftClock_.date.month = wrapValue(
          draftClock_.date.month + direction, 1, 12);
      break;
    case SettingField::DateDay:
      draftClock_.date.date = wrapValue(
          draftClock_.date.date + direction, 1,
          daysInMonth(draftClock_.date.year, draftClock_.date.month));
      break;
    case SettingField::ClockHour:
      draftClock_.time.hours = wrapValue(
          draftClock_.time.hours + direction, 0, 23);
      break;
    case SettingField::ClockMinute:
      draftClock_.time.minutes = wrapValue(
          draftClock_.time.minutes + direction * 5, 0, 59);
      break;
    case SettingField::Count:
      break;
  }
  normalizeDraftClock();
}

void FinishWorkApp::nextSetting() {
  const uint8_t next = static_cast<uint8_t>(settingField_) + 1;
  if (next >= static_cast<uint8_t>(SettingField::Count)) {
    saveSettings();
    model_.showMain();
    return;
  }
  settingField_ = static_cast<SettingField>(next);
}

void FinishWorkApp::saveSettings() {
  normalizeDraftClock();
  store_.saveSettings(settings_);
  setClock(draftClock_);
  Serial.printf("SETTINGS_SAVED salary=%ld birth=%u retire=%u\n",
                static_cast<long>(settings_.monthlySalaryCents / 100),
                settings_.birthYear, settings_.retirementAge);
}

void FinishWorkApp::settleNow() {
  refreshData();
  settlement_.settled = true;
  settlement_.dayKey = calendarDayKey(toCalendarDate(clock_));
  settlement_.settledSecond = clock_.time.hours * 3600 +
                              clock_.time.minutes * 60 +
                              clock_.time.seconds;
  settlement_.earnedMilliCents = salary_.earnedMilliCents;
  settlement_.lossMilliCents = salary_.lossMilliCents;
  settlement_.netMilliCents = salary_.netMilliCents;
  store_.saveSettlement(settlement_);
  Serial.printf("CLOCK_OFF day=%ld second=%lu net_millicent=%lld\n",
                static_cast<long>(settlement_.dayKey),
                static_cast<unsigned long>(settlement_.settledSecond),
                static_cast<long long>(settlement_.netMilliCents));
}

void FinishWorkApp::normalizeDraftClock() {
  const int maxDay = daysInMonth(draftClock_.date.year,
                                 draftClock_.date.month);
  draftClock_.date.date = std::max(1, std::min<int>(
      draftClock_.date.date, maxDay));
  draftClock_.date.weekDay = weekdayFor(toCalendarDate(draftClock_));
  draftClock_.time.seconds = 0;
}

FinishViewModel FinishWorkApp::makeViewModel() {
  PetState pet = PetState::Sleep;
  if (model_.settlementPhase() == SettlementPhase::Settled) {
    pet = PetState::Celebrate;
  } else if (model_.settlementPhase() == SettlementPhase::Confirming) {
    pet = PetState::Confirm;
  } else if (salary_.state == WorkState::Working) {
    pet = PetState::Earn;
  } else if (salary_.state == WorkState::OffDuty) {
    pet = PetState::Overtime;
  }
  FinishViewModel result;
  result.screen = model_.screen();
  result.settlementPhase = model_.settlementPhase();
  result.salary = salary_;
  result.retirement = retirement_;
  result.month = clock_.date.month;
  result.day = clock_.date.date;
  result.hour = clock_.time.hours;
  result.minute = clock_.time.minutes;
  result.settingIndex = static_cast<uint8_t>(settingField_);
  result.settingCount = static_cast<uint8_t>(SettingField::Count);
  result.settingLabel = settingLabel();
  result.settingValue = settingValue();
  result.petState = pet;
  result.animationFrame = static_cast<uint8_t>((nowMs_ / 250) % 8);
  return result;
}

const char* FinishWorkApp::settingLabel() const {
  switch (settingField_) {
    case SettingField::Salary: return "月薪（元）";
    case SettingField::WorkStart: return "上班时间";
    case SettingField::WorkEnd: return "下班时间";
    case SettingField::BirthYear: return "出生年份";
    case SettingField::RetirementAge: return "退休年龄";
    case SettingField::DateYear: return "日期·年";
    case SettingField::DateMonth: return "日期·月";
    case SettingField::DateDay: return "日期·日";
    case SettingField::ClockHour: return "时间·时";
    case SettingField::ClockMinute: return "时间·分";
    case SettingField::Count: return "";
  }
  return "";
}

const char* FinishWorkApp::settingValue() {
  switch (settingField_) {
    case SettingField::Salary:
      snprintf(settingValue_, sizeof(settingValue_), "%ld",
               static_cast<long>(settings_.monthlySalaryCents / 100));
      break;
    case SettingField::WorkStart:
      snprintf(settingValue_, sizeof(settingValue_), "%02u:%02u",
               settings_.workStartMinute / 60,
               settings_.workStartMinute % 60);
      break;
    case SettingField::WorkEnd:
      snprintf(settingValue_, sizeof(settingValue_), "%02u:%02u",
               settings_.workEndMinute / 60,
               settings_.workEndMinute % 60);
      break;
    case SettingField::BirthYear:
      snprintf(settingValue_, sizeof(settingValue_), "%u",
               settings_.birthYear);
      break;
    case SettingField::RetirementAge:
      snprintf(settingValue_, sizeof(settingValue_), "%u",
               settings_.retirementAge);
      break;
    case SettingField::DateYear:
      snprintf(settingValue_, sizeof(settingValue_), "%04u",
               draftClock_.date.year);
      break;
    case SettingField::DateMonth:
      snprintf(settingValue_, sizeof(settingValue_), "%02u",
               draftClock_.date.month);
      break;
    case SettingField::DateDay:
      snprintf(settingValue_, sizeof(settingValue_), "%02u",
               draftClock_.date.date);
      break;
    case SettingField::ClockHour:
      snprintf(settingValue_, sizeof(settingValue_), "%02u",
               draftClock_.time.hours);
      break;
    case SettingField::ClockMinute:
      snprintf(settingValue_, sizeof(settingValue_), "%02u",
               draftClock_.time.minutes);
      break;
    case SettingField::Count:
      settingValue_[0] = '\0';
      break;
  }
  return settingValue_;
}

CalendarDate FinishWorkApp::toCalendarDate(
    const m5::rtc_datetime_t& value) {
  return {value.date.year, value.date.month, value.date.date};
}

m5::rtc_datetime_t FinishWorkApp::buildClock() {
  static constexpr const char* kMonths[] = {
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
  char monthName[4] = {};
  int day = 1;
  int year = 2026;
  int hour = 9;
  int minute = 0;
  int second = 0;
  sscanf(__DATE__, "%3s %d %d", monthName, &day, &year);
  sscanf(__TIME__, "%d:%d:%d", &hour, &minute, &second);
  int month = 1;
  for (int index = 0; index < 12; ++index) {
    if (strcmp(monthName, kMonths[index]) == 0) {
      month = index + 1;
      break;
    }
  }
  m5::rtc_datetime_t result{};
  result.date.year = year;
  result.date.month = month;
  result.date.date = day;
  result.date.weekDay = weekdayFor({year, month, day});
  result.time.hours = hour;
  result.time.minutes = minute;
  result.time.seconds = second;
  return result;
}

}  // namespace apex
