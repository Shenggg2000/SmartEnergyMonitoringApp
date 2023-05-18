import React from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, Image, TouchableWithoutFeedback } from 'react-native';
import { ROUTES } from '../../routes';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { LOGO } from '../../../assets/images';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import axios from 'axios';
import MessagingToken from '../../helper/messaging-token';
import AuthToken from '../../helper/auth-token';
import FirstTimer from "../../helper/first-timer";

const messagingToken = new MessagingToken();
const authToken = new AuthToken();
const firstTimerHelper = new FirstTimer();

const Login = () => {
  const navigation = useNavigation();

  const [submitTry, setSubmitTry] = React.useState(false);
  const [loginFail, setLoginFail] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [securePassword, setSecurePassword] = React.useState(true);

  onSignIn = async () => {
    setSubmitTry(true);

    if (email && password) {
      let messaging_token = await messagingToken.getToken();
      let result = await axios.post('http://10.0.2.2:5000/api/auth/login', { email, password, messaging_token });
      let response = result.data;

      if (response.error) {
        setLoginFail(true);
      } else {
        setLoginFail(false);
        if (response.data.verifiedEmail == null) {
          navigation.navigate(ROUTES.VERIFY_EMAIL, { email, token: response.data.token });
        } else {
          await authToken.saveToken(response.data.token);
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.HOME }],
          });
        }
      }
    }
  }

  let init = async () => {
    await firstTimerHelper.saveToken("Check");
  }

  React.useEffect(() => {
    init();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={styles.logoArea}>
          <Image source={LOGO} style={styles.logo} />
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, { textAlign: "center" }]}>Smart Energy Monitoring </Text>
        </View>
        <View style={{ marginBottom: 64 }}>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Welcome,</Text>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Sign In to Continue</Text>
        </View>
        <View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Email</Text>
            <View style={styles.textInput}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Enter email"
                onChangeText={email => {
                  setEmail(email);
                  setSubmitTry(false);
                }}
                defaultValue={email} />
            </View>
            {
              submitTry && !email &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter email</Text>
            }
          </View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Password</Text>
            <View style={[styles.textInput, styles.textInputPassword]}>
              <TextInput
                style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                placeholder="Enter password"
                secureTextEntry={securePassword}
                onChangeText={password => {
                  setPassword(password)
                  setSubmitTry(false)
                }}
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
            {
              submitTry && loginFail &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Incorrect email or password</Text>
            }
          </View>
          <View>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.FORGOT_PASSWORD)
            }>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.info, { textAlign: "center", textDecorationLine: 'underline' }]}>Forgot Password?</Text>
            </TouchableWithoutFeedback>
          </View>
          <View style={[styles.buttonArea, MARGIN.mb16]}>
            <TouchableWithoutFeedback onPress={() =>
              onSignIn()
            }>
              <View style={[styles.button, BACKGROUND_COLORS.secondary]}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.lightGray]}>Sign In</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.linkArea}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mr4]}>New to Application?</Text>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.REGISTER)
            }>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.info, { textDecorationLine: 'underline' }]}>Sign Up</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 32,
    padding: 16,
  },
  logoArea: {
    paddingVertical: 80,
    alignItems: "center",
  },
  logo: {
    marginBottom: 12,
    width: 32,
    height: 32
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
  }
});