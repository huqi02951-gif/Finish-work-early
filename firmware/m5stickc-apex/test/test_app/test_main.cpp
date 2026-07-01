#include <unity.h>

#include "finish_work_model.h"

void test_main_confirmation_times_out_and_second_click_settles() {
  apex::FinishWorkModel model;
  TEST_ASSERT_EQUAL(apex::AppAction::None,
                    model.handleButton(apex::ButtonEvent::M5Click, 0));
  TEST_ASSERT_EQUAL(apex::FinishScreen::Main, model.screen());

  TEST_ASSERT_EQUAL(apex::AppAction::None,
                    model.handleButton(apex::ButtonEvent::M5Click, 100));
  TEST_ASSERT_EQUAL(apex::SettlementPhase::Confirming,
                    model.settlementPhase());
  model.update(3101);
  TEST_ASSERT_EQUAL(apex::SettlementPhase::Live, model.settlementPhase());

  model.handleButton(apex::ButtonEvent::M5Click, 4000);
  TEST_ASSERT_EQUAL(apex::AppAction::SettleNow,
                    model.handleButton(apex::ButtonEvent::M5Click, 5000));
  TEST_ASSERT_EQUAL(apex::SettlementPhase::Settled,
                    model.settlementPhase());
}

void test_double_hold_and_b_events_use_launcher_safe_mapping() {
  apex::FinishWorkModel model;
  model.handleButton(apex::ButtonEvent::M5Click, 0);

  model.handleButton(apex::ButtonEvent::M5Hold, 1000);
  TEST_ASSERT_EQUAL(apex::FinishScreen::Detail, model.screen());
  model.handleButton(apex::ButtonEvent::M5Hold, 2000);
  TEST_ASSERT_EQUAL(apex::FinishScreen::Main, model.screen());

  model.handleButton(apex::ButtonEvent::M5DoubleClick, 3000);
  TEST_ASSERT_EQUAL(apex::FinishScreen::Settings, model.screen());
  TEST_ASSERT_EQUAL(apex::AppAction::AdjustUp,
                    model.handleButton(apex::ButtonEvent::M5Click, 4000));
  TEST_ASSERT_EQUAL(apex::AppAction::AdjustDown,
                    model.handleButton(apex::ButtonEvent::M5DoubleClick, 5000));
  TEST_ASSERT_EQUAL(apex::AppAction::NextSetting,
                    model.handleButton(apex::ButtonEvent::M5Hold, 6000));

  const auto screen = model.screen();
  TEST_ASSERT_EQUAL(apex::AppAction::None,
                    model.handleButton(apex::ButtonEvent::BClick, 7000));
  TEST_ASSERT_EQUAL(screen, model.screen());
  TEST_ASSERT_EQUAL(apex::AppAction::None,
                    model.handleButton(apex::ButtonEvent::BHold, 8000));
  TEST_ASSERT_EQUAL(screen, model.screen());
}

void test_new_day_clears_settlement() {
  apex::FinishWorkModel model;
  model.handleButton(apex::ButtonEvent::M5Click, 0);
  model.handleButton(apex::ButtonEvent::M5Click, 1000);
  model.handleButton(apex::ButtonEvent::M5Click, 1500);
  TEST_ASSERT_EQUAL(apex::SettlementPhase::Settled,
                    model.settlementPhase());
  model.resetForDay(20000);
  TEST_ASSERT_EQUAL(apex::SettlementPhase::Live, model.settlementPhase());
  TEST_ASSERT_EQUAL_INT32(20000, model.dayKey());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_main_confirmation_times_out_and_second_click_settles);
  RUN_TEST(test_double_hold_and_b_events_use_launcher_safe_mapping);
  RUN_TEST(test_new_day_clears_settlement);
  return UNITY_END();
}
