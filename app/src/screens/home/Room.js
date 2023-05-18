import React from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../../components/Icon';
import { Switch } from '../../components/Switch';
import Svg, { Rect, Polygon } from 'react-native-svg';

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { COLORS, WINDOW_WIDTH, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, PADDING } from '../../constants';
import { FLOOR_PLAN_BACKGROUND, FLOOR_PLAN_GRADIENT } from '../../../assets/images';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Room = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [wallOutlets, setWallOutlets] = React.useState([]);
  const [wallOutletsData, setWallOutletsData] = React.useState([]);
  const [points, setPoints] = React.useState([
    [50, 50],
    [250, 50],
    [250, 250],
    [50, 250],
  ]);
  const [sockets, setSockets] = React.useState([]);

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
          setSockets(floorplanData.sockets);
        }
        getWallOutlets(floorplanData.sockets ? floorplanData.sockets : []);
      }
    } catch (err) {
      return;
    }
  }

  let getWallOutlets = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets?room_id=' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        let wallOutlets = []
        response.data.map((item) => {
          wallOutlets.push(
            <TouchableWithoutFeedback key={item.id} onPress={() => {
              navigation.navigate(ROUTES.WALL_OUTLET, {
                id: item.id,
                titleName: item.wall_outlet_name,
                refreshQA: route.params.refreshQA,
                refresh: getRoom
              })
            }
            }>
              <View style={styles.wallOutletsButton}>
                <View style={styles.wallOutletsIcon}>
                  <View style={styles.wallOutletsSwitch}>
                    <Switch defaultState={item.state} onChanged={(isOn) => {
                      switchWallOutlet(item.id, isOn)
                    }}></Switch>
                  </View>
                </View>
                <View>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{item.wall_outlet_name}</Text>
                  <Text style={[TYPOGRAPHY.body, item.state ? FONT_COLORS.profit : FONT_COLORS.drakGray]}>
                    {item.state ? "Active" : "No active"}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )
        });
        setWallOutletsData(response.data)
        setWallOutlets(wallOutlets)
      }
    } catch (err) {
      return;
    }
  };

  let switchWallOutlet = async (id, state) => {
    try {
      let auth_token = await authToken.getToken();
      let result;
      if (state) {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/on/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      } else {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/off/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      }
      let response = result.data;
      console.log(route.params);
      if (!response.error) {
        route.params.refreshQA();
        getRoom();
      }
    } catch (err) {
      return;
    }
  };

  const checkStatus = (id) => {
    let found = wallOutletsData.find(item => item.id == id)
    if (found?.state == 0) {
      return COLORS.loss;
    } else {
      return COLORS.profit;
    }
  }

  React.useEffect(() => {
    getRoom();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <View style={styles.floorPlanArea}>
          <Image source={FLOOR_PLAN_BACKGROUND} style={styles.floorPlanBg} />
          <Image source={FLOOR_PLAN_GRADIENT} style={styles.floorPlanGradient} />
          <View style={styles.planArea}>
            <Svg width={WINDOW_WIDTH} height="500">
              <Polygon
                points={points.join(' ')}
                fill="#00000000"
                strokeWidth={2}
                stroke="black"
              />
              {sockets.map(([id, x, y], index) => (
                <Rect key={index} x={x} y={y} width="30" height="30" rx={8} fill={checkStatus(id)} />
              ))}
            </Svg>
          </View>
          <Text style={[styles.floorPlanInfo, TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{wallOutlets.length} Wall Outlets</Text>
          <TouchableWithoutFeedback onPress={() =>
            navigation.navigate(ROUTES.ROOM_EDIT, {
              id: route.params.id,
              titleName: route.params.titleName,
              refresh: getRoom,
              refresh2: route.params.refresh
            })
          }>
            <View style={styles.floorPlanEdit}>
              <Icon icon="pencil" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="small" />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={[styles.allWallOutlets, PADDING.p16]}>
          <View style={[styles.allWallOutletsTitle, MARGIN.mb12]}>
            <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary]}>All Wall Outlets</Text>
          </View>
          <View style={styles.wallOutletsButtonRow}>
            {wallOutlets}
            {wallOutlets.length == 0 &&
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.ml12]}>No wall outlet found.</Text>
            }
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Room;

const styles = StyleSheet.create({
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
    height: 300,
  },
  floorPlanBg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0
  },
  floorPlanGradient: {
    width: "120%",
    height: "120%",
    position: "absolute",
    top: "-10%",
    left: "-10%"
  },
  planArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 0.5 }]
  },
  floorPlanInfo: {
    position: "absolute",
    left: 32,
    bottom: 32,
  },
  floorPlanEdit: {
    position: "absolute",
    right: 32,
    bottom: 32,
  },
  allWallOutlets: {
    marginBottom: 80
  },
  allWallOutletsTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  wallOutletsButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  wallOutletsButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between"
  },
  wallOutletsIcon: {
    height: 60,
    position: 'relative'
  },
  wallOutletsSwitch: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
})