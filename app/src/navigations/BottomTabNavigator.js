import React, { useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { WithLocalSvg } from 'react-native-svg';

// Navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import HomeNavigator from './HomeNavigator';
import DataNavigator from './DataNavigator';
import AddNavigator from './AddNavigator';
import VoiceNavigator from './VoiceNavigator';
import NotificationNavigator from './NotificationNavigator';

// Constant
import { ROUTES } from '../routes';
import { COLORS, WINDOW_WIDTH, TYPOGRAPHY, FONT_COLORS } from '../constants';
import { HOME_FILL, HOME_OUTLINE, DATA_FILL, DATA_OUTLINE, ADD_FILL, ADD_OUTLINE, VOICE_FILL, VOICE_OUTLINE, NOTIFICATION_FILL, NOTIFICATION_OUTLINE } from '../../assets/icons';

const Tab = createBottomTabNavigator();

function BottomTabNavigator({ navigation, route }) {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;
  const [isHideBottomTab, setIsHideBottomTab] = useState(false);
  
  return (
    <React.Fragment>
      <Tab.Navigator screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 56,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          borderTopWidth: 0,
          borderTopColor: "#FFFFFF",
          paddingHorizontal: 4,
          position: "absolute"
        },
        headerStyle: {
          height: 58,
          paddingTop: 16,
          shadowColor: "#FFF",
          backgroundColor: COLORS.white,
          position: "relative",
          justifyContent: "center"
        },
        header: ({ route, options }) => {
          const title = getHeaderTitle(options, route.name);
          return (
            <View style={options.headerStyle} >
              <Text style={[TYPOGRAPHY.h3, FONT_COLORS.secondary, styles.title]}>{title}</Text>
            </View>
          );
        }
      })}>
        <Tab.Screen
          name={ROUTES.HOME_NAVIGATOR}
          component={HomeNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              if (focused) {
                return (
                  <View>
                    <WithLocalSvg asset={HOME_FILL} width="20" height="20" />
                  </View>
                )
              } else {
                return (
                  <View>
                    <WithLocalSvg asset={HOME_OUTLINE} width="20" height="20" />
                  </View>
                )
              }
            }
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true
              }).start();
            }
          })} />
        <Tab.Screen
          name={ROUTES.DATA_NAVIGATOR}
          component={DataNavigator}
          options={{
            headerTitle: "Summary",
            tabBarIcon: ({ focused }) => {
              if (focused) {
                return (
                  <View>
                    <WithLocalSvg asset={DATA_FILL} width="20" height="20" />
                  </View>
                )
              } else {
                return (
                  <View>
                    <WithLocalSvg asset={DATA_OUTLINE} width="20" height="20" />
                  </View>
                )
              }
            }
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: (WINDOW_WIDTH - 8) / 5,
                useNativeDriver: true
              }).start();
            }
          })} />
        <Tab.Screen
          name={ROUTES.ADD_NAVIGATOR}
          component={AddNavigator}
          options={{
            headerTitle: "Add",
            tabBarIcon: ({ focused }) => {
              if (focused) {
                return (
                  <View>
                    <WithLocalSvg asset={ADD_FILL} width="20" height="20" />
                  </View>
                )
              } else {
                return (
                  <View>
                    <WithLocalSvg asset={ADD_OUTLINE} width="20" height="20" />
                  </View>
                )
              }
            }
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: (WINDOW_WIDTH - 8) / 5 * 2,
                useNativeDriver: true
              }).start();
            }
          })} />
        <Tab.Screen
          name={ROUTES.VOICE_NAVIGATOR}
          component={VoiceNavigator}
          options={{
            headerTitle: "Voice Assistant",
            tabBarIcon: ({ focused }) => {
              if (focused) {
                return (
                  <View>
                    <WithLocalSvg asset={VOICE_FILL} width="20" height="20" />
                  </View>
                )
              } else {
                return (
                  <View>
                    <WithLocalSvg asset={VOICE_OUTLINE} width="20" height="20" />
                  </View>
                )
              }
            }
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: (WINDOW_WIDTH - 8) / 5 * 3,
                useNativeDriver: true
              }).start();
            }
          })} />
        <Tab.Screen
          name={ROUTES.NOTIFICATION_NAVIGATOR}
          component={NotificationNavigator}
          options={{
            headerTitle: "Notification",
            tabBarIcon: ({ focused }) => {
              if (focused) {
                return (
                  <View>
                    <WithLocalSvg asset={NOTIFICATION_FILL} width="20" height="20" />
                  </View>
                )
              } else {
                return (
                  <View>
                    <WithLocalSvg asset={NOTIFICATION_OUTLINE} width="20" height="20" />
                  </View>
                )
              }
            }
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: (WINDOW_WIDTH - 8) / 5 * 4,
                useNativeDriver: true
              }).start();
            }
          })}
        />
      </Tab.Navigator>
      <Animated.View style={{
        width: 20,
        height: 3,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        backgroundColor: COLORS.primary,
        position: 'absolute',
        bottom: 0,
        left: (WINDOW_WIDTH / 10) - 10 + 4,
        display: isHideBottomTab ? "none" : "flex",
        transform: [
          { translateX: tabOffsetValue }
        ]
      }}></Animated.View>
    </React.Fragment>
  );
}

export default BottomTabNavigator;

const styles = StyleSheet.create({
  title: {
    width: "100%",
    textAlign: "center",
  },
})