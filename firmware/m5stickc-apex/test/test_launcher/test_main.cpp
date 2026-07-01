#include <unity.h>

#include "app_launcher.h"

void test_launcher_starts_on_finish_work_and_ignores_b_before_entry() {
  apex::AppLauncher launcher;
  TEST_ASSERT_EQUAL(apex::AppId::FinishWork, launcher.activeApp());
  TEST_ASSERT_FALSE(launcher.started());

  const auto beforeStart = launcher.handleButton(apex::ButtonEvent::BClick);

  TEST_ASSERT_EQUAL(apex::LauncherAction::None, beforeStart.action);
  TEST_ASSERT_EQUAL(apex::AppId::FinishWork, launcher.activeApp());
  TEST_ASSERT_FALSE(launcher.started());
}

void test_m5_enters_finish_work_then_b_cycles_apps() {
  apex::AppLauncher launcher;

  const auto enter = launcher.handleButton(apex::ButtonEvent::M5Click);
  TEST_ASSERT_EQUAL(apex::LauncherAction::ForwardToApp, enter.action);
  TEST_ASSERT_EQUAL(apex::AppId::FinishWork, enter.target);
  TEST_ASSERT_TRUE(launcher.started());

  const auto toFocus = launcher.handleButton(apex::ButtonEvent::BClick);
  TEST_ASSERT_EQUAL(apex::LauncherAction::SwitchedApp, toFocus.action);
  TEST_ASSERT_EQUAL(apex::AppId::FocusFruit, launcher.activeApp());

  const auto toFinish = launcher.handleButton(apex::ButtonEvent::BClick);
  TEST_ASSERT_EQUAL(apex::LauncherAction::SwitchedApp, toFinish.action);
  TEST_ASSERT_EQUAL(apex::AppId::FinishWork, launcher.activeApp());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_launcher_starts_on_finish_work_and_ignores_b_before_entry);
  RUN_TEST(test_m5_enters_finish_work_then_b_cycles_apps);
  return UNITY_END();
}
