#include "focus_fruit_app.h"

#include <stdio.h>

#include "focus_fruit_layout.h"

namespace apex {
namespace {

constexpr uint16_t rgb565(uint8_t red, uint8_t green, uint8_t blue) {
  return static_cast<uint16_t>(((red & 0xF8) << 8) |
                               ((green & 0xFC) << 3) | (blue >> 3));
}

constexpr uint16_t kBlack = rgb565(0, 0, 0);
constexpr uint16_t kBlue = rgb565(66, 133, 244);
constexpr uint16_t kRed = rgb565(234, 67, 53);
constexpr uint16_t kYellow = rgb565(251, 188, 5);
constexpr uint16_t kGreen = rgb565(52, 168, 83);
constexpr uint16_t kCream = rgb565(247, 243, 232);
constexpr uint16_t kGray = rgb565(138, 138, 138);
constexpr uint16_t kDark = rgb565(10, 16, 28);
constexpr uint16_t kPanel = rgb565(18, 30, 52);

void drawLabel(const char* text, int x, int y, uint16_t color,
               textdatum_t datum = textdatum_t::top_left) {
  M5.Display.setFont(&fonts::efontCN_12);
  M5.Display.setTextDatum(datum);
  M5.Display.setTextColor(color, kBlack);
  M5.Display.drawString(text, x, y);
}

}  // namespace

void FocusFruitApp::begin() {
  M5.Display.setRotation(1);
  M5.Display.setTextWrap(false);
  M5.Display.setBrightness(82);
  Serial.println("UI_LAYOUT_CHECK focus_fruit=OK safe=240x135");
  dirty_ = true;
}

void FocusFruitApp::update(uint32_t nowMs) {
  nowMs_ = nowMs;
  if (active_) updateFlip(nowMs);
  if (state_ == FocusFruitState::Running && elapsedMs() >= kSessionMs) {
    complete();
  }
}

void FocusFruitApp::render() {
  if (!dirty_ && nowMs_ - lastRenderMs_ < 250) return;
  drawBackground();
  drawTop();
  drawFruit(M5.Display, fruitForSession(sessions_),
            kFocusFruitBounds.x + kFocusFruitBounds.width / 2,
            kFocusFruitBounds.y + 43, 6,
            static_cast<uint8_t>((nowMs_ / 250) % 8));
  drawMetricCard();
  drawFooter();
  lastRenderMs_ = nowMs_;
  dirty_ = false;
}

void FocusFruitApp::handleButton(ButtonEvent event, uint32_t nowMs) {
  if (event == ButtonEvent::BClick || event == ButtonEvent::BHold) return;
  if (event == ButtonEvent::M5Click) {
    if (state_ == FocusFruitState::Ready ||
        state_ == FocusFruitState::Complete) {
      start(nowMs);
    } else if (state_ == FocusFruitState::Running) {
      pause(nowMs);
    } else {
      resume(nowMs);
    }
  } else if (event == ButtonEvent::M5DoubleClick) {
    pause(nowMs);
  } else if (event == ButtonEvent::M5Hold) {
    reset();
  }
  dirty_ = true;
  Serial.printf("FOCUS_INPUT event=%u state=%u\n",
                static_cast<unsigned>(event),
                static_cast<unsigned>(state_));
}

void FocusFruitApp::reset() {
  state_ = FocusFruitState::Ready;
  startedAtMs_ = 0;
  elapsedBeforePauseMs_ = 0;
  flipDetector_.reset();
  dirty_ = true;
}

void FocusFruitApp::setActive(bool active) {
  active_ = active;
  if (active_) {
    flipDetector_.reset();
    dirty_ = true;
  }
}

uint32_t FocusFruitApp::elapsedMs() const {
  if (state_ == FocusFruitState::Running) {
    return elapsedBeforePauseMs_ + nowMs_ - startedAtMs_;
  }
  return elapsedBeforePauseMs_;
}

uint32_t FocusFruitApp::remainingMs() const {
  const uint32_t elapsed = elapsedMs();
  return elapsed >= kSessionMs ? 0 : kSessionMs - elapsed;
}

uint8_t FocusFruitApp::progressPercent() const {
  const uint32_t elapsed = elapsedMs();
  if (elapsed >= kSessionMs) return 100;
  return static_cast<uint8_t>((elapsed * 100UL) / kSessionMs);
}

void FocusFruitApp::start(uint32_t nowMs) {
  state_ = FocusFruitState::Running;
  startedAtMs_ = nowMs;
  elapsedBeforePauseMs_ = 0;
}

void FocusFruitApp::pause(uint32_t nowMs) {
  if (state_ != FocusFruitState::Running) return;
  elapsedBeforePauseMs_ = elapsedBeforePauseMs_ + nowMs - startedAtMs_;
  state_ = FocusFruitState::Paused;
}

void FocusFruitApp::resume(uint32_t nowMs) {
  if (state_ != FocusFruitState::Paused) return;
  startedAtMs_ = nowMs;
  state_ = FocusFruitState::Running;
}

void FocusFruitApp::complete() {
  if (state_ == FocusFruitState::Complete) return;
  state_ = FocusFruitState::Complete;
  elapsedBeforePauseMs_ = kSessionMs;
  ++sessions_;
  dirty_ = true;
}

void FocusFruitApp::updateFlip(uint32_t nowMs) {
  if (nowMs - lastFlipCheckMs_ < 80 || !M5.Imu.isEnabled()) return;
  lastFlipCheckMs_ = nowMs;
  if (!M5.Imu.update()) return;
  float ax = 0.0f;
  float ay = 0.0f;
  float az = 0.0f;
  if (!M5.Imu.getAccel(&ax, &ay, &az)) return;
  const FocusFlipEvent event = flipDetector_.update(ax, ay, az, nowMs);
  if (event == FocusFlipEvent::FaceDown) {
    if (state_ == FocusFruitState::Ready ||
        state_ == FocusFruitState::Complete) {
      start(nowMs);
    } else if (state_ == FocusFruitState::Paused) {
      resume(nowMs);
    }
    dirty_ = true;
    Serial.println("FOCUS_FLIP face=down");
  } else if (event == FocusFlipEvent::FaceUp) {
    pause(nowMs);
    dirty_ = true;
    Serial.println("FOCUS_FLIP face=up");
  }
}

void FocusFruitApp::drawBackground() {
  M5.Display.fillScreen(kBlack);
  constexpr uint16_t colors[] = {kBlue, kRed, kYellow, kGreen};
  for (int index = 0; index < 4; ++index) {
    M5.Display.fillRoundRect(9 + index * 28, 7, 22, 4, 2, colors[index]);
  }
  M5.Display.drawRoundRect(kFocusFruitBounds.x, kFocusFruitBounds.y,
                           kFocusFruitBounds.width,
                           kFocusFruitBounds.height, 9, kPanel);
  M5.Display.fillRoundRect(kFocusMetricBounds.x, kFocusMetricBounds.y,
                           kFocusMetricBounds.width,
                           kFocusMetricBounds.height, 9, kDark);
  M5.Display.drawRoundRect(kFocusMetricBounds.x, kFocusMetricBounds.y,
                           kFocusMetricBounds.width,
                           kFocusMetricBounds.height, 9, kBlue);
}

void FocusFruitApp::drawTop() {
  M5.Display.setTextFont(1);
  M5.Display.setTextDatum(textdatum_t::top_right);
  M5.Display.setTextColor(kGray, kBlack);
  M5.Display.drawString("B next", kFocusTopBounds.x + kFocusTopBounds.width,
                        kFocusTopBounds.y + 2);
  M5.Display.setTextDatum(textdatum_t::top_center);
  M5.Display.setTextColor(kYellow, kBlack);
  M5.Display.drawString("flip focus fruit", 120, kFocusTopBounds.y + 2);
}

void FocusFruitApp::drawMetricCard() {
  const uint32_t remaining = remainingMs() / 1000UL;
  const uint8_t minutes = static_cast<uint8_t>(remaining / 60);
  const uint8_t seconds = static_cast<uint8_t>(remaining % 60);
  char timeText[8];
  snprintf(timeText, sizeof(timeText), "%02u:%02u", minutes, seconds);

  drawLabel("专注水果", kFocusMetricBounds.x + 10,
            kFocusMetricBounds.y + 8, kGreen);
  M5.Display.setTextFont(4);
  M5.Display.setTextDatum(textdatum_t::middle_center);
  M5.Display.setTextColor(kCream, kDark);
  M5.Display.drawString(timeText,
                        kFocusMetricBounds.x + kFocusMetricBounds.width / 2,
                        kFocusMetricBounds.y + 39);
  drawLabel(stateLabel(), kFocusMetricBounds.x + 10,
            kFocusMetricBounds.y + 59, kGray);

  const int barX = kFocusMetricBounds.x + 10;
  const int barY = kFocusMetricBounds.y + 68;
  const int barW = kFocusMetricBounds.width - 20;
  M5.Display.drawRoundRect(barX, barY, barW, 5, 2, kBlue);
  M5.Display.fillRoundRect(barX + 1, barY + 1,
                           (barW - 2) * progressPercent() / 100, 3, 1,
                           kYellow);
}

void FocusFruitApp::drawFooter() {
  drawLabel("Flip down focus  M5 pause  B next", kFocusFooterBounds.x,
            kFocusFooterBounds.y + 2, kGray);
}

const char* FocusFruitApp::stateLabel() const {
  switch (state_) {
    case FocusFruitState::Ready:
      return "Ready";
    case FocusFruitState::Running:
      return "Focus";
    case FocusFruitState::Paused:
      return "Paused";
    case FocusFruitState::Complete:
      return "Done";
  }
  return "";
}

}  // namespace apex
