import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { Notification, NotificationDetail } from '../screens';
import { Icon } from '../components/Icon';
import { ROUTES } from '../routes'
import { COLORS, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS } from '../constants';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'

const Stack = createStackNavigator();

function NotificationNavigator({ navigation, route }) {
  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Notification";
    if (routeName == ROUTES.NOTIFICATION) {
      navigation.setOptions({
        tabBarStyle: {
          display: 'flex',
          height: 56,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTopWidth: 0,
          borderTopColor: "#FFFFFF",
          paddingHorizontal: 4,
          position: "absolute"
        },
        headerShown: true,
      });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'none' }, headerShown: false });
    }
  }, [navigation, route]);

  const save = () => {
    console.log(123);
  }

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.NOTIFICATION}
      screenOptions={{
        headerStyle: {
          height: 64,
          paddingTop: 16,
          paddingBottom: 6,
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
      <Stack.Screen name={ROUTES.NOTIFICATION} component={Notification} options={{ headerShown: false }} />
      <Stack.Screen name={ROUTES.NOTIFICATION_DETAIL} component={NotificationDetail} options={({ route }) => ({
        title: route.params.notificationName,
      })} />
    </Stack.Navigator>
  );
}

export default NotificationNavigator;

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