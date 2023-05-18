import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../../components/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, BACKGROUND_COLORS, FONTS } from '../../constants';
import { ROUTES } from '../../routes';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Notification = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [notificationsToday, setNotificationsToday] = React.useState([]);
  const [notificationsYesterday, setNotificationsYesterday] = React.useState([]);
  const [notificationsEarlier, setNotificationsEarlier] = React.useState([]);

  let getNotifications = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/notifications', { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        let notificationsToday = []
        let notificationsYesterday = []
        let notificationsEarlier = []
        response.data.map((item) => {
          let createdTime = new Date(item.created_at);
          const timezoneOffset = 8;
          createdTime.setUTCHours(createdTime.getUTCHours() + timezoneOffset);
          let minute = String(createdTime.getMinutes()).padStart(2, '0');
          let hour = createdTime.getHours();

          let now = new Date();
          now.setUTCHours(now.getUTCHours() + timezoneOffset);

          let yesterday = new Date();
          yesterday.setUTCHours(yesterday.getUTCHours() + timezoneOffset - 24);

          let ele = (
            <TouchableWithoutFeedback key={item.id} onPress={() => {
              navigation.navigate(ROUTES.NOTIFICATION_DETAIL, {
                id: item.id,
                notificationName: 'Notification ' + item.id,
                refresh: getNotifications
              })
            }}>
              <View style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <View style={MARGIN.mr12}>
                    {
                      item.notification_type == "STOP" &&
                      <Icon icon="power-off" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.loss} size="medium">
                      </Icon>
                    }
                    {
                      item.notification_type == "WARNING" &&
                      <Icon icon="circle-exclamation" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.primary} size="medium">
                      </Icon>
                    }
                    {
                      item.notification_type == "EMPTY" &&
                      <Icon icon="circle-exclamation" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.info} size="medium">
                      </Icon>
                    }

                  </View>
                  <View>
                    <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mb4, { maxWidth: 240, height: 20 }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{hour > 12 ? String(hour - 12).padStart(2, '0') : String(hour).padStart(2, '0')}:{minute} {hour >= 12 ? "PM" : "AM"}</Text>
                  </View>
                </View>
                {item.is_seen == 0 &&
                  <View style={styles.label}>
                    <Text style={styles.labelText}>New</Text>
                  </View>
                }
              </View>
            </TouchableWithoutFeedback>
          )

          if (createdTime.getDate() == now.getDate() && createdTime.getMonth() == now.getMonth() && createdTime.getFullYear() == now.getFullYear()) {
            notificationsToday.push(ele)
          } else if (createdTime.getDate() == yesterday.getDate() && createdTime.getMonth() == yesterday.getMonth() && createdTime.getFullYear() == yesterday.getFullYear()) {
            notificationsYesterday.push(ele)
          } else {
            notificationsEarlier.push(ele)
          }
        });

        setNotificationsToday(notificationsToday)
        setNotificationsYesterday(notificationsYesterday)
        setNotificationsEarlier(notificationsEarlier)
      }
    } catch (err) {
      return;
    }
  };

  React.useEffect(() => {
    getNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        {
          notificationsToday.length > 0 &&
          <View style={[notificationsYesterday.length == 0 && notificationsEarlier.length == 0 ? styles.allNotificationLast : {}]}>
            <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray, MARGIN.mb12]}>Today</Text>
            {notificationsToday}
          </View>
        }
        {
          notificationsYesterday.length > 0 &&
          <View style={[notificationsEarlier.length == 0 ? styles.allNotificationLast : {}, MARGIN.mt8]}>
            <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray, MARGIN.mb12]}>Yesterday</Text>
            {notificationsYesterday}
          </View>
        }
        <View style={[styles.allNotificationLast, notificationsYesterday.length > 0 || notificationsToday.length > 0 ? MARGIN.mt8 : {}]}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray, MARGIN.mb12]}>Earlier</Text>
          {notificationsEarlier}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 32,
    padding: 16,
  },
  allNotificationLast: {
    marginBottom: 80
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginBottom: 12
  },
  listItemInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
  label: {
    backgroundColor: "#E0ECFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontFamily: FONTS.semiBold,
    fontSize: 8,
    color: COLORS.info
  }
})