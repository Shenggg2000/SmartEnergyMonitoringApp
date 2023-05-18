import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView } from 'react-native';
import { NOTIFICATION } from '../../../assets/images';
import { COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const NotificationDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [notiDetail, setNotiDetail] = React.useState({
    title: "",
    content: "",
    date: "",
    time: "",
  });

  let getNotification = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/notifications/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        let createdTime = new Date(response.data.created_at);
        const timezoneOffset = 8;
        createdTime.setUTCHours(createdTime.getUTCHours() + timezoneOffset);

        let date = `${createdTime.getFullYear()}-${createdTime.getMonth()+1}-${createdTime.getDate()}`;

        let minute = String(createdTime.getMinutes()).padStart(2, '0');
        let hour = createdTime.getHours();
        let time = `${hour > 12 ? String(hour - 12).padStart(2, '0') : String(hour).padStart(2, '0')}:${minute} ${hour >= 12 ? "PM" : "AM"}`;

        let obj = {
          title: response.data.title,
          content: response.data.content,
          date,
          time
        }
        setNotiDetail(obj)
      }
    } catch (err) {
      return;
    }
  };

  let setToSeen = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.put('http://10.0.2.2:5000/api/notifications/seen/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        route.params.refresh();
        // setNotiDetail(response.data)
      }
    } catch (err) {
      return;
    }
  };

  React.useEffect(() => {
    getNotification();
    setToSeen();
  }, []);
  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <View>
          <View style={{ alignItems: "center" }}>
            <Image source={NOTIFICATION} style={{ height: 250 }} resizeMode="contain" />
          </View>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary, MARGIN.mb4]}>{notiDetail.title}</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb32]}>{notiDetail.content}</Text>
          <View style={{ flexDirection: "row", }}>
            <View style={{ width: "50%" }}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Notice On</Text>
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{notiDetail.date}</Text>
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{notiDetail.time}</Text>
            </View>
            <View style={{ width: "50%" }}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Notice From</Text>
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Smart Energy Monitoring Application</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetail;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 32,
    padding: 16,
  },
})