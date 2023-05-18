import React from 'react';
import { ROUTES } from '../../routes';
import { SafeAreaView, StyleSheet, Text, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import MessagingToken from '../../helper/messaging-token';

const messagingToken = new MessagingToken();

const Register = () => {
  const navigation = useNavigation();
  const [submitTry, setSubmitTry] = React.useState(false);
  const [emailTaken, setEmailTaken] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [securePassword, setSecurePassword] = React.useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = React.useState(true);

  onSignUp = async () => {
    setSubmitTry(true);

    const samePassword = password === confirmPassword;
    if (username && email && password && confirmPassword && samePassword) {
      let messaging_token = await messagingToken.getToken();
      let result = await axios.post('http://10.0.2.2:5000/api/auth/register', { username, email, password, messaging_token });
      let response = result.data;

      if (response.error) {
        if (response.errorMessage == "Email was taken.") {
          setEmailTaken(true);
        }
      } else {
        navigation.navigate(ROUTES.VERIFY_EMAIL, { email, token: response.data.token });
      }
    }
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Create Your Account</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Let’s get started to enjoy smart wall outlets control with our app</Text>
        </View>
        <View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Username</Text>
            <View style={styles.textInput}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Enter your username"
                onChangeText={username => setUsername(username)}
                defaultValue={username} />
            </View>
            {
              submitTry && !username &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter username</Text>
            }
          </View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Email</Text>
            <View style={styles.textInput}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Enter your email address"
                onChangeText={email => {
                  setEmail(email);
                  setEmailTaken(false);
                }}
                defaultValue={email} />
            </View>
            {
              submitTry && !email &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter email</Text>
            }
            {
              submitTry && emailTaken &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>This email was taken</Text>
            }
          </View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Password</Text>
            <View style={[styles.textInput, styles.textInputPassword]}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Enter your password"
                secureTextEntry={securePassword}
                onChangeText={password => setPassword(password)}
                defaultValue={password} />
              <View style={styles.inputTextPasswordIcon}>
                <TouchableWithoutFeedback onPress={() =>
                  setSecurePassword(curr => !curr)
                }>
                  <View>
                    <FontAwesomeIcon icon={securePassword ? "eye-slash" : "eye"} color={COLORS.secondary} size={14} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            {
              submitTry && !password &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter password</Text>
            }
          </View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Confirm Password</Text>
            <View style={[styles.textInput, styles.textInputPassword]}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Re-enter your password"
                secureTextEntry={secureConfirmPassword}
                onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
                defaultValue={confirmPassword} />
              <View style={styles.inputTextPasswordIcon}>
                <TouchableWithoutFeedback onPress={() =>
                  setSecureConfirmPassword(curr => !curr)
                }>
                  <View>
                    <FontAwesomeIcon icon={secureConfirmPassword ? "eye-slash" : "eye"} color={COLORS.secondary} size={14} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            {
              submitTry && !confirmPassword &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please confirm password.</Text>
            }
            {
              submitTry && password && password !== confirmPassword &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Password was not same.</Text>
            }
          </View>
        </View>
        <View>
          <View style={[styles.buttonArea, MARGIN.mb16]}>
            <TouchableWithoutFeedback onPress={() =>
              onSignUp()
            }>
              <View style={[styles.button, BACKGROUND_COLORS.secondary]}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.lightGray]}>Sign Up</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.linkArea}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mr4]}>Join Us Before?</Text>
            <TouchableWithoutFeedback onPress={() =>
              navigation.goBack()
            }>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.info, { textDecorationLine: 'underline' }]}>Sign In</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Register;

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
  textInputPassword: {
    position: "relative",
  },
  inputTextPasswordIcon: {
    position: "absolute",
    right: 8,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    width: 42,
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
  linkArea: {
    flexDirection: "row",
    justifyContent: "center"
  },
});