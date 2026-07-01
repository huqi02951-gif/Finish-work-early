#pragma once

#include <M5Unified.h>
#include <stdint.h>

namespace apex {

enum class FruitKind : uint8_t {
  Apple,
  Lemon,
  Berry,
  Orange,
};

FruitKind fruitForSession(uint16_t sessions);
void drawFruit(M5GFX& display, FruitKind fruit, int cx, int cy, int scale,
               uint8_t frame);

}  // namespace apex
