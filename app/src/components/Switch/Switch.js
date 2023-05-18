import { StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from '../../constants';

const Switch = (props) => {
  const [animation, setAnimation] = useState(new Animated.Value(0))
  const [toggle, setToggle] = useState(false)

  let switchInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.gray, COLORS.secondary]
  })
  let switchControlInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 27]
  })

  const switchAnimatedStyle = {
    backgroundColor: switchInterpolation
  }
  const switchControlAnimatedStyle = {
    left: switchControlInterpolation
  }

  let onPressed = () => {
    const newState = !toggle;
    handleAnimation(newState);
    setToggle(current => !current);
    props.onChanged(!toggle);
  }

  let handleAnimation = (newState) => {
    Animated.timing(animation, {
      toValue: newState ? 1 : 0,
      duration: 150,
      useNativeDriver: false
    }).start()
  }

  React.useEffect(() => {
    setToggle(props.defaultState == 1 ? true : false);
    setAnimation(props.defaultState == 1 ? new Animated.Value(1) : new Animated.Value(0))
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onPressed}>
      <Animated.View style={{ ...styles.switch, ...switchAnimatedStyle }} >
        <Animated.View style={{ ...styles.switchControl, ...switchControlAnimatedStyle }}>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default Switch;

const styles = StyleSheet.create({
  switch: {
    width: 48,
    height: 24,
    borderRadius: 16,
    position: 'relative',
    backgroundColor: COLORS.gray,
  },
  switchActive: {
    width: 48,
    height: 24,
    borderRadius: 16,
    position: 'relative',
    backgroundColor: COLORS.secondary,
  },
  switchControl: {
    width: 18,
    height: 18,
    borderRadius: 16,
    position: 'absolute',
    backgroundColor: COLORS.white,
    top: 3,
    left: 3,
  },
  switchControlActive: {
    width: 18,
    height: 18,
    borderRadius: 16,
    position: 'absolute',
    backgroundColor: COLORS.white,
    top: 3,
    left: 27,
  },
})