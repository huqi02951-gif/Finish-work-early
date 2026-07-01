#pragma once

#include <stdint.h>

#include "app_input.h"

namespace apex {

enum class FinishScreen : uint8_t { Splash, Main, Detail, Settings };
enum class SettlementPhase : uint8_t { Live, Confirming, Settled };
enum class AppAction : uint8_t {
  None,
  SettleNow,
  AdjustUp,
  AdjustDown,
  NextSetting,
};

class FinishWorkModel {
 public:
  AppAction handleButton(ButtonEvent event, uint32_t nowMs);
  void update(uint32_t nowMs);
  void resetForDay(int32_t dayKey);
  void restoreSettled(int32_t dayKey);

  FinishScreen screen() const { return screen_; }
  SettlementPhase settlementPhase() const { return settlementPhase_; }
  int32_t dayKey() const { return dayKey_; }

 private:
  static constexpr uint32_t kConfirmTimeoutMs = 3000;

  FinishScreen screen_ = FinishScreen::Splash;
  SettlementPhase settlementPhase_ = SettlementPhase::Live;
  uint32_t confirmStartedMs_ = 0;
  int32_t dayKey_ = 0;
};

}  // namespace apex
