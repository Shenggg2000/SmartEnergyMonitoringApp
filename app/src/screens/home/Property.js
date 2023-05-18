import React from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../../components/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Svg, { Polygon } from 'react-native-svg';

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { COLORS, WINDOW_WIDTH, BACKGROUND_COLORS, TYPOGRAPHY, FONT_COLORS, MARGIN, PADDING } from '../../constants';
import { FLOOR_PLAN_BACKGROUND, FLOOR_PLAN_GRADIENT } from '../../../assets/images';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Property = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [rooms, setRooms] = React.useState([]);
  const [polygons, setPolygons] = React.useState([]);

  let getRooms = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/rooms?property_id=' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        let rooms = []
        response.data.map((item) => {
          rooms.push(
            <TouchableWithoutFeedback key={item.id} onPress={() =>
              navigation.navigate(ROUTES.ROOM, {
                id: item.id,
                titleName: item.room_name,
                refresh: getRooms,
                refreshQA: route.params.refreshQA
              })
            }>
              <View style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <View style={MARGIN.mr12}>
                    <Icon icon="couch" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.secondary} size="medium">
                    </Icon>
                  </View>
                  <View>
                    <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{item.room_name}</Text>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{item.num_wall_outlets} Wall Outlets Registered</Text>
                  </View>
                </View>
                <FontAwesomeIcon icon="chevron-right" color={COLORS.secondary} size={16} style={MARGIN.mr4} />
              </View>
            </TouchableWithoutFeedback>
          )
        });
        setRooms(rooms)

        let polygons = []
        response.data.map(item => {
          let parsedData = JSON.parse(item.data);
          polygons.push([item.id, parsedData.points, 0, 0])
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
                finalPolygons.push([jtem[0], jtem[1], item[1], item[2]]);
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

  React.useEffect(() => {
    getRooms();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <View style={styles.floorPlanArea}>
          <Image source={FLOOR_PLAN_BACKGROUND} style={styles.floorPlanBg} />
          <Image source={FLOOR_PLAN_GRADIENT} style={styles.floorPlanGradient} />
          <View style={styles.planArea}>
            <Svg width="650" height="900">
              {polygons.map(([id, points, x, y], index) => (
                <Polygon
                  key={index + "a"}
                  points={points.join(' ')}
                  fill="#00000000"
                  strokeWidth={4}
                  stroke="#000000"
                  x={x}
                  y={y}
                />
              ))}
            </Svg>
          </View>
          <Text style={[styles.floorPlanInfo, TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{rooms.length} Rooms</Text>
          <TouchableWithoutFeedback onPress={() =>
            navigation.navigate(ROUTES.PROPERTY_EDIT, {
              id: route.params.id,
              titleName: route.params.titleName,
              refresh: getRooms
            })
          }>
            <View style={styles.floorPlanEdit}>
              <Icon icon="pencil" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="small" />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={[styles.allRooms, PADDING.p16]}>
          <View style={[styles.allRoomsTitle, MARGIN.mb12]}>
            <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary]}>All Rooms</Text>
          </View>
          {rooms}
          {rooms.length == 0 &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No room found.</Text>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Property;

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
    height: 350,
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
    transform: [{ scale: 0.35 }]
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
  allRooms: {
    marginBottom: 80
  },
  allRoomsTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    marginBottom: 12
  },
  listItemInfo: {
    flexDirection: "row",
    alignItems: "center"
  },
})