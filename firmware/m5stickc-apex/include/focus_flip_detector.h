#pragma once

#include <stdint.h>

namespace apex {

enum class FocusFlipEvent : uint8_t {
  None,
  FaceUp,
  FaceDown,
};

class FocusFlipDetector {
 public:
  FocusFlipEvent update(float ax, float ay, float az, uint32_t nowMs);
  void reset();

 private:
  enum class Pose : uint8_t {
    Unknown,
    FaceUp,
    FaceDown,
  };

  static constexpr uint32_t kDebounceMs = 300;

  Pose stablePose_ = Pose::Unknown;
  Pose candidatePose_ = Pose::Unknown;
  uint32_t candidateSinceMs_ = 0;

  static Pose classify(float ax, float ay, float az);
};

}  // namespace apex
