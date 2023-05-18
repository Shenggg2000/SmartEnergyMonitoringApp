import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { WELCOME3 } from '../../../assets/images';
import { COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../routes';

const Welcome3 = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={WELCOME3} style={{ height: 250, marginVertical: 40 }} resizeMode="contain" />
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary, MARGIN.mb4, { textAlign: "center" }]}>Control Your Smart Wall Outlets with Voice</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb32, { textAlign: "center" }]}>
            The perfect way to manage your electrical devices without even lifting a finger. Connect your smart wall outlets to your voice assistant, making it easy to control your devices
          </Text>
          <View style={styles.dotsWrapper}>
            <View style={styles.dot}></View>
            <View style={styles.dot}></View>
            <View style={[styles.dot, styles.dotActive]}></View>
            <View style={styles.dot}></View>
          </View>
        </View>
      </View>
      <View style={styles.welcomeButtonRow}>
        <TouchableWithoutFeedback onPress={() =>
          navigation.navigate(ROUTES.WELCOME_2)
        }>
          <View style={[styles.welcomeButton, BACKGROUND_COLORS.lightGray]}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>Back</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() =>
          navigation.navigate(ROUTES.WELCOME_4)
        }>
          <View style={[styles.welcomeButton, BACKGROUND_COLORS.secondary]}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.lightGray]}>Next</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </SafeAreaView>
  );
};

export default Welcome3;

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
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
    alignItems: "center"
  },
})