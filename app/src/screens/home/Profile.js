import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { PROFILE_IMAGE } from '../../../assets/images';
import { ROUTES } from '../../routes';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AuthToken from '../../helper/auth-token';

const authToken = new AuthToken();

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [username, setUsername] = React.useState('');

  let getUser = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/auth', { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        setUsername(response.data.username)
      }
    } catch (err) {
      return;
    }
  };

  const logout = async () => {
    await removeMessagingToken();
    await authToken.deleteToken();
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }],
    });
  }

  const removeMessagingToken = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.put('http://10.0.2.2:5000/api/auth/messaging-token',
        { messaging_token: '' },
        { headers: { "Authorization": `Bearer ${auth_token}` } 
      });
      let response = result.data;

      if (!response.error) {
        setUsername(response.data.username)
      }
    } catch (err) {
      return;
    }
  }

  React.useEffect(() => {
    getUser();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <View>
            <Image style={styles.profileImage} source={PROFILE_IMAGE} />
          </View>
          <View style={styles.profileAction}>
            <View style={styles.profileName}>
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.gray]}>Hello,</Text>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary]}>{username}</Text>
            </View>
            <TouchableWithoutFeedback onPress={() => {
              logout();
            }}>
              <View style={styles.logoutIcon}>
                <FontAwesomeIcon icon="right-from-bracket" color={COLORS.secondary} size={16} style={{ marginRight: 12 }} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={MARGIN.mt24}>
          <View style={styles.profileButtonRow}>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.EDIT_PROFILE, {
                refresh: route.params.refresh,
                refresh2: getUser
              })
            }>
              <View style={styles.profileButton}>
                <View style={MARGIN.mb12}>
                  <FontAwesomeIcon icon="user" color={COLORS.secondary} size={24} />
                </View>
                <View>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>Edit Profile</Text>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Edit User Information</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.SECURITY, {
                titleName: "Security",
              })
            }>
              <View style={styles.profileButton}>
                <View style={MARGIN.mb12}>
                  <FontAwesomeIcon icon="shield-halved" color={COLORS.secondary} size={24} />
                </View>
                <View>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>Security</Text>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Change Your Password</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};

export default Profile;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 32,
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 12
  },
  profileAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  profileButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  profileButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
  },
})