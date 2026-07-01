#pragma once

#include <stdint.h>

#include "app_input.h"

namespace apex {

enum class AppId : uint8_t {
  FinishWork,
  FocusFruit,
};

enum class LauncherAction : uint8_t {
  None,
  ForwardToApp,
  SwitchedApp,
  MenuRequested,
};

struct LauncherDecision {
  LauncherAction action = LauncherAction::None;
  AppId target = AppId::FinishWork;

  constexpr LauncherDecision() = default;
  constexpr LauncherDecision(LauncherAction nextAction, AppId nextTarget)
      : action(nextAction), target(nextTarget) {}
};

class AppLauncher {
 public:
  LauncherDecision handleButton(ButtonEvent event);
  AppId activeApp() const { return activeApp_; }
  bool started() const { return started_; }

 private:
  bool started_ = false;
  AppId activeApp_ = AppId::FinishWork;

  void nextApp();
};

const char* appIdName(AppId app);

}  // namespace apex
