import React from 'react';
import { ROUTES } from '../../routes';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Image } from 'react-native';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { ONE_TIME_PASSWORD } from '../../../assets/images';

const OneTimePassword = () => {
  const navigation = useNavigation();
  const [number1, onChangeNumber1] = React.useState('');
  const [number2, onChangeNumber2] = React.useState('');
  const [number3, onChangeNumber3] = React.useState('');
  const [number4, onChangeNumber4] = React.useState('');
  const input1 = React.useRef(null);
  const input2 = React.useRef(null);
  const input3 = React.useRef(null);
  const input4 = React.useRef(null);


  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={ONE_TIME_PASSWORD} style={{ height: 260 }} resizeMode="contain" />
        </View>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Enter OTP</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>A 4 digit code has been sent to</Text>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>gohyoushengabc@gmail.com</Text>
        </View>
        <View style={[styles.otpBox, MARGIN.mb16]}>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              onChangeText={text => {
                if (text.length > 1) {
                  return
                } else if (text.length > 0) {
                  onChangeNumber1(text);
                  input1.current.blur();
                  input2.current.focus();
                } else if (text.length == 0) {
                  onChangeNumber1('');
                }
              }}
              value={number1}
              keyboardType="numeric"
              ref={input1} />
          </View>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              onChangeText={text => {
                if (text.length > 1) {
                  return
                } else if (text.length > 0) {
                  onChangeNumber2(text);
                  input2.current.blur();
                  input3.current.focus();
                } else if (text.length == 0) {
                  onChangeNumber2('');
                  input2.current.blur();
                  input1.current.focus();
                }
              }}
              value={number2}
              keyboardType="numeric"
              ref={input2} />
          </View>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              onChangeText={text => {
                if (text.length > 1) {
                  return
                } else if (text.length > 0) {
                  onChangeNumber3(text);
                  input3.current.blur();
                  input4.current.focus();
                } else if (text.length == 0) {
                  onChangeNumber3('');
                  input3.current.blur();
                  input2.current.focus();
                }
              }}
              value={number3}
              keyboardType="numeric"
              ref={input3} />
          </View>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              onChangeText={text => {
                if (text.length > 1) {
                  return
                } else if (text.length > 0) {
                  onChangeNumber4(text);
                  input4.current.blur();
                } else if (text.length == 0) {
                  onChangeNumber4('');
                  input4.current.blur();
                  input3.current.focus();
                }
              }}
              value={number4}
              keyboardType="numeric"
              ref={input4} />
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

export default OneTimePassword;

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
  otpBox: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  textInput: {
    width: 42,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginRight: 8
  },
  input: {
    width: "100%",
    height: 42,
    padding: 0,
    textAlign: "center"
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