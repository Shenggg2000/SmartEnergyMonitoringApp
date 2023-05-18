import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { WELCOME4 } from '../../../assets/images';
import { COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../routes';

const Welcome4 = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={WELCOME4} style={{ height: 250, marginVertical: 40 }} resizeMode="contain" />
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary, MARGIN.mb4, { textAlign: "center" }]}>View Energy Consumption Data</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb32, { textAlign: "center" }]}>
            The perfect way to monitor and manage your energy consumption. Our app allows you to view your energy consumption data in real-time, giving you the insight you need to make smart, informed decisions about your energy usage.
          </Text>
          <View style={styles.dotsWrapper}>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
            <View style={[styles.dot, styles.dotActive]}></View>
          </View>
        </View>
      </View>
      <View style={styles.welcomeButtonRow}>
        <TouchableWithoutFeedback onPress={() =>
          navigation.navigate(ROUTES.LOGIN)
        }>
          <View style={[styles.welcomeButton, BACKGROUND_COLORS.secondary]}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.lightGray]}>Get Started</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
};

export default Welcome4;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 32,
    padding: 16,
  },
  dotsWrapper: {
    width: 64,
    height: 10,
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray
  },
  dotActive: {
    backgroundColor: COLORS.secondary
  },
  welcomeButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    position: "absolute",
    bottom: 16,
    left: 16,
  },
  welcomeButton: {
    borderRadius: 16,
    width: WINDOW_WIDTH - 32,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: "center"
  },
})