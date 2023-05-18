import React from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { getHeaderTitle } from '@react-navigation/elements';
import { Icon } from '../components/Icon';

import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, Property, PropertyEdit, Room, RoomEdit, WallOutlet, Countdown, Alert, Profile, EditProfile, Security, Schedule } from '../screens';

import { ROUTES } from '../routes'
import { COLORS, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, WINDOW_WIDTH } from '../constants';

const Stack = createStackNavigator();

function HomeNavigator({ navigation, route }) {
  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";
    if (routeName == ROUTES.HOME) {
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
        }
      });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [navigation, route]);

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          height: 58,
          shadowColor: "#FFF",
          backgroundColor: COLORS.white,
        },
        headerLeft: () => {
          return (
            <TouchableWithoutFeedback onPress={navigation.goBack}>
              <View style={styles.back}>
                <Icon icon="chevron-left" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
              </View>
            </TouchableWithoutFeedback>
          )
        },
        headerTitle: () => {
          return (
            <View>
              <Text style={[TYPOGRAPHY.h3, FONT_COLORS.secondary, styles.title]}>{route.params.titleName ? route.params.titleName: route.name}</Text>
            </View>
          )
        },
      })}
    >
      <Stack.Screen name={ROUTES.HOME} component={Home} options={{ headerShown: false }} />
      <Stack.Screen name={ROUTES.PROPERTY} component={Property} options={({ route }) => ({
        title: route.params.propertyName,
      })} />
      <Stack.Screen name={ROUTES.PROPERTY_EDIT} component={PropertyEdit} options={({ route }) => ({
        title: route.params.propertyName,
      })} />
      <Stack.Screen name={ROUTES.ROOM} component={Room} options={({ route }) => ({
        title: route.params.roomName,
      })} />
      <Stack.Screen name={ROUTES.ROOM_EDIT} component={RoomEdit} options={({ route }) => ({
        title: route.params.roomName,
      })} />
      <Stack.Screen name={ROUTES.WALL_OUTLET} component={WallOutlet} options={({ route }) => ({
        title: route.params.wallOutletName,
      })} />
      <Stack.Screen name={ROUTES.COUNTDOWN} component={Countdown} />
      <Stack.Screen name={ROUTES.SCHEDULE} component={Schedule} />
      <Stack.Screen name={ROUTES.ALERT} component={Alert} />
      <Stack.Screen name={ROUTES.PROFILE} component={Profile} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfile} />
      <Stack.Screen name={ROUTES.SECURITY} component={Security} />
    </Stack.Navigator>
  );
}

export default HomeNavigator;

const styles = StyleSheet.create({
  title: {
    paddingTop: 20,
    width: WINDOW_WIDTH - 32 - 42 - 42,
    textAlign: "center",
  },
  back: {
    left: 16,
    top: 8,
    zIndex: 999
  },
})