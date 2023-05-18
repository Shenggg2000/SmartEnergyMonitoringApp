import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const Icon = (props) => {
  const sizeTable = {
    small: {
      width: 32,
      height: 32,
      borderRadius: 8,
      size: 14
    },
    medium: {
      width: 42,
      height: 42,
      borderRadius: 16,
      size: 18
    },
    large: {
      width: 64,
      height: 64,
      borderRadius: 16,
      size: 24
    }
  }
  let width, height, borderRadius, size = null;
  if (props.size == "small") {
    width = sizeTable.small.width;
    height = sizeTable.small.height;
    borderRadius = sizeTable.small.borderRadius;
    size = sizeTable.small.size;
  }else if (props.size == "medium") {
    width = sizeTable.medium.width;
    height = sizeTable.medium.height;
    borderRadius = sizeTable.medium.borderRadius;
    size = sizeTable.medium.size;
  }else if (props.size == "large") {
    width = sizeTable.large.width;
    height = sizeTable.large.height;
    borderRadius = sizeTable.large.borderRadius;
    size = sizeTable.large.size;
  }

  return (
    <View style={[
      styles.iconWrapper,
      props.bgColor,
      {
        width: width,
        height: height,
        borderRadius: borderRadius,
      }
    ]}>
      <FontAwesomeIcon icon={props.icon} color={props.iconColor} size={size} />
    </View>
  );
};

export default Icon;

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center"
  }
})