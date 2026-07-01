#pragma once

#include <stdint.h>

namespace apex {

enum class ButtonEvent : uint8_t {
  M5Click,
  M5DoubleClick,
  M5Hold,
  BClick,
  BHold,
};

}  // namespace apex
