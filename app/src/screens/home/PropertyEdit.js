import React from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Icon } from '../../components/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Svg, { Polygon } from 'react-native-svg';
import Modal from "react-native-modal";

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { COLORS, WINDOW_WIDTH, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, PADDING } from '../../constants';
import { FLOOR_PLAN_BACKGROUND_BIG, FLOOR_PLAN_GRADIENT_BIG } from '../../../assets/images';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const RoomButton = ({ id, name, selectedId, setSelectedId }) => (
  <TouchableWithoutFeedback onPress={() => {
    setSelectedId((curr) => {
      if (curr == id) {
        return ""
      } else {
        return id;
      }
    })
  }}>
    <View style={[
      styles.selectButton,
      selectedId == id ? styles.selectedButton : {}
    ]}>
      <FontAwesomeIcon icon="couch" color={COLORS.secondary} size={24} />
      <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>{name}</Text>
    </View>
  </TouchableWithoutFeedback>
);

const PropertyEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [rooms, setRooms] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [polygons, setPolygons] = React.useState([]);
  const [draggingPolygon, setDraggingPolygon] = React.useState(null);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh();
    navigation.goBack();
  };

  let getRooms = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/rooms?property_id=' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        setRooms(response.data);
        let polygons = []
        response.data.map(item => {
          let parsedData = JSON.parse(item.data);
          let smallestX = 0;
          smallestX = parsedData.points.reduce((acc, item) => {
            if (acc == -1) {
              return item[0]
            } else if (acc > item[0]) {
              return item[0]
            } else {
              return acc;
            }
          }, -1)
          let biggestX = 0;
          biggestX = parsedData.points.reduce((acc, item) => {
            if (acc == -1) {
              return item[0]
            } else if (acc < item[0]) {
              return item[0]
            } else {
              return acc;
            }
          }, -1)
          let smallestY = 0;
          smallestY = parsedData.points.reduce((acc, item) => {
            if (acc == -1) {
              return item[1]
            } else if (acc > item[1]) {
              return item[1]
            } else {
              return acc;
            }
          }, -1)
          let biggestY = 0;
          biggestY = parsedData.points.reduce((acc, item) => {
            if (acc == -1) {
              return item[1]
            } else if (acc < item[1]) {
              return item[1]
            } else {
              return acc;
            }
          }, -1)

          polygons.push([item.id, parsedData.points, (smallestX + biggestX) / 2, (smallestY + biggestY) / 2, 0, 0])
        })
        getProperty(polygons);
      }
    } catch (err) {
      return;
    }
  };

  let getProperty = async (newPolygons) => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/properties/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        if (response.data.data == "") {
          setPolygons(newPolygons);
        } else {
          let positionArray = JSON.parse(response.data.data);
          let finalPolygons = []
          positionArray.map(item => {
            newPolygons.map(jtem => {
              if (jtem[0] == item[0]) {
                finalPolygons.push([jtem[0], jtem[1], jtem[2], jtem[3], item[1], item[2]]);
              }else{
                finalPolygons.push([jtem[0], jtem[1], jtem[2], jtem[3], jtem[4], jtem[5]]);
              }
            })
          })
          setPolygons(finalPolygons);
        }
      }
    } catch (err) {
      return;
    }
  };

  const handlePolygonPressIn = (id, index) => {
    if (id == selectedId) {
      setDraggingPolygon(index);
    }
  };

  const handlePolygonPressOut = () => {
    setDraggingPolygon(null);
  };

  const handlePolygonDrag = (event) => {
    if (draggingPolygon !== null) {
      let { locationX, locationY } = event.nativeEvent;
      const newPolygons = [...polygons];
      newPolygons[draggingPolygon] = [
        selectedId,
        newPolygons[draggingPolygon][1],
        newPolygons[draggingPolygon][2],
        newPolygons[draggingPolygon][3],
        (Math.round(locationX / 10) * 10) - newPolygons[draggingPolygon][2],
        (Math.round(locationY / 10) * 10) - newPolygons[draggingPolygon][3]
      ];
      setPolygons(newPolygons);
    }
  };

  saveFloorplan = async () => {
    try {
      let myPolygons = JSON.parse(JSON.stringify(polygons));
      let newMyPolygons = []
      myPolygons.map(item => {
        newMyPolygons.push([item[0], item[4], item[5]])
      })
      console.log(newMyPolygons);
      let saveData = JSON.stringify(newMyPolygons)

      let auth_token = await authToken.getToken();
      let result = await axios.put('http://10.0.2.2:5000/api/properties/floor-plan/' + route.params.id,
        { floor_plan_data: saveData },
        { headers: { "Authorization": `Bearer ${auth_token}` } }
      );
      let response = result.data;

      if (!response.error) {
        showModal();
      }
    } catch (err) {
      return;
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          saveFloorplan();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });

    getRooms();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Property floor plan updated successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View style={styles.floorPlanArea}>
          <Image source={FLOOR_PLAN_BACKGROUND_BIG} style={styles.floorPlanBg} />
          <Image source={FLOOR_PLAN_GRADIENT_BIG} style={styles.floorPlanGradient} />
          <Image source={FLOOR_PLAN_GRADIENT_BIG} style={styles.floorPlanGradient2} />
          <View style={styles.planArea}>
            <Svg width="650" height="900">
              {polygons.map(([id, points, middleX, middleY, x, y], index) => (
                <>
                  <Polygon
                    key={index + "a"}
                    points={points.join(' ')}
                    fill="#00000000"
                    strokeWidth={2}
                    stroke={selectedId == id ? "#5396FE" : "#000000"}
                    x={x}
                    y={y}
                    onPressIn={() => handlePolygonPressIn(id, index)}
                    onPressOut={handlePolygonPressOut}
                    onResponderMove={handlePolygonDrag}
                  />
                </>
              ))}
            </Svg>
          </View>
        </View>
      </View>
      <View style={styles.wallOutletSelectionWrapper}>
        <View style={styles.wallOutletSelection}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb12]}>Select room to apply change</Text>
          <FlatList
            data={rooms}
            renderItem={({ item }) => {
              return (
                <RoomButton
                  id={item.id}
                  name={item.room_name}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId} />
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
      </View>
    </SafeAreaView>
  );
};

export default PropertyEdit;

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
    paddingTop: 16,
  },
  floorPlanArea: {
    position: "relative",
    width: WINDOW_WIDTH,
    height: 510,
  },
  floorPlanBg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  floorPlanGradient: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  floorPlanGradient2: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    transform: [{ rotate: '180deg' }]
  },
  planArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.6 }]
  },
  wallOutletSelectionWrapper: {
    width: "100%",
    position: "absolute",
    left: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    zIndex: 999
  },
  wallOutletSelection: {
    width: "100%",
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
  },
  selectButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -16,
  },
  selectButton: {
    backgroundColor: "#E6E6E6",
    borderRadius: 16,
    marginHorizontal: 8,
    padding: 16,
    minWidth: 120,
    justifyContent: "space-between"
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
    padding: 14
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