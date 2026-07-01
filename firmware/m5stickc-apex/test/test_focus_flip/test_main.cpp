#include <unity.h>

#include "focus_flip_detector.h"

void test_flip_detector_debounces_face_down_and_face_up() {
  apex::FocusFlipDetector detector;

  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.0f, 0.0f, -0.91f, 100));
  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.0f, 0.0f, -0.92f, 350));
  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::FaceDown,
                    detector.update(0.0f, 0.0f, -0.93f, 401));
  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.0f, 0.0f, -0.94f, 900));

  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.0f, 0.0f, 0.91f, 1000));
  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::FaceUp,
                    detector.update(0.0f, 0.0f, 0.93f, 1351));
}

void test_flip_detector_ignores_sideways_motion() {
  apex::FocusFlipDetector detector;

  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.80f, 0.0f, -0.45f, 100));
  TEST_ASSERT_EQUAL(apex::FocusFlipEvent::None,
                    detector.update(0.82f, 0.0f, -0.42f, 500));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_flip_detector_debounces_face_down_and_face_up);
  RUN_TEST(test_flip_detector_ignores_sideways_motion);
  return UNITY_END();
}
