import { StyleSheet, Text, View, SafeAreaView, TouchableWithoutFeedback, TextInput, FlatList } from 'react-native';
import React from 'react';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import Modal from "react-native-modal";

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();
const TARIFF = [
  {
    id: 1,
    name: "D"
  },
  {
    id: 2,
    name: "E1"
  },
  {
    id: 3,
    name: "E2"
  },
  {
    id: 4,
    name: "E3"
  }
]

const TariffButton = ({ name, selectedTariff, setSelectedTariff }) => (
  <TouchableWithoutFeedback onPress={() => {
    setSelectedTariff(name)
  }}>
    <View style={[
      styles.selectButton2,
      selectedTariff == name ? styles.selectedButton : {}
    ]}>
      <FontAwesomeIcon icon="bolt-lightning" color={COLORS.secondary} size={24} />
      <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.ml4]}>{name}</Text>
    </View>
  </TouchableWithoutFeedback>
);

const AddProperty = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [submitTry, setSubmitTry] = React.useState(false);
  const [propertyType, setPropertyType] = React.useState("RESIDENTIAL");
  const [selectedTariff, setSelectedTariff] = React.useState("");
  const [propertyName, setPropertyName] = React.useState("");
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  saveProperty = async () => {
    setSubmitTry(true);

    if (propertyName) {
      let auth_token = await authToken.getToken();
      let result = await axios.post('http://10.0.2.2:5000/api/properties',
        {
          property_type: propertyType,
          property_name: propertyName,
          property_tariff: selectedTariff,
          floor_plan_data: ""
        },
        {
          headers: { "Authorization": `Bearer ${auth_token}` }
        }
      );
      let response = result.data;
      console.log(response);
      if (!response.error) {
        showModal();
      }
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          saveProperty();
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
      <View style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, {textAlign: "center"}]}>Property added successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View>
          <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb24]}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
        </View>
        <View>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Select type of property</Text>
          <View style={styles.selectButtonRow}>
            <TouchableWithoutFeedback onPress={() => {
              setPropertyType("RESIDENTIAL")
            }}>
              <View style={[styles.selectButton, propertyType == "RESIDENTIAL" ? styles.selectedButton : {}]}>
                <FontAwesomeIcon icon="house" color={COLORS.secondary} size={24} />
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>Residential</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => {
              setPropertyType("INDUSTRY")
            }}>
              <View style={[styles.selectButton, propertyType == "INDUSTRY" ? styles.selectedButton : {}]}>
                <FontAwesomeIcon icon="industry" color={COLORS.secondary} size={24} />
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>Industry</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        {
          propertyType == "INDUSTRY" &&
          <View>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Select Tariff Category</Text>
            <FlatList
              data={TARIFF}
              renderItem={({ item }) => {
                return (
                  <TariffButton
                    name={item.name}
                    selectedTariff={selectedTariff}
                    setSelectedTariff={setSelectedTariff} />
                )
              }}
              keyExtractor={item => item.id}
              style={styles.selectButtonRow2}
              contentContainerStyle={{
                paddingHorizontal: 8
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        }
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Property Name</Text>
          <View style={styles.textInput}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Enter property name"
              onChangeText={propertyName => setPropertyName(propertyName)}
              defaultValue={propertyName} />
          </View>
          {
            submitTry && !propertyName &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter property name.</Text>
          }
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddProperty;

const styles = StyleSheet.create({
  save: {
    right: 16,
    top: 8,
    zIndex: 999
  },
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 24,
    padding: 16,
  },
  selectButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  selectButtonRow2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -16,
  },
  selectButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between"
  },
  selectButton2: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between"
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    padding: 14
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