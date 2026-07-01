#include "button_classifier.h"

namespace apex {

ClassifiedPress ButtonClassifier::update(bool pressed, uint32_t nowMs) {
  if (pressed && !wasPressed_) {
    wasPressed_ = true;
    holdEmitted_ = false;
    pressedAtMs_ = nowMs;
    return ClassifiedPress::None;
  }

  if (pressed && wasPressed_) {
    if (!holdEmitted_ && nowMs - pressedAtMs_ >= kHoldMs) {
      holdEmitted_ = true;
      pendingClick_ = false;
      return ClassifiedPress::Hold;
    }
    return ClassifiedPress::None;
  }

  if (!pressed && wasPressed_) {
    wasPressed_ = false;
    if (holdEmitted_) return ClassifiedPress::None;
    if (pendingClick_ && nowMs - releasedAtMs_ <= kDoubleClickMs) {
      pendingClick_ = false;
      return ClassifiedPress::DoubleClick;
    }
    pendingClick_ = true;
    releasedAtMs_ = nowMs;
    return ClassifiedPress::None;
  }

  if (pendingClick_ && nowMs - releasedAtMs_ > kDoubleClickMs) {
    pendingClick_ = false;
    return ClassifiedPress::Click;
  }
  return ClassifiedPress::None;
}

void ButtonClassifier::reset() {
  wasPressed_ = false;
  holdEmitted_ = false;
  pendingClick_ = false;
  pressedAtMs_ = 0;
  releasedAtMs_ = 0;
}

}  // namespace apex
