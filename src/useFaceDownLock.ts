import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const SENSOR_UPDATE_INTERVAL = 100;
const ORIENTATION_CONFIRMATION_TIME = 400;
const FACE_DOWN_THRESHOLD = -0.82;
const FACE_UP_THRESHOLD = 0.65;

type OrientationCandidate = {
  faceDown: boolean;
  detectedAt: number;
} | null;

/**
 * Locks only after the phone remains face down for a short period and unlocks
 * only after it is clearly face up again. The separate thresholds prevent the
 * state from flickering while the phone is moving or resting at an angle.
 */
export function useFaceDownLock() {
  const [isFaceDown, setIsFaceDown] = useState(false);
  const currentState = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let isMounted = true;
    let candidate: OrientationCandidate = null;
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    function commitOrientation(faceDown: boolean) {
      currentState.current = faceDown;
      candidate = null;
      if (isMounted) setIsFaceDown(faceDown);
    }

    function readOrientation(z: number) {
      // Expo forwards the native sensor axes. A face-up iPhone reports the
      // inverse Z direction of Android, so both are normalized here.
      const normalizedZ = Platform.OS === 'ios' ? -z : z;
      const nextState =
        normalizedZ <= FACE_DOWN_THRESHOLD ? true : normalizedZ >= FACE_UP_THRESHOLD ? false : null;

      if (nextState === null || nextState === currentState.current) {
        candidate = null;
        return;
      }

      const now = Date.now();
      if (candidate?.faceDown !== nextState) {
        candidate = { faceDown: nextState, detectedAt: now };
        return;
      }

      if (now - candidate.detectedAt >= ORIENTATION_CONFIRMATION_TIME) {
        commitOrientation(nextState);
      }
    }

    async function startMonitoring() {
      if (!(await Accelerometer.isAvailableAsync()) || !isMounted) return;

      const currentPermission = await Accelerometer.getPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Accelerometer.requestPermissionsAsync();

      if (!permission.granted || !isMounted) return;

      Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
      subscription = Accelerometer.addListener(({ z }) => readOrientation(z));
    }

    startMonitoring().catch(() => {
      // If the sensor is unavailable or permission is denied, the calculator
      // stays unlocked and continues to work normally.
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return isFaceDown;
}
