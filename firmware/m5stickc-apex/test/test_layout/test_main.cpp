#include <unity.h>

#include "layout_bounds.h"

void test_all_regions_stay_inside_safe_bounds() {
  TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kTopBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kMoneyBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kPetBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kRetirementBounds));
  TEST_ASSERT_TRUE(apex::inside(apex::kSafeBounds, apex::kFooterBounds));
}

void test_regions_do_not_overlap() {
  TEST_ASSERT_FALSE(apex::intersects(apex::kMoneyBounds,
                                     apex::kPetBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kMoneyBounds,
                                     apex::kRetirementBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kPetBounds,
                                     apex::kRetirementBounds));
  TEST_ASSERT_FALSE(apex::intersects(apex::kRetirementBounds,
                                     apex::kFooterBounds));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_all_regions_stay_inside_safe_bounds);
  RUN_TEST(test_regions_do_not_overlap);
  return UNITY_END();
}
