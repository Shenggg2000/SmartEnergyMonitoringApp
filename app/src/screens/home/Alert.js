import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { COLORS, FONTS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { SelectList } from 'react-native-dropdown-select-list';
import Modal from "react-native-modal";

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Alert = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [defaultWarning, setDefaultWarning] = useState({ key: '1', value: 'Unset' });
  const [defaultStop, setDefaultStop] = useState({ key: '1', value: 'Unset' });
  const [selectedWarning, setSelectedWarning] = useState("1");
  const [selectedStop, setSelectedStop] = useState("1");
  const [warningValue, setWarningValue] = useState("");
  const [stopValue, setStopValue] = useState("");
  const [isModalVisible, setModalVisible] = React.useState(false);
  const styles = getStyles(selectedWarning, selectedStop);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh();
    navigation.goBack();
  };

  const dataWarning = [
    { key: '1', value: 'Unset' },
    { key: '2', value: 'Custom' },
  ]
  const dataStop = [
    { key: '1', value: 'Unset' },
    { key: '2', value: 'Custom' },
  ]

  saveAlert = async () => {
    let dataDaily = {
      daily_warning_value: selectedWarning == "2" ? warningValue : "NULL",
      daily_stop_value: selectedStop == "2" ? stopValue : "NULL",
    }
    let dataMonthly = {
      monthly_warning_value: selectedWarning == "2" ? warningValue : "NULL",
      monthly_stop_value: selectedStop == "2" ? stopValue : "NULL",
    }
    let auth_token = await authToken.getToken();
    let result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/' + (route.params.wallOutletIsDaily ? 'daily' : 'monthly') + '/' + route.params.wallOutletId,
      route.params.wallOutletIsDaily ? dataDaily : dataMonthly,
      { headers: { "Authorization": `Bearer ${auth_token}` } });
    let response = result.data;
    console.log(response);
    if (!response.error) {
      showModal();
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          saveAlert();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });
    if (route.params.warning) {
      setDefaultWarning({ key: '2', value: 'Custom' });
      setSelectedWarning("2");
      setWarningValue(route.params.warning + "")
    }
    if (route.params.stop) {
      setDefaultStop({ key: '2', value: 'Custom' })
      setSelectedStop("2");
      setStopValue(route.params.stop + "")
    }
  }, []);


  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
      <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, {textAlign: "center"}]}>Alert value updated successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary, MARGIN.mb4]}>{route.params.wallOutletIsDaily ? 'Daily' : 'Monthly'} Energy Consumption Alert</Text>
          <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary, MARGIN.mb4]}>{route.params.wallOutletName}</Text>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Set your {route.params.wallOutletIsDaily ? 'daily' : 'monthly'} energy consumption alert point to avoid exceeding usage.</Text>
        </View>
        <View>
          <View style={[MARGIN.mb16, { zIndex: 9 }]}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Warning</Text>
            <View style={styles.selectNInput}>
              <SelectList
                data={dataWarning}
                defaultOption={defaultWarning}
                boxStyles={styles.selectListBoxStylesWarning}
                inputStyles={styles.selectListInputStyles}
                dropdownStyles={styles.selectListDropdownStyles}
                dropdownItemStyles={styles.selectListDropdownItemStyles}
                dropdownTextStyles={styles.selectListDropdownTextStyles}
                setSelected={(val) => setSelectedWarning(val)}
                searchicon={<></>}
                search={false} />
              {selectedWarning == "2" ?
                <View style={[styles.textInput, styles.textInputWarning]}>
                  <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                    onChangeText={warningValue => setWarningValue(warningValue)}
                    defaultValue={warningValue} />
                  <Text style={[styles.suffix, TYPOGRAPHY.h6, FONT_COLORS.gray]}>RM</Text>
                </View> :
                <></>}
            </View>
          </View>
          <View style={MARGIN.mb16}>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Force Stop</Text>
            <View style={styles.selectNInput}>
              <SelectList
                data={dataStop}
                defaultOption={defaultStop}
                boxStyles={styles.selectListBoxStylesStop}
                inputStyles={styles.selectListInputStyles}
                dropdownStyles={styles.selectListDropdownStyles}
                dropdownItemStyles={styles.selectListDropdownItemStyles}
                dropdownTextStyles={styles.selectListDropdownTextStyles}
                setSelected={(val) => setSelectedStop(val)}
                searchicon={<></>}
                search={false} />
              {selectedStop == "2" ?
                <View style={[styles.textInput, styles.textInputStop]}>
                  <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
                    onChangeText={stopValue => setStopValue(stopValue)}
                    defaultValue={stopValue} />
                  <Text style={[styles.suffix, TYPOGRAPHY.h6, FONT_COLORS.gray]}>RM</Text>
                </View> :
                <></>}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Alert;

const getStyles = (selectedWarning, selectedStop) => StyleSheet.create({
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
    marginBottom: 16,
  },
  selectNInput: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  selectListBoxStylesWarning: {
    width: selectedWarning != '2' ? WINDOW_WIDTH - 32 : (WINDOW_WIDTH / 2) - 16 - 8,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    borderWidth: 0,
    position: "relative",
    height: 42,
  },
  selectListBoxStylesStop: {
    width: selectedStop != '2' ? WINDOW_WIDTH - 32 : (WINDOW_WIDTH / 2) - 16 - 8,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    borderWidth: 0,
    position: "relative",
    height: 42,
  },
  selectListInputStyles: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.secondary,
  },
  selectListDropdownStyles: {
    borderWidth: 0,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: "100%",
    position: "absolute",
    top: "105%",
  },
  selectListDropdownItemStyles: {
    paddingVertical: 6
  },
  selectListDropdownTextStyles: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
  },
  textInput: {
    width: (WINDOW_WIDTH / 2) - 16 - 8,
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  textInputWarning: {
    display: selectedWarning != '2' ? "none" : "flex",
  },
  textInputStop: {
    display: selectedStop != '2' ? "none" : "flex",
  },
  input: {
    width: "80%",
    height: 42,
    paddingBottom: 0,
    paddingTop: 0,
    textAlign: "right",
  },
  suffix: {
    marginLeft: 4
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