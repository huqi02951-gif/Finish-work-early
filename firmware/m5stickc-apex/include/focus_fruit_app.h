#pragma once

#include <M5Unified.h>

#include "app_input.h"
#include "focus_flip_detector.h"
#include "fruit_draw.h"

namespace apex {

enum class FocusFruitState : uint8_t {
  Ready,
  Running,
  Paused,
  Complete,
};

class FocusFruitApp {
 public:
  void begin();
  void update(uint32_t nowMs);
  void render();
  void handleButton(ButtonEvent event, uint32_t nowMs);
  void reset();
  void setActive(bool active);

 private:
  static constexpr uint32_t kSessionMs = 25UL * 60UL * 1000UL;

  FocusFruitState state_ = FocusFruitState::Ready;
  uint32_t startedAtMs_ = 0;
  uint32_t elapsedBeforePauseMs_ = 0;
  uint32_t nowMs_ = 0;
  uint32_t lastRenderMs_ = 0;
  uint32_t lastFlipCheckMs_ = 0;
  uint16_t sessions_ = 0;
  FocusFlipDetector flipDetector_;
  bool dirty_ = true;
  bool active_ = false;

  uint32_t elapsedMs() const;
  uint32_t remainingMs() const;
  uint8_t progressPercent() const;
  void start(uint32_t nowMs);
  void pause(uint32_t nowMs);
  void resume(uint32_t nowMs);
  void complete();
  void updateFlip(uint32_t nowMs);
  void drawBackground();
  void drawTop();
  void drawMetricCard();
  void drawFooter();
  const char* stateLabel() const;
};

}  // namespace apex
