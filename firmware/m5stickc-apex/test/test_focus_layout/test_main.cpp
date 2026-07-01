#include <unity.h>

#include "focus_fruit_layout.h"

void test_focus_fruit_regions_fill_landscape_safe_area() {
  TEST_ASSERT_TRUE(apex::inside(apex::kFocusSafeBounds,
                                apex::kFocusTopBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kFocusSafeBounds,
                                apex::kFocusFruitBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kFocusSafeBounds,
                                apex::kFocusMetricBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kFocusSafeBounds,
                                apex::kFocusFooterBounds));

  TEST_ASSERT_GREATER_OR_EQUAL(220, apex::kFocusSafeBounds.width);
  TEST_ASSERT_GREATER_OR_EQUAL(120, apex::kFocusSafeBounds.height);
  TEST_ASSERT_GREATER_OR_EQUAL(80, apex::kFocusFruitBounds.width);
  TEST_ASSERT_GREATER_OR_EQUAL(70, apex::kFocusFruitBounds.height);
}

void test_focus_fruit_regions_do_not_overlap() {
  TEST_ASSERT_FALSE(apex::intersects(apex::kFocusTopBounds,
                                     apex::kFocusFruitBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kFocusTopBounds,
                                     apex::kFocusMetricBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kFocusFruitBounds,
                                     apex::kFocusMetricBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kFocusMetricBounds,
                                     apex::kFocusFooterBounds));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_focus_fruit_regions_fill_landscape_safe_area);
  RUN_TEST(test_focus_fruit_regions_do_not_overlap);
  return UNITY_END();
}
