import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Provides a subtle, native-feeling response without delaying the key action. */
export function triggerKeyHaptic() {
  const feedback =
    Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  feedback.catch(() => {
    // Haptics can be disabled by the device or unavailable on the current platform.
  });
}
