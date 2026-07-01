#include "finish_work_view.h"

#include <stdio.h>

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
constexpr uint16_t kDarkBlue = rgb565(8, 24, 48);
constexpr uint16_t kPetBlue = rgb565(70, 142, 255);
constexpr uint16_t kPetYellow = rgb565(255, 207, 48);

void formatMoneyNumber(int64_t milliCents, char* output, size_t size) {
  const bool negative = milliCents < 0;
  uint64_t absolute = static_cast<uint64_t>(
      negative ? -(milliCents + 1) + 1 : milliCents);
  const uint64_t cents = (absolute + 500) / 1000;
  snprintf(output, size, "%s%llu.%02llu", negative ? "-" : "",
           static_cast<unsigned long long>(cents / 100),
           static_cast<unsigned long long>(cents % 100));
}

}  // namespace

FinishWorkView::FinishWorkView() : canvas_(&M5.Display) {}

bool FinishWorkView::begin() {
  canvas_.setColorDepth(16);
  canvas_.setTextWrap(false);
  if (canvas_.createSprite(240, 135) == nullptr) return false;
  canvas_.setFont(&fonts::efontCN_12);
  const bool labelsFit =
      canvas_.textWidth("M5下班  长按详情  B切换") <= kFooterBounds.width &&
      canvas_.textWidth("单击返回  双击设置  B切换") <= kFooterBounds.width &&
      canvas_.textWidth("单击增加  双击减少") <= kSafeBounds.width &&
      canvas_.textWidth("长按下一项  B切换") <= kSafeBounds.width &&
      canvas_.textWidth("距退休 99年 364天") <=
          kRetirementBounds.width - 12;
  Serial.printf("UI_LAYOUT_CHECK static_labels=%s safe=240x135\n",
                labelsFit ? "OK" : "OVERFLOW");
  return labelsFit;
}

void FinishWorkView::render(const FinishViewModel& model) {
  canvas_.fillScreen(kBlack);
  switch (model.screen) {
    case FinishScreen::Splash:
      drawSplash();
      break;
    case FinishScreen::Main:
      drawMain(model);
      break;
    case FinishScreen::Detail:
      drawDetail(model);
      break;
    case FinishScreen::Settings:
      drawSettings(model);
      break;
  }
  canvas_.pushSprite(0, 0);
}

void FinishWorkView::drawSplash() {
  constexpr uint16_t colors[] = {kBlue, kRed, kYellow, kGreen};
  for (int index = 0; index < 4; ++index) {
    canvas_.fillRoundRect(53 + index * 35, 24, 28, 5, 2, colors[index]);
  }
  canvas_.setTextDatum(textdatum_t::middle_center);
  canvas_.setTextFont(4);
  canvas_.setTextColor(kCream, kBlack);
  canvas_.drawString("APEX", 120, 61);
  canvas_.setFont(&fonts::efontCN_12);
  canvas_.setTextColor(kBlue, kBlack);
  canvas_.drawString("按 M5 进入", 120, 104);
}

void FinishWorkView::drawTop(const FinishViewModel& model) {
  char date[8];
  char time[8];
  snprintf(date, sizeof(date), "%02u/%02u", model.month, model.day);
  snprintf(time, sizeof(time), "%02u:%02u", model.hour, model.minute);
  canvas_.setTextFont(1);
  canvas_.setTextDatum(textdatum_t::top_left);
  canvas_.setTextColor(kGray, kBlack);
  canvas_.drawString(date, kTopBounds.x, kTopBounds.y + 2);
  canvas_.setTextDatum(textdatum_t::top_center);
  canvas_.setTextColor(kBlue, kBlack);
  canvas_.drawString("finish work early", 120, kTopBounds.y + 2);
  canvas_.setTextDatum(textdatum_t::top_right);
  canvas_.setTextColor(kCream, kBlack);
  canvas_.drawString(time, kTopBounds.x + kTopBounds.width,
                     kTopBounds.y + 2);
  canvas_.drawFastHLine(6, 20, 228, kDarkBlue);
}

void FinishWorkView::drawMain(const FinishViewModel& model) {
  drawTop(model);
  const bool settled = model.settlementPhase == SettlementPhase::Settled;
  const bool overtime = !settled && model.salary.state == WorkState::OffDuty;
  const bool confirming =
      model.settlementPhase == SettlementPhase::Confirming;

  const char* label = "今天已赚";
  uint16_t color = kGreen;
  int64_t amount = model.salary.earnedMilliCents;
  if (overtime) {
    label = "加班损失";
    color = kRed;
    amount = -model.salary.lossMilliCents;
  } else if (settled) {
    label = "今日结算";
    color = kYellow;
    amount = model.salary.netMilliCents;
  }

  drawChinese(label, kMoneyBounds.x, kMoneyBounds.y + 1, color);
  drawMoney(kMoneyBounds.x, kMoneyBounds.y + 20, amount, kCream, true);

  if (overtime) {
    char earned[24];
    formatMoneyNumber(model.salary.earnedMilliCents, earned, sizeof(earned));
    char line[40];
    snprintf(line, sizeof(line), "已赚 ¥%s", earned);
    drawChinese(line, kMoneyBounds.x, kMoneyBounds.y + 47, kGreen);
  } else if (confirming) {
    drawChinese("再按一次确认下班", kMoneyBounds.x,
                kMoneyBounds.y + 47, kYellow);
  } else {
    drawChinese(settled ? "今天辛苦啦" : "工资正在增长",
                kMoneyBounds.x, kMoneyBounds.y + 47,
                settled ? kYellow : kGray);
  }

  drawPet(model.petState, model.animationFrame);

  canvas_.drawRoundRect(kRetirementBounds.x, kRetirementBounds.y,
                        kRetirementBounds.width, kRetirementBounds.height,
                        5, kBlue);
  char retirement[48];
  if (model.retirement.valid) {
    snprintf(retirement, sizeof(retirement), "距退休 %d年 %d天",
             model.retirement.yearsLeft, model.retirement.daysLeft);
  } else {
    snprintf(retirement, sizeof(retirement), "退休日期设置无效");
  }
  drawChinese(retirement, 120, kRetirementBounds.y + 4, kCream,
              textdatum_t::top_center);

  drawChinese("M5下班  长按详情  B切换", kFooterBounds.x,
              kFooterBounds.y + 2, kGray);
}

void FinishWorkView::drawDetail(const FinishViewModel& model) {
  drawTop(model);
  drawChinese("今日详细", 8, 27, kBlue);
  drawChinese("已赚", 10, 50, kGreen);
  drawMoney(58, 45, model.salary.earnedMilliCents, kCream, false);
  drawChinese("损失", 10, 73, kRed);
  drawMoney(58, 68, -model.salary.lossMilliCents, kCream, false);
  drawChinese("净赚", 10, 96, kYellow);
  drawMoney(58, 91, model.salary.netMilliCents, kCream, false);
  drawPet(model.petState, model.animationFrame);
  drawChinese("单击返回  双击设置  B切换", 6, 118, kGray);
}

void FinishWorkView::drawSettings(const FinishViewModel& model) {
  char page[20];
  snprintf(page, sizeof(page), "设置 %u/%u", model.settingIndex + 1,
           model.settingCount);
  drawChinese(page, 8, 8, kBlue);
  canvas_.drawFastHLine(8, 27, 224, kDarkBlue);
  drawChinese(model.settingLabel, 120, 38, kGray,
              textdatum_t::top_center);
  canvas_.setTextFont(4);
  canvas_.setTextDatum(textdatum_t::middle_center);
  canvas_.setTextColor(kCream, kBlack);
  canvas_.drawString(model.settingValue, 120, 76);
  drawChinese("单击增加  双击减少", 120, 103, kGreen,
              textdatum_t::top_center);
  drawChinese("长按下一项  B切换", 120, 119, kGray,
              textdatum_t::top_center);
}

void FinishWorkView::drawPet(PetState state, uint8_t frame) {
  const int bounce = (state == PetState::Celebrate && (frame & 1)) ? -3 : 0;
  const int cx = 201;
  const int cy = 55 + bounce;
  canvas_.fillTriangle(cx - 20, cy - 18, cx - 10, cy - 31,
                       cx - 5, cy - 16, kPetYellow);
  canvas_.fillTriangle(cx + 20, cy - 18, cx + 10, cy - 31,
                       cx + 5, cy - 16, kPetYellow);
  canvas_.fillCircle(cx, cy, 22, kPetBlue);
  canvas_.fillEllipse(cx, cy + 13, 13, 8, kPetYellow);
  const bool blink = state == PetState::Sleep || (frame % 8 == 0);
  if (blink) {
    canvas_.drawFastHLine(cx - 12, cy - 4, 7, kBlack);
    canvas_.drawFastHLine(cx + 5, cy - 4, 7, kBlack);
  } else {
    canvas_.fillCircle(cx - 9, cy - 5, 4, kCream);
    canvas_.fillCircle(cx + 9, cy - 5, 4, kCream);
    canvas_.fillCircle(cx - 8, cy - 4, 2, kBlack);
    canvas_.fillCircle(cx + 8, cy - 4, 2, kBlack);
  }
  canvas_.fillCircle(cx - 17, cy + 5, 3, kRed);
  canvas_.fillCircle(cx + 17, cy + 5, 3, kRed);

  if (state == PetState::Overtime) {
    canvas_.fillTriangle(cx + 23, cy - 15, cx + 29, cy - 7,
                         cx + 21, cy - 5, kBlue);
    canvas_.drawLine(cx - 6, cy + 9, cx + 6, cy + 7, kBlack);
  } else if (state == PetState::Confirm) {
    canvas_.fillRoundRect(cx - 24, cy + 18, 48, 13, 2, kYellow);
    canvas_.setTextFont(1);
    canvas_.setTextDatum(textdatum_t::middle_center);
    canvas_.setTextColor(kBlack, kYellow);
    canvas_.drawString("OFF?", cx, cy + 24);
  } else {
    canvas_.drawFastHLine(cx - 5, cy + 8, 10, kBlack);
  }

  if (state == PetState::Earn) {
    canvas_.fillCircle(226, 32 + (frame & 1) * 4, 4, kGreen);
    canvas_.drawCircle(226, 32 + (frame & 1) * 4, 2, kYellow);
  }
  if (state == PetState::Celebrate) {
    constexpr uint16_t confetti[] = {kBlue, kRed, kYellow, kGreen};
    for (int i = 0; i < 4; ++i) {
      canvas_.fillRect(174 + i * 15, 27 + ((frame + i) % 3) * 6,
                       4, 4, confetti[i]);
    }
  }
}

void FinishWorkView::drawMoney(int x, int y, int64_t milliCents,
                               uint16_t color, bool large) {
  char amount[24];
  formatMoneyNumber(milliCents, amount, sizeof(amount));
  canvas_.setFont(&fonts::efontCN_14);
  canvas_.setTextDatum(textdatum_t::top_left);
  canvas_.setTextColor(color, kBlack);
  canvas_.drawString("¥", x, y + (large ? 7 : 4));
  canvas_.setTextFont(large ? 4 : 2);
  if (large && canvas_.textWidth(amount) > kMoneyBounds.width - 17) {
    canvas_.setTextFont(2);
  }
  canvas_.drawString(amount, x + (large ? 17 : 13), y);
}

void FinishWorkView::drawChinese(const char* text, int x, int y,
                                 uint16_t color, textdatum_t datum) {
  canvas_.setFont(&fonts::efontCN_12);
  canvas_.setTextDatum(datum);
  canvas_.setTextColor(color, kBlack);
  canvas_.drawString(text, x, y);
}

}  // namespace apex
