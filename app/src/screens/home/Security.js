import { StyleSheet, Text, View, SafeAreaView, ScrollView, TextInput, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { COLORS, TYPOGRAPHY, MARGIN, FONT_COLORS, BACKGROUND_COLORS, WINDOW_WIDTH } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Modal from "react-native-modal";
import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Security = () => {
  const navigation = useNavigation();
  const [submitTry, setSubmitTry] = React.useState(false);
  const [incorrectOldPassword, setIncorrectOldPassword] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [secureOldPassword, setSecureOldPassword] = React.useState(true);
  const [secureNewPassword, setSecureNewPassword] = React.useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = React.useState(true);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  savePassword = async () => {
    setSubmitTry(true);

    const samePassword = newPassword === confirmPassword;

    if (oldPassword && newPassword && confirmPassword && samePassword) {
      let auth_token = await authToken.getToken();
      let result = await axios.put('http://10.0.2.2:5000/api/auth/password', { oldPassword, newPassword }, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (response.error) {
        if (response.errorMessage == "Incorrect Old Password.") {
          setIncorrectOldPassword(true);
        }
      } else {
        showModal();
      }
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          savePassword();
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
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Password changed successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View style={MARGIN.mb24}>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>
            Regularly change your password can keep your account secure.
          </Text>
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Old Password</Text>
          <View style={[styles.textInput, styles.textInputPassword]}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Enter Old Password"
              secureTextEntry={secureOldPassword}
              onChangeText={oldPassword => {
                setOldPassword(oldPassword);
                setIncorrectOldPassword(false);
              }}
              defaultValue={oldPassword} />
            <View style={styles.inputTextPasswordIcon}>
              <TouchableWithoutFeedback onPress={() =>
                setSecureOldPassword(curr => !curr)
              }>
                <View>
                  <FontAwesomeIcon icon={secureOldPassword ? "eye-slash" : "eye"} color={COLORS.secondary} size={14} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          {
            submitTry && !oldPassword &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter old password.</Text>
          }
          {
            submitTry && incorrectOldPassword &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Incorrect Old Password.</Text>
          }
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>New Password</Text>
          <View style={[styles.textInput, styles.textInputPassword]}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Enter New Password"
              secureTextEntry={secureNewPassword}
              onChangeText={newPassword => setNewPassword(newPassword)}
              defaultValue={newPassword} />
            <View style={styles.inputTextPasswordIcon}>
              <TouchableWithoutFeedback onPress={() =>
                setSecureNewPassword(curr => !curr)
              }>
                <View>
                  <FontAwesomeIcon icon={secureNewPassword ? "eye-slash" : "eye"} color={COLORS.secondary} size={14} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          {
            submitTry && !newPassword &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter new password.</Text>
          }
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Confirm New Password</Text>
          <View style={[styles.textInput, styles.textInputPassword]}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Re-enter New Password"
              secureTextEntry={secureConfirmPassword}
              onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}
              defaultValue={confirmPassword} />
            <View style={styles.inputTextPasswordIcon}>
              <TouchableWithoutFeedback onPress={() =>
                setSecureConfirmPassword(curr => !curr)
              }>
                <View>
                  <FontAwesomeIcon icon={secureConfirmPassword ? "eye-slash" : "eye"} color={COLORS.secondary} size={14} />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          {
            submitTry && !confirmPassword &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please confirm password.</Text>
          }
          {
            submitTry && newPassword && newPassword !== confirmPassword &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Password was not same.</Text>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Security;

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
  textInputPassword: {
    position: "relative",
  },
  inputTextPasswordIcon: {
    position: "absolute",
    right: 8,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    width: 42,
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