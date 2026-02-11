import { useCallback, useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CLOSE_DURATION = 200;

interface UseDraggableDrawerOptions {
  visible: boolean;
  drawerHeight: number;
  dragCloseThreshold?: number;
  velocityCloseThreshold?: number;
  onClose: () => void;
}

export function useDraggableDrawer({
  visible,
  drawerHeight,
  dragCloseThreshold = 80,
  velocityCloseThreshold = 0.3,
  onClose,
}: UseDraggableDrawerOptions) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  const runClose = useCallback(() => {
    dragOffset.stopAnimation();
    slideAnim.stopAnimation();
    slideAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: CLOSE_DURATION, useNativeDriver: true }),
      Animated.timing(dragOffset, { toValue: 0, duration: CLOSE_DURATION, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => finished && onClose());
  }, [slideAnim, backdropAnim, dragOffset, onClose]);

  const runCloseRef = useRef(runClose);
  runCloseRef.current = runClose;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, { dy, dx }) => Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10,
      onMoveShouldSetPanResponderCapture: (_, { dy, dx }) => Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10,
      onPanResponderGrant: () => {
        dragOffset.stopAnimation();
        slideAnim.stopAnimation();
      },
      onPanResponderMove: (_, { dy }) => {
        const clamped = Math.max(0, dy);
        dragOffset.setValue(clamped);
        backdropAnim.setValue(1 - (clamped / drawerHeight) * 0.4);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > dragCloseThreshold || vy > velocityCloseThreshold) {
          runCloseRef.current();
        } else {
          Animated.parallel([
            Animated.spring(dragOffset, { toValue: 0, useNativeDriver: true, damping: 28, stiffness: 300 }),
            Animated.timing(backdropAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      dragOffset.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 28, stiffness: 200 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const backdropOpacity = backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });

  return {
    slideAnim,
    dragOffset,
    panHandlers: panResponder.panHandlers,
    backdropOpacity,
    closeWithAnimation: runClose,
  };
}
