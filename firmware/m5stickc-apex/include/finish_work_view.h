#pragma once

#include <M5Unified.h>

#include "finish_work_logic.h"
#include "finish_work_model.h"
#include "layout_bounds.h"

namespace apex {

enum class PetState : uint8_t { Sleep, Earn, Overtime, Confirm, Celebrate };

struct FinishViewModel {
  FinishScreen screen = FinishScreen::Splash;
  SettlementPhase settlementPhase = SettlementPhase::Live;
  SalaryStatus salary{};
  RetirementStatus retirement{};
  uint8_t month = 1;
  uint8_t day = 1;
  uint8_t hour = 0;
  uint8_t minute = 0;
  uint8_t settingIndex = 0;
  uint8_t settingCount = 0;
  const char* settingLabel = "";
  const char* settingValue = "";
  PetState petState = PetState::Sleep;
  uint8_t animationFrame = 0;
};

class FinishWorkView {
 public:
  FinishWorkView();
  bool begin();
  void render(const FinishViewModel& model);

 private:
  M5Canvas canvas_;

  void drawSplash();
  void drawMain(const FinishViewModel& model);
  void drawDetail(const FinishViewModel& model);
  void drawSettings(const FinishViewModel& model);
  void drawTop(const FinishViewModel& model);
  void drawPet(PetState state, uint8_t frame);
  void drawMoney(int x, int y, int64_t milliCents, uint16_t color,
                 bool large = true);
  void drawChinese(const char* text, int x, int y, uint16_t color,
                   textdatum_t datum = textdatum_t::top_left);
};

}  // namespace apex
