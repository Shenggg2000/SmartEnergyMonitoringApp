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

const PropertyButton = ({ id, propertyName, propertyType, selectedPropertyId, setSelectedPropertyId }) => (
  <TouchableWithoutFeedback onPress={() => {
    setSelectedPropertyId(id);
  }}>
    <View style={[
      styles.selectButton,
      selectedPropertyId == id ? styles.selectedButton : {}
    ]}>
      <FontAwesomeIcon icon={propertyType == "RESIDENTIAL" ? "house" : "industry"} color={COLORS.secondary} size={24} />
      <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>{propertyName}</Text>
    </View>
  </TouchableWithoutFeedback>
);

const RoomButton = ({ id, roomName, selectedRoomId, setSelectedRoomId }) => (
  <TouchableWithoutFeedback onPress={() => {
    setSelectedRoomId(id)
  }}>
    <View style={[
      styles.selectButton,
      selectedRoomId == id ? styles.selectedButton : {}
    ]}>
      <FontAwesomeIcon icon="couch" color={COLORS.secondary} size={24} />
      <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>{roomName}</Text>
    </View>
  </TouchableWithoutFeedback>
);

const AddWallOutlet = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [properties, setProperties] = React.useState([]);
  const [rooms, setRooms] = React.useState([]);
  const [submitTry, setSubmitTry] = React.useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState("");
  const [selectedRoomId, setSelectedRoomId] = React.useState("");
  const [wallOutletName, setWallOutletName] = React.useState("");
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    navigation.pop(2);
  };

  const getProperties = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/properties', { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        if (!selectedPropertyId) {
          setSelectedPropertyId(response.data[0].id)
        }
        setProperties(response.data);
      }
    } catch (err) {
      return;
    }
  };

  const getRooms = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/rooms?property_id=' + selectedPropertyId, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        setSelectedRoomId(response.data[0].id)
        setRooms(response.data);
      }
    } catch (err) {
      return;
    }
  };

  saveWallOutlet = async () => {
    setSubmitTry(true);

    if (wallOutletName) {
      let auth_token = await authToken.getToken();
      let result = await axios.post('http://10.0.2.2:5000/api/wall-outlets',
        {
          room_id: selectedRoomId,
          wall_outlet_name: wallOutletName,
          wall_outlet_identifier: route.params.wallOutletIdentifier
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
          saveWallOutlet();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });
    getProperties();
  }, []);

  React.useEffect(() => {
    getRooms();
  }, [selectedPropertyId]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
      <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, {textAlign: "center"}]}>Wall Outlet added successfully!</Text>
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
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Select property of the wall outlet</Text>
          <FlatList
            data={properties}
            renderItem={({ item }) => {
              return (
                <PropertyButton
                  id={item.id}
                  propertyName={item.property_name}
                  propertyType={item.property_type}
                  selectedPropertyId={selectedPropertyId}
                  setSelectedPropertyId={setSelectedPropertyId} />
              )
            }}
            keyExtractor={item => item.id}
            style={styles.selectButtonRow}
            contentContainerStyle={{
              paddingHorizontal: 8
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Select room of the wall outlet</Text>
          <FlatList
            data={rooms}
            renderItem={({ item }) => {
              return (
                <RoomButton
                  id={item.id}
                  roomName={item.room_name}
                  selectedRoomId={selectedRoomId}
                  setSelectedRoomId={setSelectedRoomId} />
              )
            }}
            keyExtractor={item => item.id}
            style={styles.selectButtonRow}
            contentContainerStyle={{
              paddingHorizontal: 8
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Wall Outlet Identifier</Text>
          <View style={styles.textInput}>
            <TextInput style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.gray]} value={route.params.wallOutletIdentifier} editable={false} selectTextOnFocus={false} />
          </View>
        </View>
        <View style={MARGIN.mb16}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb4]}>Wall Outlet Name</Text>
          <View style={styles.textInput}>
            <TextInput
              style={[styles.input, TYPOGRAPHY.h6, FONT_COLORS.secondary]}
              placeholder="Enter wall outlet name"
              onChangeText={wallOutletName => setWallOutletName(wallOutletName)}
              defaultValue={wallOutletName} />
          </View>
          {
            submitTry && !wallOutletName &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.loss, MARGIN.mt4]}>Please enter wall outlet name.</Text>
          }
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddWallOutlet;

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
    marginHorizontal: -16,
  },
  selectButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    minWidth: 120,
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