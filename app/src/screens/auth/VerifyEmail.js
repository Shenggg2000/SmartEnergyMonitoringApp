import React from 'react';
import { ROUTES } from '../../routes';
import { SafeAreaView, StyleSheet, Text, View, TouchableWithoutFeedback, Image } from 'react-native';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { ONE_TIME_PASSWORD } from '../../../assets/images';
import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const VerifyEmail = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [resended, setResended] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);
  const [intervalObject, setIntervalObject] = React.useState(60);

  onResendPressed = async () => {
    let result = await axios.post('http://10.0.2.2:5000/api/auth/send-verify-email', { email: route.params.email });
    let response = result.data;

    if (response.error) {

    } else {
      setResended(true);
      setCountdown(60);
      let interval = setInterval(() => {
        setCountdown((curr) => {
          if (curr == 0) {
            setResended(false);
            clearInterval(interval);
            return 60;
          }
          return --curr;
        });
      }, 1000)
    }
  }

  detectEmailVerifyStatus = () => {
    let myInterval = setInterval(async() => {
      let result = await axios.post('http://10.0.2.2:5000/api/auth/is-verified', { email: route.params.email });
      let response = result.data;

      if (!response.error) {
        console.log(response.data.email_verified_at);
        if(response.data.email_verified_at != null){
          await authToken.saveToken(route.params.token);
          clearInterval(myInterval)
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.HOME }],
          });
        }
      }
    }, 5000);
    setIntervalObject(myInterval);
  }

  React.useEffect(() => {
    detectEmailVerifyStatus();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={{ alignItems: "center" }}>
          <Image source={ONE_TIME_PASSWORD} style={{ height: 260 }} resizeMode="contain" />
        </View>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Verify Email Address</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>A confirmation email has been sent to</Text>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>{route.params.email}</Text>
        </View>
        <View>
          <View style={[styles.buttonArea, MARGIN.mb12]}>
            <TouchableWithoutFeedback disabled={resended} onPress={() =>
              onResendPressed()
            }>
              <View style={[styles.button, resended ? BACKGROUND_COLORS.gray : BACKGROUND_COLORS.secondary]}>
                <Text style={[TYPOGRAPHY.h6, resended ? FONT_COLORS.secondary : FONT_COLORS.lightGray]}>Re-send</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          {
            resended &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, { textAlign: "center" }]}>Email sent. Please wait for {countdown} to try again.</Text>
          }
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyEmail;

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
  buttonArea: {
    marginTop: 24
  },
  button: {
    borderRadius: 16,
    width: WINDOW_WIDTH - 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center"
  },
}); 