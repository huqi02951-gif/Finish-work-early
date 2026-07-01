#pragma once

#include <Preferences.h>
#include <stdint.h>

namespace apex {

struct FinishSettings {
  int32_t monthlySalaryCents = 600000;
  uint16_t workStartMinute = 9 * 60;
  uint16_t workEndMinute = 17 * 60;
  uint16_t birthYear = 1990;
  uint8_t retirementAge = 55;
};

struct SettlementSnapshot {
  bool settled = false;
  int32_t dayKey = 0;
  uint32_t settledSecond = 0;
  int64_t earnedMilliCents = 0;
  int64_t lossMilliCents = 0;
  int64_t netMilliCents = 0;
};

class FinishWorkStore {
 public:
  void load(FinishSettings& settings, SettlementSnapshot& settlement);
  void saveSettings(const FinishSettings& settings);
  void saveSettlement(const SettlementSnapshot& settlement);
  void clearSettlement();

 private:
  static constexpr const char* kNamespace = "apex_finish";
  static constexpr uint8_t kVersion = 2;
  Preferences preferences_;
};

bool validSettings(const FinishSettings& settings);

}  // namespace apex
