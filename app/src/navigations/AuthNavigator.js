import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { getHeaderTitle } from '@react-navigation/elements';
import { Icon } from '../components/Icon';

import { createStackNavigator } from '@react-navigation/stack';

import { ROUTES } from '../routes'
import { COLORS, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS } from '../constants';
import { Login, ForgotPassword, Register, Welcome1, Welcome4, Welcome3, Welcome2, OneTimePassword, VerifyEmail } from '../screens';
import BottomTabNavigator from './BottomTabNavigator';

import AuthToken from '../helper/auth-token';
import FirstTimer from "../helper/first-timer";

const authToken = new AuthToken();
const firstTimerHelper = new FirstTimer();

const Stack = createStackNavigator();

function AuthNavigator() {
  const [token, setToken] = React.useState("")
  const [initialRoute, setInitialRoute] = React.useState("")
  const [statusKeyLoaded, setStatusKeyLoaded] = React.useState(false)

  const init = async () => {
    const auth_token = await authToken.getToken();
    const first_timer = await firstTimerHelper.getToken();
    if (first_timer == null) {
      setInitialRoute(ROUTES.WELCOME_1);
    }else{
      if(auth_token){
        setInitialRoute(ROUTES.HOME);
      }else{
        setInitialRoute(ROUTES.LOGIN);
      }
    }
    setToken(auth_token);
    setStatusKeyLoaded(true)
  }

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      {statusKeyLoaded && (
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: {
              height: 58,
              paddingTop: 16,
              shadowColor: "#FFF",
              backgroundColor: COLORS.white,
              position: "relative",
              justifyContent: "center"
            },
            header: ({ navigation, route, options, back }) => {
              const title = getHeaderTitle(options, route.name);
              return (
                <View style={options.headerStyle} >
                  {
                    back ?
                      <TouchableWithoutFeedback onPress={navigation.goBack}>
                        <View style={styles.back}>
                          <Icon icon="chevron-left" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                        </View>
                      </TouchableWithoutFeedback>
                      :
                      undefined
                  }
                  <Text style={[TYPOGRAPHY.h3, FONT_COLORS.secondary, styles.title]}>{title}</Text>
                  {
                    route.params?.needSave ?
                      <TouchableWithoutFeedback onPress={save}>
                        <View style={styles.save}>
                          <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                        </View>
                      </TouchableWithoutFeedback>
                      :
                      undefined
                  }
                </View>
              );
            }
          }}
        >
          <Stack.Screen name={ROUTES.WELCOME_1} component={Welcome1} options={{ headerShown: false }} />
          <Stack.Screen name={ROUTES.WELCOME_2} component={Welcome2} options={{ headerShown: false }} />
          <Stack.Screen name={ROUTES.WELCOME_3} component={Welcome3} options={{ headerShown: false }} />
          <Stack.Screen name={ROUTES.WELCOME_4} component={Welcome4} options={{ headerShown: false }} />
          <Stack.Screen name={ROUTES.LOGIN} component={Login} options={{ headerShown: false }} />
          <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPassword} options={({ route }) => ({
            title: "",
          })} />
          <Stack.Screen name={ROUTES.REGISTER} component={Register} options={() => ({
            title: "",
          })} />
          <Stack.Screen name={ROUTES.ONE_TIME_PASSWORD} component={OneTimePassword} options={() => ({
            title: "",
          })} />
          <Stack.Screen name={ROUTES.VERIFY_EMAIL} component={VerifyEmail} options={() => ({
            title: "",
          })} />
          <Stack.Screen name={ROUTES.HOME} component={BottomTabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </>
  );
}

export default AuthNavigator;

const styles = StyleSheet.create({
  title: {
    width: "100%",
    textAlign: "center",
  },
  back: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 999
  },
  save: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 999
  }
})