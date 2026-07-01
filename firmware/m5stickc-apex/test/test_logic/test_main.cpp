#include <unity.h>

#include "finish_work_logic.h"

using apex::CalendarDate;
using apex::WorkState;

void test_gregorian_dates_and_leap_years() {
  TEST_ASSERT_TRUE(apex::isLeapYear(2000));
  TEST_ASSERT_FALSE(apex::isLeapYear(2100));
  TEST_ASSERT_TRUE(apex::isValidDate({2024, 2, 29}));
  TEST_ASSERT_FALSE(apex::isValidDate({2025, 2, 29}));
  TEST_ASSERT_EQUAL_INT64(1,
      apex::daysFromCivil({2024, 3, 1}) - apex::daysFromCivil({2024, 2, 29}));
}

void test_workday_states_and_progress() {
  auto before = apex::calculateWorkday(8 * 3600, 9 * 60, 17 * 60);
  TEST_ASSERT_EQUAL(static_cast<int>(WorkState::BeforeWork),
                    static_cast<int>(before.state));
  TEST_ASSERT_EQUAL_INT32(3600, before.secondsToBoundary);
  TEST_ASSERT_EQUAL_UINT16(0, before.progressPermille);

  auto working = apex::calculateWorkday(13 * 3600, 9 * 60, 17 * 60);
  TEST_ASSERT_EQUAL(static_cast<int>(WorkState::Working),
                    static_cast<int>(working.state));
  TEST_ASSERT_EQUAL_INT32(4 * 3600, working.secondsToBoundary);
  TEST_ASSERT_EQUAL_UINT16(500, working.progressPermille);

  auto overtime = apex::calculateWorkday(17 * 3600 + 15 * 60,
                                         9 * 60, 17 * 60);
  TEST_ASSERT_EQUAL(static_cast<int>(WorkState::OffDuty),
                    static_cast<int>(overtime.state));
  TEST_ASSERT_EQUAL_INT32(15 * 60, overtime.secondsToBoundary);
  TEST_ASSERT_EQUAL_UINT16(1000, overtime.progressPermille);
}

void test_retirement_defaults_and_february_clamp() {
  auto status = apex::calculateRetirement(
      {2026, 7, 1}, {1990, 1, 1}, 55);
  TEST_ASSERT_TRUE(status.valid);
  TEST_ASSERT_EQUAL_INT(2045, status.retirementDate.year);
  TEST_ASSERT_EQUAL_INT(42, status.careerProgressPermille / 10);
  TEST_ASSERT_GREATER_THAN_INT32(6700, status.remainingDays);
  TEST_ASSERT_LESS_THAN_INT32(6800, status.remainingDays);

  auto leapBirthday = apex::calculateRetirement(
      {2026, 1, 1}, {2000, 2, 29}, 55);
  TEST_ASSERT_TRUE(leapBirthday.valid);
  TEST_ASSERT_EQUAL_INT(2055, leapBirthday.retirementDate.year);
  TEST_ASSERT_EQUAL_INT(2, leapBirthday.retirementDate.month);
  TEST_ASSERT_EQUAL_INT(28, leapBirthday.retirementDate.day);
}

void test_salary_boundaries_and_overtime_loss() {
  const apex::SalarySettings settings{600000, 9 * 60, 17 * 60};

  const auto before = apex::calculateLiveSalary(settings, 8 * 3600 + 59 * 60 + 59);
  TEST_ASSERT_TRUE(before.valid);
  TEST_ASSERT_EQUAL_INT64(0, before.earnedMilliCents);
  TEST_ASSERT_EQUAL_INT64(0, before.lossMilliCents);

  const auto halfway = apex::calculateLiveSalary(settings, 13 * 3600);
  TEST_ASSERT_EQUAL(static_cast<int>(WorkState::Working),
                    static_cast<int>(halfway.state));
  TEST_ASSERT_INT64_WITHIN(1, 13636363, halfway.earnedMilliCents);
  TEST_ASSERT_EQUAL_INT64(halfway.earnedMilliCents,
                          halfway.netMilliCents);

  const auto boundary = apex::calculateLiveSalary(settings, 17 * 3600);
  TEST_ASSERT_EQUAL(static_cast<int>(WorkState::OffDuty),
                    static_cast<int>(boundary.state));
  TEST_ASSERT_INT64_WITHIN(1, 27272727, boundary.earnedMilliCents);
  TEST_ASSERT_EQUAL_INT64(0, boundary.lossMilliCents);

  const auto overtime = apex::calculateLiveSalary(settings, 17 * 3600 + 60);
  TEST_ASSERT_GREATER_THAN_INT64(0, overtime.lossMilliCents);
  TEST_ASSERT_EQUAL_INT64(overtime.earnedMilliCents - overtime.lossMilliCents,
                          overtime.netMilliCents);
}

void test_salary_rejects_invalid_settings_and_day_keys_are_monotonic() {
  TEST_ASSERT_FALSE(apex::calculateLiveSalary({99900, 9 * 60, 17 * 60},
                                               12 * 3600).valid);
  TEST_ASSERT_FALSE(apex::calculateLiveSalary({600000, 17 * 60, 9 * 60},
                                               12 * 3600).valid);
  TEST_ASSERT_EQUAL_INT32(1,
      apex::calendarDayKey({2024, 2, 29}) - apex::calendarDayKey({2024, 2, 28}));
  TEST_ASSERT_EQUAL_INT32(1,
      apex::calendarDayKey({2025, 1, 1}) - apex::calendarDayKey({2024, 12, 31}));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_gregorian_dates_and_leap_years);
  RUN_TEST(test_workday_states_and_progress);
  RUN_TEST(test_retirement_defaults_and_february_clamp);
  RUN_TEST(test_salary_boundaries_and_overtime_loss);
  RUN_TEST(test_salary_rejects_invalid_settings_and_day_keys_are_monotonic);
  return UNITY_END();
}
