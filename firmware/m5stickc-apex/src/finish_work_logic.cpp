#include "finish_work_logic.h"

#include <algorithm>

namespace apex {
namespace {

int clampInt(int value, int minimum, int maximum) {
  return std::max(minimum, std::min(value, maximum));
}

}  // namespace

bool isLeapYear(int year) {
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

int daysInMonth(int year, int month) {
  static constexpr int kDays[] = {31, 28, 31, 30, 31, 30,
                                  31, 31, 30, 31, 30, 31};
  if (month < 1 || month > 12) return 0;
  if (month == 2 && isLeapYear(year)) return 29;
  return kDays[month - 1];
}

bool isValidDate(const CalendarDate& date) {
  if (date.year < 1970 || date.year > 2199) return false;
  const int maxDay = daysInMonth(date.year, date.month);
  return maxDay > 0 && date.day >= 1 && date.day <= maxDay;
}

// Howard Hinnant's civil-date transform. The returned epoch is arbitrary for
// subtraction, but is aligned to Unix days for simple weekday calculation.
// Invariant: valid Gregorian dates map monotonically in O(1) time.
int64_t daysFromCivil(const CalendarDate& date) {
  int year = date.year;
  const unsigned month = static_cast<unsigned>(date.month);
  const unsigned day = static_cast<unsigned>(date.day);
  year -= month <= 2;
  const int era = (year >= 0 ? year : year - 399) / 400;
  const unsigned yearOfEra = static_cast<unsigned>(year - era * 400);
  const unsigned dayOfYear =
      (153 * (month + (month > 2 ? -3 : 9)) + 2) / 5 + day - 1;
  const unsigned dayOfEra =
      yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear;
  return era * 146097LL + static_cast<int>(dayOfEra) - 719468LL;
}

int32_t calendarDayKey(const CalendarDate& date) {
  if (!isValidDate(date)) return 0;
  return static_cast<int32_t>(daysFromCivil(date));
}

WorkdayStatus calculateWorkday(int currentSecondOfDay,
                               int workStartMinute,
                               int workEndMinute) {
  if (currentSecondOfDay < 0 || currentSecondOfDay >= 24 * 60 * 60 ||
      workStartMinute < 0 || workEndMinute > 24 * 60 ||
      workStartMinute >= workEndMinute) {
    return {WorkState::Invalid, 0, 0};
  }

  const int startSecond = workStartMinute * 60;
  const int endSecond = workEndMinute * 60;
  if (currentSecondOfDay < startSecond) {
    return {WorkState::BeforeWork, startSecond - currentSecondOfDay, 0};
  }
  if (currentSecondOfDay >= endSecond) {
    return {WorkState::OffDuty, currentSecondOfDay - endSecond, 1000};
  }

  const int elapsed = currentSecondOfDay - startSecond;
  const int duration = endSecond - startSecond;
  const uint16_t progress = static_cast<uint16_t>(
      clampInt((elapsed * 1000) / duration, 0, 1000));
  return {WorkState::Working, endSecond - currentSecondOfDay, progress};
}

RetirementStatus calculateRetirement(const CalendarDate& today,
                                     const CalendarDate& birthDate,
                                     int retirementAge,
                                     int workStartAge) {
  RetirementStatus result{};
  if (!isValidDate(today) || !isValidDate(birthDate) ||
      retirementAge <= workStartAge || retirementAge > 100 ||
      birthDate.year + retirementAge > 2199) {
    return result;
  }

  result.valid = true;
  result.retirementDate = {
      birthDate.year + retirementAge,
      birthDate.month,
      birthDate.day,
  };
  result.retirementDate.day = std::min(
      result.retirementDate.day,
      daysInMonth(result.retirementDate.year, result.retirementDate.month));

  const int64_t rawRemaining =
      daysFromCivil(result.retirementDate) - daysFromCivil(today);
  result.remainingDays =
      static_cast<int32_t>(std::max<int64_t>(0, rawRemaining));
  result.yearsLeft = static_cast<int16_t>(result.remainingDays / 365);
  result.daysLeft = static_cast<int16_t>(result.remainingDays % 365);

  int currentAge = today.year - birthDate.year;
  if (today.month < birthDate.month ||
      (today.month == birthDate.month && today.day < birthDate.day)) {
    --currentAge;
  }
  const int totalWorkYears = retirementAge - workStartAge;
  const int workedYears = clampInt(currentAge - workStartAge,
                                   0, totalWorkYears);
  result.careerProgressPermille = static_cast<uint16_t>(
      (workedYears * 1000) / totalWorkYears);
  return result;
}

SalaryStatus calculateLiveSalary(const SalarySettings& settings,
                                 int currentSecondOfDay) {
  SalaryStatus result{};
  constexpr int64_t kMinimumSalaryCents = 1000LL * 100;
  constexpr int64_t kMaximumSalaryCents = 99999LL * 100;
  if (settings.monthlySalaryCents < kMinimumSalaryCents ||
      settings.monthlySalaryCents > kMaximumSalaryCents ||
      settings.workStartMinute >= settings.workEndMinute ||
      settings.workEndMinute > 24 * 60 || currentSecondOfDay < 0 ||
      currentSecondOfDay >= 24 * 60 * 60) {
    return result;
  }

  result.valid = true;
  const int startSecond = settings.workStartMinute * 60;
  const int endSecond = settings.workEndMinute * 60;
  const int durationSecond = endSecond - startSecond;
  const int64_t dailyMilliCents = settings.monthlySalaryCents * 1000 / 22;

  if (currentSecondOfDay < startSecond) {
    result.state = WorkState::BeforeWork;
    return result;
  }

  const int earnedSecond = std::min(currentSecondOfDay, endSecond) - startSecond;
  result.earnedMilliCents =
      dailyMilliCents * earnedSecond / durationSecond;
  if (currentSecondOfDay < endSecond) {
    result.state = WorkState::Working;
  } else {
    result.state = WorkState::OffDuty;
    const int overtimeSecond = currentSecondOfDay - endSecond;
    result.lossMilliCents =
        dailyMilliCents * overtimeSecond / durationSecond;
  }
  result.netMilliCents = result.earnedMilliCents - result.lossMilliCents;
  return result;
}

}  // namespace apex
