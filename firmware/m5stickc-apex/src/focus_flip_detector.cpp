#include "focus_flip_detector.h"

namespace apex {
namespace {

float absf(float value) {
  return value < 0.0f ? -value : value;
}

}  // namespace

FocusFlipEvent FocusFlipDetector::update(float ax, float ay, float az,
                                         uint32_t nowMs) {
  const Pose pose = classify(ax, ay, az);
  if (pose == Pose::Unknown) {
    candidatePose_ = Pose::Unknown;
    candidateSinceMs_ = 0;
    return FocusFlipEvent::None;
  }
  if (pose != candidatePose_) {
    candidatePose_ = pose;
    candidateSinceMs_ = nowMs;
    return FocusFlipEvent::None;
  }
  if (pose == stablePose_ || nowMs - candidateSinceMs_ < kDebounceMs) {
    return FocusFlipEvent::None;
  }
  stablePose_ = pose;
  return pose == Pose::FaceDown ? FocusFlipEvent::FaceDown
                                : FocusFlipEvent::FaceUp;
}

void FocusFlipDetector::reset() {
  stablePose_ = Pose::Unknown;
  candidatePose_ = Pose::Unknown;
  candidateSinceMs_ = 0;
}

FocusFlipDetector::Pose FocusFlipDetector::classify(float ax, float ay,
                                                    float az) {
  if (absf(az) < 0.75f || absf(az) < absf(ax) + 0.20f ||
      absf(az) < absf(ay) + 0.20f) {
    return Pose::Unknown;
  }
  return az < 0.0f ? Pose::FaceDown : Pose::FaceUp;
}

}  // namespace apex
