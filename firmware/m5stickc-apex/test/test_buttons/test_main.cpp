#include <unity.h>

#include "button_classifier.h"

void test_single_click_waits_for_double_click_window() {
  apex::ButtonClassifier button;
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(true, 0));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(false, 80));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(false, 300));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::Click, button.update(false, 381));
}

void test_double_click_suppresses_single_click() {
  apex::ButtonClassifier button;
  button.update(true, 0);
  button.update(false, 50);
  button.update(true, 150);
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::DoubleClick,
                    button.update(false, 210));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None,
                    button.update(false, 600));
}

void test_hold_emits_once_and_never_clicks_on_release() {
  apex::ButtonClassifier button;
  button.update(true, 0);
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(true, 799));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::Hold, button.update(true, 800));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(true, 1200));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(false, 1300));
  TEST_ASSERT_EQUAL(apex::ClassifiedPress::None, button.update(false, 1700));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_single_click_waits_for_double_click_window);
  RUN_TEST(test_double_click_suppresses_single_click);
  RUN_TEST(test_hold_emits_once_and_never_clicks_on_release);
  return UNITY_END();
}
