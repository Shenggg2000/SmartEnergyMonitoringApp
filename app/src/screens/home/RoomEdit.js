import React from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView, TouchableWithoutFeedback, FlatList } from 'react-native';
import { Icon } from '../../components/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Svg, { Rect, Polygon, Circle, Line } from 'react-native-svg';
import Modal from "react-native-modal";

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { COLORS, WINDOW_WIDTH, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, PADDING } from '../../constants';
import { FLOOR_PLAN_BACKGROUND_BIG, FLOOR_PLAN_GRADIENT_BIG } from '../../../assets/images';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const WallOutletButton = ({ id, name, selectedId, setSelectedId }) => (
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
      <FontAwesomeIcon icon="plug" color={COLORS.secondary} size={24} />
      <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>{name}</Text>
    </View>
  </TouchableWithoutFeedback>
);

const RoomEdit = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [wallOutlets, setWallOutlets] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState("");

  const [points, setPoints] = React.useState([
    [50, 50],
    [250, 50],
    [250, 250],
    [50, 250],
  ]);
  const [midPoints, setMidPoints] = React.useState([
    [150, 50],
    [250, 150],
    [150, 250],
    [50, 150],
  ]);
  const [draggingCorner, setDraggingCorner] = React.useState(null);
  const [sockets, setSockets] = React.useState([]);
  const [draggingSocket, setDraggingSocket] = React.useState(null);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh();
    route.params.refresh2();
    navigation.goBack();
  };

  let getRoom = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/rooms/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        let floorplanData = {};
        if (response.data.data !== "") {
          floorplanData = JSON.parse(response.data.data);
          setPoints(floorplanData.points);
          setMidPoints(floorplanData.midPoints);
          setSockets(floorplanData.sockets);
        }
        getWallOutlets(floorplanData.sockets ? floorplanData.sockets : []);
      }
    } catch (err) {
      return;
    }
  }

  let getWallOutlets = async (currentSocket) => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets?room_id=' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        setWallOutlets(response.data);
        let socketsTemp = [];
        response.data.map((item) => {
          socketsTemp.push([item.id, 100 * Math.floor(Math.random() * (3 - 1 + 1) + 1), 100 * Math.floor(Math.random() * (3 - 1 + 1) + 1)])
        })
        if (currentSocket.length == 0) {
          setSockets(socketsTemp);
        }
      }
    } catch (err) {
      return;
    }
  };

  saveFloorplan = async () => {
    try {
      let saveData = JSON.stringify({
        points,
        midPoints,
        sockets
      })

      let auth_token = await authToken.getToken();
      let result = await axios.put('http://10.0.2.2:5000/api/rooms/floor-plan/' + route.params.id,
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

  const handleCornerPressIn = (index) => {
    setDraggingCorner(index);
  };

  const handleCornerPressOut = () => {
    setDraggingCorner(null);
    calculateMidPoint();
  };

  const handleCornerDrag = (event) => {
    let { locationX, locationY } = event.nativeEvent;
    const newPoints = [...points];
    newPoints[draggingCorner] = [Math.round(locationX / 10) * 10, Math.round(locationY / 10) * 10];
    setPoints(newPoints);
  };

  const insertPoint = (x, y, index) => {
    const newPoints = [...points];
    newPoints.splice(index + 1, 0, [x, y]);
    setPoints(newPoints);
    calculateMidPoint2(newPoints);
  }

  const calculateMidPoint = () => {
    let newMidPoints = [];
    for (let i = 0; i < points.length; i++) {
      let x = (points[i][0] + points[i + 1 != points.length ? i + 1 : 0][0]) / 2
      let y = (points[i][1] + points[i + 1 != points.length ? i + 1 : 0][1]) / 2
      newMidPoints.push([x, y]);
    }
    setMidPoints(newMidPoints);
  }

  const calculateMidPoint2 = (newPoints) => {
    let newMidPoints = [];
    for (let i = 0; i < newPoints.length; i++) {
      let x = (newPoints[i][0] + newPoints[i + 1 != newPoints.length ? i + 1 : 0][0]) / 2
      let y = (newPoints[i][1] + newPoints[i + 1 != newPoints.length ? i + 1 : 0][1]) / 2
      newMidPoints.push([x, y]);
    }
    setMidPoints(newMidPoints);
  }

  const handleSocketPressIn = (id, index) => {
    if (id == selectedId) {
      setDraggingSocket(index);
    }
  };

  const handleSocketPressOut = () => {
    setDraggingSocket(null);
  };

  const handleSocketDrag = (event) => {
    if (draggingSocket !== null) {
      let { locationX, locationY } = event.nativeEvent;
      const newSockets = [...sockets];
      newSockets[draggingSocket] = [selectedId, Math.round(locationX / 10) * 10, Math.round(locationY / 10) * 10];
      setSockets(newSockets);
    }
  };

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

    getRoom();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Room floor plan updated successfully!</Text>
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
            <Svg width="100%" height="100%">
              <Polygon
                points={points.join(' ')}
                fill="#00000000"
                strokeWidth={2}
                stroke="black"
              />
              {selectedId == "" && points.map(([x, y], index) => (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={8}
                  fill="white"
                  strokeWidth={2}
                  stroke="#5396FE"
                  onPressIn={() => handleCornerPressIn(index)}
                  onPressOut={handleCornerPressOut}
                  onResponderMove={handleCornerDrag}
                />
              ))}
              {selectedId == "" && draggingCorner === null && midPoints.map(([x, y], index) => (
                <>
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={8}
                    fill="white"
                    strokeWidth={2}
                    stroke="#5396FE"
                    onPressOut={() => { insertPoint(x, y, index) }}
                  />
                  <Line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="black" strokeWidth="2" onPressOut={() => { insertPoint(x, y, index) }} />
                  <Line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="black" strokeWidth="2" onPressOut={() => { insertPoint(x, y, index) }} /></>
              ))}
              {sockets.map(([id, x, y], index) => (
                <Rect key={index} x={x} y={y} width="30" height="30" rx={8} fill={id == selectedId ? "#5396FE" : "#5396FE7C"}
                  onPressIn={() => handleSocketPressIn(id, index)}
                  onPressOut={handleSocketPressOut}
                  onResponderMove={handleSocketDrag}
                />
              ))}
            </Svg>
          </View>
        </View>
      </View>
      <View style={styles.wallOutletSelectionWrapper}>
        <View style={styles.wallOutletSelection}>
          <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.mb12]}>Select wall outlet to apply change</Text>
          <FlatList
            data={wallOutlets}
            renderItem={({ item }) => {
              return (
                <WallOutletButton
                  id={item.id}
                  name={item.wall_outlet_name}
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

export default RoomEdit;

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