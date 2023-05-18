import React from 'react';
import { StyleSheet, Text, SafeAreaView, View, ScrollView, Image, TouchableWithoutFeedback } from 'react-native';
import { Switch } from '../../components/Switch';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Icon } from '../../components/Icon';
import { SelectList } from 'react-native-dropdown-select-list';

import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native'

import { COLORS, TYPOGRAPHY, FONT_COLORS, PADDING, MARGIN, WINDOW_WIDTH, BACKGROUND_COLORS, FONTS } from '../../constants';
import { PROFILE_IMAGE } from '../../../assets/images';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const Home = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused()
  const [username, setUsername] = React.useState('');
  const [quickAccess, setQuickAccess] = React.useState([]);
  const [properties, setProperties] = React.useState([]);
  const [propertiesSelection, setPropertiesSelection] = React.useState([]);
  const [propertiesSelected, setPropertiesSelected] = React.useState('');
  const [overview, setOverview] = React.useState({
    dailyTotalPower: 0,
    dailyTotalBill: 0,
    monthlyTotalPower: 0,
    monthlyTotalBill: 0,
  });

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

  let getQuickAccess = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets?quick_access=1', { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      console.log(response);
      if (!response.error) {
        let quickAccess = []
        response.data.map((item) => {
          quickAccess.push(
            <TouchableWithoutFeedback key={item.state + item.wall_outlet_name} onPress={()=> {
              navigation.navigate(ROUTES.WALL_OUTLET, {
                id: item.id,
                titleName: item.wall_outlet_name,
                refreshQA: getQuickAccess
              })
            }}>
              <View style={styles.quickAccessButton}>
                <View style={styles.quickAccessIcon}>
                  <View style={styles.quickAccessSwitch}>
                    <Switch defaultState={item.state} onChanged={(isOn) => {
                      switchWallOutlet(item.id, isOn)
                    }}></Switch>
                  </View>
                </View>
                <View>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{item.wall_outlet_name}</Text>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{item.property_name}</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )
        });
        setQuickAccess(quickAccess)
      }
    } catch (err) {
      return;
    }
  };

  let getProperties = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/properties', { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        let properties = []
        let propertiesSelection = []
        response.data.map((item) => {
          properties.push(
            <TouchableWithoutFeedback key={item.id} onPress={() =>
              navigation.navigate(ROUTES.PROPERTY, {
                id: item.id,
                titleName: item.property_name,
                refreshQA: getQuickAccess
              })
            }>
              <View style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <View style={MARGIN.mr12}>
                    <Icon icon={item.property_type == "RESIDENTIAL" ? "house" : "industry"} iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.secondary} size="medium">
                    </Icon>
                  </View>
                  <View>
                    <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{item.property_name}</Text>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{item.num_wall_outlets} Wall Outlets Registered</Text>
                  </View>
                </View>
                <FontAwesomeIcon icon="chevron-right" color={COLORS.secondary} size={16} style={MARGIN.mr4} />
              </View>
            </TouchableWithoutFeedback>
          )
          propertiesSelection.push({
            key: item.id,
            value: item.property_name
          });
        });

        setProperties(properties)
        setPropertiesSelection(propertiesSelection)
        setPropertiesSelected(propertiesSelection[0].key)
      }
    } catch (err) {
      return;
    }
  };

  let getSummary = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/properties/home-usage/' + propertiesSelected, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        setOverview(response.data);
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
      if (!response.error) {
        console.log(response);
      }
    } catch (err) {
      return;
    }
  };

  React.useEffect(() => {
    getUser();
    getQuickAccess();
    getProperties();
    getSummary();
  }, [isFocused]);

  React.useEffect(() => {
    getSummary();
  }, [propertiesSelected]);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={PADDING.p16}>
        <View style={styles.greatings}>
          <View>
            <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>Hello, {username}</Text>
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Welcome back</Text>
          </View>
          <View>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.PROFILE, { refresh: getUser })
            }>
              <Image style={styles.profileImage} source={PROFILE_IMAGE} />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <View style={styles.dataOverview}>
          <View style={{ zIndex: 9 }}>
            <View style={styles.cardTitleArea}>
              <Text style={[TYPOGRAPHY.h5, FONT_COLORS.lightGray]}>Energy Consumption</Text>
              <View style={styles.cardSelection}>
                <SelectList
                  arrowicon={
                    <FontAwesomeIcon icon="chevron-down" color={COLORS.lightGray} size={12} style={[{ marginTop: 2 }, MARGIN.ml4]} />
                  }
                  maxHeight={100}
                  data={propertiesSelection}
                  defaultOption={propertiesSelection[0]}
                  boxStyles={styles.selectListBoxStyles}
                  inputStyles={styles.selectListInputStyles}
                  dropdownStyles={styles.selectListDropdownStyles}
                  dropdownItemStyles={styles.selectListDropdownItemStyles}
                  dropdownTextStyles={styles.selectListDropdownTextStyles}
                  setSelected={(val) => setPropertiesSelected(val)}
                  searchicon={<></>}
                  search={false} />
              </View>
            </View>
            <View style={styles.breakLine}></View>
          </View>
          <View style={styles.dataInformation}>
            <View style={styles.singleDataBox}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.info]}>Today</Text>
              <View style={styles.singleDataValue}>
                <FontAwesomeIcon icon="bolt-lightning" color={COLORS.primary} size={16} style={{ marginTop: -4 }} />
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.lightGray, MARGIN.ml12]}>{overview?.dailyTotalPower.toFixed(2)} Wh</Text>
              </View>
              <View style={styles.singleDataValue}>
                <FontAwesomeIcon icon="coins" color={COLORS.loss} size={16} style={{ marginTop: -4 }} />
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.lightGray, MARGIN.ml12]}>RM {overview?.dailyTotalBill.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.verticalBreakLine}></View>
            <View style={styles.singleDataBox}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.info]}>This Month</Text>
              <View style={styles.singleDataValue}>
                <FontAwesomeIcon icon="bolt-lightning" color={COLORS.primary} size={16} style={{ marginTop: -4 }} />
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.lightGray, MARGIN.ml12]}>{overview?.monthlyTotalPower.toFixed(2)} Wh</Text>
              </View>
              <View style={styles.singleDataValue}>
                <FontAwesomeIcon icon="coins" color={COLORS.loss} size={16} style={{ marginTop: -4 }} />
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.lightGray, MARGIN.ml12]}>RM {overview?.monthlyTotalBill.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.quickAccess}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12]}>Quick Access</Text>
          <View style={styles.quickAccessButtonRow}>
            {quickAccess}
          </View>
          {quickAccess.length == 0 &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No quick access wall outlet found.</Text>
          }
        </View>
        <View style={styles.allProperties}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12]}>All Properties</Text>
          {properties}
          {properties.length == 0 &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No property found.</Text>
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  greatings: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  dataOverview: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 16,
  },
  cardTitleArea: {
    marginBottom: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9
  },
  cardSelection: {
    alignItems: "flex-end",
    flexGrow: 1
  },
  breakLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#AFAFAF",
  },
  dataInformation: {
    flexDirection: "row",
    paddingTop: 12,
  },
  singleDataBox: {
    flexGrow: 1
  },
  singleDataValue: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  verticalBreakLine: {
    width: 1,
    backgroundColor: "#AFAFAF",
    marginHorizontal: 12,
  },
  quickAccess: {
    marginTop: 24,
  },
  quickAccessButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  quickAccessButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between"
  },
  quickAccessIcon: {
    height: 60,
    position: 'relative'
  },
  quickAccessSwitch: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  allProperties: {
    marginBottom: 80
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
  selectListBoxStyles: {
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 0,
    position: "relative",
    height: 26,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
  },
  selectListInputStyles: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.lightGray,
  },
  selectListDropdownStyles: {
    borderWidth: 0,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    width: 80,
    position: "absolute",
    top: "100%",
    right: 0,
    paddingVertical: -6,
  },
  selectListDropdownItemStyles: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  selectListDropdownTextStyles: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
  },
})

