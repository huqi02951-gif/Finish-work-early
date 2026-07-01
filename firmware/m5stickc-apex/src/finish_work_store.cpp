#include "finish_work_store.h"

namespace apex {

bool validSettings(const FinishSettings& settings) {
  return settings.monthlySalaryCents >= 100000 &&
         settings.monthlySalaryCents <= 9999900 &&
         settings.workStartMinute < settings.workEndMinute &&
         settings.workEndMinute <= 24 * 60 &&
         settings.birthYear >= 1950 && settings.birthYear <= 2020 &&
         settings.retirementAge >= 40 && settings.retirementAge <= 80;
}

void FinishWorkStore::load(FinishSettings& settings,
                           SettlementSnapshot& settlement) {
  preferences_.begin(kNamespace, false);
  if (preferences_.getUChar("version", 0) == kVersion) {
    FinishSettings loaded;
    loaded.monthlySalaryCents = preferences_.getInt("salary", 600000);
    loaded.workStartMinute = preferences_.getUShort("start", 9 * 60);
    loaded.workEndMinute = preferences_.getUShort("end", 17 * 60);
    loaded.birthYear = preferences_.getUShort("birth", 1990);
    loaded.retirementAge = preferences_.getUChar("retire", 55);
    if (validSettings(loaded)) settings = loaded;

    settlement.settled = preferences_.getBool("done", false);
    settlement.dayKey = preferences_.getInt("day", 0);
    settlement.settledSecond = preferences_.getUInt("clockoff", 0);
    settlement.earnedMilliCents = preferences_.getLong64("earned", 0);
    settlement.lossMilliCents = preferences_.getLong64("loss", 0);
    settlement.netMilliCents = preferences_.getLong64("net", 0);
  } else {
    preferences_.clear();
    preferences_.putUChar("version", kVersion);
  }
  preferences_.end();
}

void FinishWorkStore::saveSettings(const FinishSettings& settings) {
  if (!validSettings(settings)) return;
  preferences_.begin(kNamespace, false);
  preferences_.putUChar("version", kVersion);
  preferences_.putInt("salary", settings.monthlySalaryCents);
  preferences_.putUShort("start", settings.workStartMinute);
  preferences_.putUShort("end", settings.workEndMinute);
  preferences_.putUShort("birth", settings.birthYear);
  preferences_.putUChar("retire", settings.retirementAge);
  preferences_.end();
}

void FinishWorkStore::saveSettlement(
    const SettlementSnapshot& settlement) {
  preferences_.begin(kNamespace, false);
  preferences_.putBool("done", settlement.settled);
  preferences_.putInt("day", settlement.dayKey);
  preferences_.putUInt("clockoff", settlement.settledSecond);
  preferences_.putLong64("earned", settlement.earnedMilliCents);
  preferences_.putLong64("loss", settlement.lossMilliCents);
  preferences_.putLong64("net", settlement.netMilliCents);
  preferences_.end();
}

void FinishWorkStore::clearSettlement() {
  preferences_.begin(kNamespace, false);
  preferences_.putBool("done", false);
  preferences_.putInt("day", 0);
  preferences_.remove("clockoff");
  preferences_.remove("earned");
  preferences_.remove("loss");
  preferences_.remove("net");
  preferences_.end();
}

}  // namespace apex
