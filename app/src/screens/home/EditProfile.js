import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, BACKGROUND_COLORS, WINDOW_WIDTH } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import Modal from "react-native-modal";

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [username, setUsername] = React.useState('');
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh2();
    route.params.refresh();
    navigation.goBack();
  };

  saveProfile = async () => {
    let auth_token = await authToken.getToken();
    let result = await axios.put('http://10.0.2.2:5000/api/auth', { username }, { headers: { "Authorization": `Bearer ${auth_token}` } });
    let response = result.data;
    if (!response.error) {
      showModal();
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          saveProfile();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Username updated successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>
            Don’t like your current username? You can change it anytime.
          </Text>
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Username</Text>
          <View style={styles.textInput}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Enter New Username"
              onChangeText={username => setUsername(username)}
              defaultValue={username} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  save: {
    right: 16,
    top: 8,
    zIndex: 999
  },
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 32,
    padding: 16,
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
  input: {
    width: "100%",
    height: 42,
    padding: 0,
  },
  modal: {
    alignItems: "center",
    justifyContent: "center"
  },
  modalContent: {
    backgroundColor: COLORS.white,
    width: WINDOW_WIDTH - 100,
    borderRadius: 16,
    padding: 16,
    alignItems: "center"
  }
})