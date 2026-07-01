#pragma once

#include <stdint.h>

namespace apex {

enum class FinishSettingField : uint8_t {
  Salary,
  WorkStart,
  WorkEnd,
  BirthYear,
  RetirementAge,
  DateYear,
  DateMonth,
  DateDay,
  ClockHour,
  ClockMinute,
  Exit,
};

constexpr bool isExitSetting(FinishSettingField field) {
  return field == FinishSettingField::Exit;
}

constexpr uint8_t finishSettingCount() {
  return static_cast<uint8_t>(FinishSettingField::Exit) + 1;
}

constexpr FinishSettingField nextSettingField(FinishSettingField field) {
  return field == FinishSettingField::ClockMinute
             ? FinishSettingField::Exit
             : field == FinishSettingField::Exit
             ? FinishSettingField::Salary
             : static_cast<FinishSettingField>(
                   static_cast<uint8_t>(field) + 1);
}

}  // namespace apex
