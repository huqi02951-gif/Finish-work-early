#include "app_launcher.h"

namespace apex {

LauncherDecision AppLauncher::handleButton(ButtonEvent event) {
  if (!started_) {
    if (event == ButtonEvent::M5Click) {
      started_ = true;
      return {LauncherAction::ForwardToApp, activeApp_};
    }
    return {LauncherAction::None, activeApp_};
  }

  if (event == ButtonEvent::BClick) {
    nextApp();
    return {LauncherAction::SwitchedApp, activeApp_};
  }
  if (event == ButtonEvent::BHold) {
    return {LauncherAction::MenuRequested, activeApp_};
  }

  return {LauncherAction::ForwardToApp, activeApp_};
}

void AppLauncher::nextApp() {
  activeApp_ = activeApp_ == AppId::FinishWork ? AppId::FocusFruit
                                                : AppId::FinishWork;
}

const char* appIdName(AppId app) {
  switch (app) {
    case AppId::FinishWork:
      return "finish_work";
    case AppId::FocusFruit:
      return "focus_fruit";
  }
  return "unknown";
}

}  // namespace apex
