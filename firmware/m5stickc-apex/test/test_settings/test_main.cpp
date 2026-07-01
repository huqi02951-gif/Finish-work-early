#include <unity.h>

#include "finish_work_settings.h"

void test_exit_page_is_last_setting_step() {
  TEST_ASSERT_EQUAL(apex::FinishSettingField::Exit,
                    apex::nextSettingField(
                        apex::FinishSettingField::ClockMinute));
  TEST_ASSERT_TRUE(apex::isExitSetting(apex::FinishSettingField::Exit));
  TEST_ASSERT_EQUAL_UINT8(
      static_cast<uint8_t>(apex::FinishSettingField::Exit) + 1,
      apex::finishSettingCount());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_exit_page_is_last_setting_step);
  return UNITY_END();
}
