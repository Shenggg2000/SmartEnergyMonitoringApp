import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { Add, AddProperty, AddRoom, AddWallOutlet, ScanWallOutlet } from '../screens';
import { Icon } from '../components/Icon';
import { ROUTES } from '../routes'
import { COLORS, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, WINDOW_WIDTH } from '../constants';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native'

const Stack = createStackNavigator();

function AddNavigator({ navigation, route }) {
  React.useLayoutEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "Add";
    if (routeName == ROUTES.ADD) {
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

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.ADD}
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          height: 64,
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
              <Text style={[TYPOGRAPHY.h3, FONT_COLORS.secondary, styles.title]}>{route.name}</Text>
            </View>
          )
        },
      })}
    >
      <Stack.Screen name={ROUTES.ADD} component={Add} options={{ headerShown: false }} />
      <Stack.Screen name={ROUTES.ADD_PROPERTY} component={AddProperty} />
      <Stack.Screen name={ROUTES.ADD_ROOM} component={AddRoom} />
      <Stack.Screen name={ROUTES.SCAN_WALL_OUTLET} component={ScanWallOutlet} />
      <Stack.Screen name={ROUTES.ADD_WALL_OUTLET} component={AddWallOutlet} />
    </Stack.Navigator>
  );
}

export default AddNavigator;

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