#pragma once

#include <stdint.h>

namespace apex {

enum class ClassifiedPress : uint8_t { None, Click, DoubleClick, Hold };

class ButtonClassifier {
 public:
  ClassifiedPress update(bool pressed, uint32_t nowMs);
  void reset();

 private:
  static constexpr uint32_t kDoubleClickMs = 300;
  static constexpr uint32_t kHoldMs = 800;

  bool wasPressed_ = false;
  bool holdEmitted_ = false;
  bool pendingClick_ = false;
  uint32_t pressedAtMs_ = 0;
  uint32_t releasedAtMs_ = 0;
};

}  // namespace apex
