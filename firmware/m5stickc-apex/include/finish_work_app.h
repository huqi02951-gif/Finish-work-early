#pragma once

#include <M5Unified.h>

#include "app_input.h"
#include "finish_work_model.h"
#include "finish_work_store.h"
#include "finish_work_view.h"

namespace apex {

class FinishWorkApp {
 public:
  void begin();
  void update(uint32_t nowMs);
  void render();
  void handleButton(ButtonEvent event, uint32_t nowMs);
  void reset();
  bool setClock(const m5::rtc_datetime_t& clock);

 private:
  enum class SettingField : uint8_t {
    Salary,
    WorkStart,
    WorkEnd,
    BirthYear,
    RetirementAge,
    DateYear,
    DateMonth,
    DateDay,
    ClockHour,
    ClockMinute,
    Count,
  };

  FinishWorkModel model_;
  FinishWorkStore store_;
  FinishWorkView view_;
  FinishSettings settings_;
  SettlementSnapshot settlement_;
  SettingField settingField_ = SettingField::Salary;
  m5::rtc_datetime_t clock_{};
  m5::rtc_datetime_t draftClock_{};
  SalaryStatus salary_{};
  RetirementStatus retirement_{};
  char settingValue_[24]{};
  uint32_t nowMs_ = 0;
  uint32_t lastRenderMs_ = 0;
  bool dirty_ = true;

  void ensureClock();
  void refreshData();
  void openSettings();
  void adjustSetting(int direction);
  void nextSetting();
  void saveSettings();
  void settleNow();
  void normalizeDraftClock();
  FinishViewModel makeViewModel();
  const char* settingLabel() const;
  const char* settingValue();

  static CalendarDate toCalendarDate(const m5::rtc_datetime_t& value);
  static m5::rtc_datetime_t buildClock();
};

}  // namespace apex
