#pragma once

#include <stdint.h>

namespace apex {

struct Rect {
  int16_t x;
  int16_t y;
  int16_t width;
  int16_t height;
};

constexpr Rect kSafeBounds{4, 3, 232, 129};
constexpr Rect kTopBounds{6, 4, 228, 16};
constexpr Rect kMoneyBounds{6, 24, 157, 58};
constexpr Rect kPetBounds{169, 24, 65, 62};
constexpr Rect kRetirementBounds{6, 88, 228, 20};
constexpr Rect kFooterBounds{6, 113, 228, 18};

constexpr bool inside(const Rect& outer, const Rect& inner) {
  return inner.x >= outer.x && inner.y >= outer.y &&
         inner.x + inner.width <= outer.x + outer.width &&
         inner.y + inner.height <= outer.y + outer.height;
}

constexpr bool intersects(const Rect& left, const Rect& right) {
  return left.x < right.x + right.width &&
         left.x + left.width > right.x &&
         left.y < right.y + right.height &&
         left.y + left.height > right.y;
}

}  // namespace apex
