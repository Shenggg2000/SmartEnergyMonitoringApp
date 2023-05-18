import React from 'react';
import { ROUTES } from '../../routes';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Image } from 'react-native';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { FORGOT_PASSWORD } from '../../../assets/images';

const ForgotPassword = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={FORGOT_PASSWORD} style={{ height: 230 }} resizeMode="contain" />
        </View>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Forgot Password</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Don’t worry. Please enter the email address of your account</Text>
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Email</Text>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]} placeholder="Enter your email address" />
          </View>
        </View>
        <View>
          <View style={[styles.buttonArea, MARGIN.mb16]}>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.HOME)
            }>
              <View style={[styles.button, BACKGROUND_COLORS.secondary]}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.lightGray]}>Submit</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 24,
    padding: 16,
  },
  textInput: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  input: {
    width: "100%",
    height: 42,
    padding: 0,
  },
  buttonArea: {
    marginTop: 64
  },
  button: {
    borderRadius: 16,
    width: WINDOW_WIDTH - 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center"
  },
}); 