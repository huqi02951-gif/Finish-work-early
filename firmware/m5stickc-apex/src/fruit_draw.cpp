#include "fruit_draw.h"

namespace apex {
namespace {

constexpr uint16_t rgb565(uint8_t red, uint8_t green, uint8_t blue) {
  return static_cast<uint16_t>(((red & 0xF8) << 8) |
                               ((green & 0xFC) << 3) | (blue >> 3));
}

constexpr uint16_t kBlack = rgb565(0, 0, 0);
constexpr uint16_t kCream = rgb565(247, 243, 232);
constexpr uint16_t kGreen = rgb565(52, 168, 83);
constexpr uint16_t kRed = rgb565(234, 67, 53);
constexpr uint16_t kYellow = rgb565(251, 188, 5);
constexpr uint16_t kBlue = rgb565(66, 133, 244);
constexpr uint16_t kOrange = rgb565(255, 145, 30);
constexpr uint16_t kPurple = rgb565(158, 98, 255);
constexpr uint16_t kLeaf = rgb565(66, 190, 94);
constexpr uint16_t kStem = rgb565(116, 67, 32);

void drawFace(M5GFX& display, int cx, int cy, int scale, uint8_t frame) {
  const bool blink = frame % 8 == 0;
  const int eyeY = cy - scale / 2;
  if (blink) {
    display.drawFastHLine(cx - scale * 2, eyeY, scale, kBlack);
    display.drawFastHLine(cx + scale, eyeY, scale, kBlack);
  } else {
    display.fillCircle(cx - scale * 2, eyeY, scale / 2 + 1, kCream);
    display.fillCircle(cx + scale * 2, eyeY, scale / 2 + 1, kCream);
    display.fillCircle(cx - scale * 2, eyeY, scale / 3 + 1, kBlack);
    display.fillCircle(cx + scale * 2, eyeY, scale / 3 + 1, kBlack);
  }
  display.drawFastHLine(cx - scale, cy + scale * 2, scale * 2, kBlack);
}

}  // namespace

FruitKind fruitForSession(uint16_t sessions) {
  switch (sessions % 4) {
    case 0:
      return FruitKind::Apple;
    case 1:
      return FruitKind::Lemon;
    case 2:
      return FruitKind::Berry;
    default:
      return FruitKind::Orange;
  }
}

void drawFruit(M5GFX& display, FruitKind fruit, int cx, int cy, int scale,
               uint8_t frame) {
  const int bounce = (frame & 1) ? -2 : 0;
  cy += bounce;
  uint16_t body = kRed;
  switch (fruit) {
    case FruitKind::Apple:
      body = kRed;
      display.fillCircle(cx - scale, cy, scale * 4, body);
      display.fillCircle(cx + scale, cy, scale * 4, body);
      display.fillRect(cx - scale * 3, cy - scale, scale * 6,
                       scale * 5, body);
      break;
    case FruitKind::Lemon:
      body = kYellow;
      display.fillEllipse(cx, cy, scale * 6, scale * 4, body);
      display.fillTriangle(cx - scale * 7, cy, cx - scale * 4,
                           cy - scale * 3, cx - scale * 4,
                           cy + scale * 3, body);
      display.fillTriangle(cx + scale * 7, cy, cx + scale * 4,
                           cy - scale * 3, cx + scale * 4,
                           cy + scale * 3, body);
      break;
    case FruitKind::Berry:
      body = kPurple;
      display.fillCircle(cx, cy - scale, scale * 4, body);
      display.fillCircle(cx - scale * 3, cy + scale * 2, scale * 3, body);
      display.fillCircle(cx + scale * 3, cy + scale * 2, scale * 3, body);
      display.fillCircle(cx, cy + scale * 3, scale * 4, kBlue);
      break;
    case FruitKind::Orange:
      body = kOrange;
      display.fillCircle(cx, cy, scale * 5, body);
      display.drawCircle(cx, cy, scale * 3, kYellow);
      break;
  }
  display.fillRect(cx - scale / 2, cy - scale * 7, scale, scale * 3, kStem);
  display.fillEllipse(cx + scale * 2, cy - scale * 7, scale * 2, scale,
                      kLeaf);
  drawFace(display, cx, cy, scale, frame);
}

}  // namespace apex
