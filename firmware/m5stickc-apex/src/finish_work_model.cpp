#include "finish_work_model.h"

namespace apex {

AppAction FinishWorkModel::handleButton(ButtonEvent event, uint32_t nowMs) {
  if (event == ButtonEvent::BClick || event == ButtonEvent::BHold) {
    return AppAction::None;
  }

  if (screen_ == FinishScreen::Splash) {
    if (event == ButtonEvent::M5Click) screen_ = FinishScreen::Main;
    return AppAction::None;
  }

  if (screen_ == FinishScreen::Settings) {
    if (event == ButtonEvent::M5Click) return AppAction::AdjustUp;
    if (event == ButtonEvent::M5DoubleClick) return AppAction::AdjustDown;
    if (event == ButtonEvent::M5Hold) return AppAction::NextSetting;
    return AppAction::None;
  }

  if (screen_ == FinishScreen::Detail) {
    if (event == ButtonEvent::M5DoubleClick) {
      screen_ = FinishScreen::Settings;
    } else if (event == ButtonEvent::M5Click ||
               event == ButtonEvent::M5Hold) {
      screen_ = FinishScreen::Main;
    }
    return AppAction::None;
  }

  if (event == ButtonEvent::M5DoubleClick) {
    settlementPhase_ = settlementPhase_ == SettlementPhase::Confirming
                           ? SettlementPhase::Live
                           : settlementPhase_;
    screen_ = FinishScreen::Settings;
    return AppAction::None;
  }
  if (event == ButtonEvent::M5Hold) {
    settlementPhase_ = settlementPhase_ == SettlementPhase::Confirming
                           ? SettlementPhase::Live
                           : settlementPhase_;
    screen_ = FinishScreen::Detail;
    return AppAction::None;
  }
  if (event != ButtonEvent::M5Click ||
      settlementPhase_ == SettlementPhase::Settled) {
    return AppAction::None;
  }
  if (settlementPhase_ == SettlementPhase::Confirming &&
      nowMs - confirmStartedMs_ <= kConfirmTimeoutMs) {
    settlementPhase_ = SettlementPhase::Settled;
    return AppAction::SettleNow;
  }
  settlementPhase_ = SettlementPhase::Confirming;
  confirmStartedMs_ = nowMs;
  return AppAction::None;
}

void FinishWorkModel::update(uint32_t nowMs) {
  if (settlementPhase_ == SettlementPhase::Confirming &&
      nowMs - confirmStartedMs_ > kConfirmTimeoutMs) {
    settlementPhase_ = SettlementPhase::Live;
  }
}

void FinishWorkModel::resetForDay(int32_t dayKey) {
  if (dayKey_ == dayKey) return;
  dayKey_ = dayKey;
  settlementPhase_ = SettlementPhase::Live;
  confirmStartedMs_ = 0;
  if (screen_ != FinishScreen::Splash) screen_ = FinishScreen::Main;
}

void FinishWorkModel::restoreSettled(int32_t dayKey) {
  dayKey_ = dayKey;
  settlementPhase_ = SettlementPhase::Settled;
}

void FinishWorkModel::showMain() {
  screen_ = FinishScreen::Main;
}

}  // namespace apex
