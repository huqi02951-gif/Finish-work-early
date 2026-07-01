#pragma once

#include <stdint.h>

namespace apex {

struct CalendarDate {
  int year;
  int month;
  int day;
};

enum class WorkState : uint8_t {
  Invalid,
  BeforeWork,
  Working,
  OffDuty,
};

struct WorkdayStatus {
  WorkState state;
  int32_t secondsToBoundary;
  uint16_t progressPermille;
};

struct RetirementStatus {
  bool valid;
  CalendarDate retirementDate;
  int32_t remainingDays;
  int16_t yearsLeft;
  int16_t daysLeft;
  uint16_t careerProgressPermille;
};

struct SalarySettings {
  int64_t monthlySalaryCents;
  uint16_t workStartMinute;
  uint16_t workEndMinute;
};

struct SalaryStatus {
  bool valid;
  WorkState state;
  int64_t earnedMilliCents;
  int64_t lossMilliCents;
  int64_t netMilliCents;
};

bool isLeapYear(int year);
int daysInMonth(int year, int month);
bool isValidDate(const CalendarDate& date);
int64_t daysFromCivil(const CalendarDate& date);
int32_t calendarDayKey(const CalendarDate& date);

WorkdayStatus calculateWorkday(int currentSecondOfDay,
                               int workStartMinute,
                               int workEndMinute);

RetirementStatus calculateRetirement(const CalendarDate& today,
                                     const CalendarDate& birthDate,
                                     int retirementAge,
                                     int workStartAge = 22);

SalaryStatus calculateLiveSalary(const SalarySettings& settings,
                                 int currentSecondOfDay);

}  // namespace apex
