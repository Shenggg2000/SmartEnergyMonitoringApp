import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../../components/Icon';
import React from 'react';
import { COLORS, FONTS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { SelectList } from 'react-native-dropdown-select-list';
import { LineChart } from "react-native-chart-kit";
import { ENERGY_BAR, PRICE_BAR } from '../../../assets/images';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const WallOutletData = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [tab, setTab] = React.useState("energy");
  const [selectedBarGraphSelection, setSelectedBarGraphSelection] = React.useState("1");

  const [data, setData] = React.useState({
    weeklyTotalPower: 0,
    weeklyTotalBill: 0,
    weeklyPower: [0, 0, 0, 0, 0, 0, 0],
    weeklyBill: [0, 0, 0, 0, 0, 0, 0],
    monthlyTotalPower: 0,
    monthlyTotalBill: 0,
    monthlyPower: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    monthlyBill: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  const [latestEvents, setLatestEvents] = React.useState([]);

  const barGraphSelection = [
    { key: '1', value: 'Weekly' },
    { key: '2', value: 'Monthly' },
  ]

  let getData = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets/usage/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        console.log(response.data);
        setData(response.data);
        let latestEvents = [];
        response.data.latestEvents.map((item, index) => {
          let endDate = new Date((item.endTimestamp + 28800) * 1000);
          let startDate = new Date((item.startTimestamp + 28800) * 1000);
          let diff = item.endTimestamp - item.startTimestamp;
          let diffText = getDiffText(diff);
          let monthName = getMonthName(startDate.getMonth());
          latestEvents.push(
            <View style={styles.listItem} key={index}>
              <View style={styles.listItemInfo}>
                <View style={MARGIN.mr12}>
                  <Icon icon="power-off" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.secondary} size="medium">
                  </Icon>
                </View>
                <View>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mb4]}>{startDate.getDate()} {monthName} {startDate.getFullYear()}</Text>
                  <View style={styles.listItemInfoDesc}>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Turn On At: </Text>
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>{String((startDate.getHours() > 12 ? startDate.getHours() - 12 : startDate.getHours())).padStart(2, '0')}:{String(startDate.getMinutes()).padStart(2, '0')} {startDate.getHours() >= 12 ? "PM" : "AM"}</Text>
                  </View>
                  <View style={styles.listItemInfoDesc}>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Turn Off At: </Text>
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>{String(endDate.getHours() > 12 ? endDate.getHours() - 12 : endDate.getHours()).padStart(2, '0')}:{String(endDate.getMinutes()).padStart(2, '0')} {endDate.getHours() >= 12 ? "PM" : "AM"}</Text>
                  </View>
                  <View style={styles.listItemInfoDesc}>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>Active Time: </Text>
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>{diffText}</Text>
                  </View>
                  <View style={[styles.listItemInfoDesc, MARGIN.mt4]}>
                    <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{tab == "energy" ? "Energy Consumed: " : "Price To Pay: "}</Text>
                    <Text style={[TYPOGRAPHY.h6, tab == "energy" ? FONT_COLORS.primary : FONT_COLORS.loss]}>{tab == "price" ? "RM " + item.actionBill.toFixed(2) : ""}{tab == "energy" ? item.actionPower.toFixed(2) + " Wh" : ""}</Text>
                  </View>
                </View>
              </View>
            </View>
          )
        });
        setLatestEvents(latestEvents);
      }
    } catch (err) {
      return;
    }
  };

  let getMonthName = (int) => {
    if (int == 0) {
      return "January"
    } else if (int == 1) {
      return "February"
    } else if (int == 2) {
      return "March"
    } else if (int == 3) {
      return "April"
    } else if (int == 4) {
      return "May"
    } else if (int == 5) {
      return "Jun"
    } else if (int == 6) {
      return "July"
    } else if (int == 7) {
      return "August"
    } else if (int == 8) {
      return "September"
    } else if (int == 9) {
      return "October"
    } else if (int == 10) {
      return "November"
    } else if (int == 11) {
      return "December"
    }
  }

  let getDiffText = (diff) => {
    let returnText = "";
    let second = diff % 60;
    let minute = Math.floor(diff / 60);
    let hour = Math.floor(diff / 3600);
    if (hour != 0) {
      returnText += (hour + " hour" + (hour > 1 ? "s " : " "))
    }
    if (minute != 0) {
      returnText += (minute + " minute" + (minute > 1 ? "s " : " "))
    }
    if (second != 0) {
      returnText += (second + " second" + (second > 1 ? "s " : " "))
    }
    return returnText;
  }

  React.useEffect(() => {
    getData();
  }, []);

  React.useEffect(() => {
    getData();
  }, [selectedBarGraphSelection, tab]);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        <View style={styles.tabs}>
          <TouchableWithoutFeedback onPress={() =>
            setTab("energy")
          }>
            <View style={[styles.tab, tab == "energy" ? styles.selectedTab : {}]}>
              <FontAwesomeIcon icon="bolt-lightning" color={COLORS.primary} size={16} />
              <Text style={[TYPOGRAPHY.h6, tab == "energy" ? FONT_COLORS.lightGray : FONT_COLORS.secondary, MARGIN.ml8]}>Energy</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() =>
            setTab("price")
          }>
            <View style={[styles.tab, tab == "price" ? styles.selectedTab : {}]}>
              <FontAwesomeIcon icon="coins" color={COLORS.loss} size={16} />
              <Text style={[TYPOGRAPHY.h6, tab == "price" ? FONT_COLORS.lightGray : FONT_COLORS.secondary, MARGIN.ml8]}>Price</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.summaryData}>
          <Image style={styles.summaryDataBg} source={tab == "energy" ? ENERGY_BAR : PRICE_BAR} />
          <View style={styles.summaryDataValue}>
            {selectedBarGraphSelection == "1" &&
              <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>{tab == "price" ? "RM " : ""}{tab == "price" ? data.weeklyTotalBill.toFixed(2) : data.weeklyTotalPower.toFixed(2)}{tab == "energy" ? "Wh" : ""}</Text>
            }
            {selectedBarGraphSelection == "2" &&
              <Text style={[TYPOGRAPHY.h2, FONT_COLORS.secondary]}>{tab == "price" ? "RM " : ""}{tab == "price" ? data.monthlyTotalBill.toFixed(2) : data.monthlyTotalPower.toFixed(2)} {tab == "energy" ? "Wh" : ""}</Text>
            }
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{tab == "energy" ? "Energy Consumed" : "Price To Pay"}</Text>
          </View>
        </View>
        <View style={styles.barGraph}>
          <View style={styles.barGraphTitle}>
            <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{tab == "energy" ? "Energy Consumption" : "Price"}</Text>
            <SelectList
              data={barGraphSelection}
              defaultOption={{ key: '1', value: 'Weekly' }}
              boxStyles={styles.selectListBoxStyles}
              inputStyles={styles.selectListInputStyles}
              dropdownStyles={styles.selectListDropdownStyles}
              dropdownItemStyles={styles.selectListDropdownItemStyles}
              dropdownTextStyles={styles.selectListDropdownTextStyles}
              setSelected={(val) => setSelectedBarGraphSelection(val)}
              searchicon={<></>}
              search={false} />
          </View>
          <View style={{ marginTop: 16 }}>
            {selectedBarGraphSelection == "1" &&
              <LineChart
                data={{
                  labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                  datasets: [
                    {
                      data: tab == "price" ? data.weeklyBill : data.weeklyPower
                    }
                  ]
                }}
                width={Dimensions.get("window").width - 48} // from react-native
                height={180}
                withVerticalLines={false}
                yAxisLabel={tab == "price" ? 'RM ' : ""}
                yAxisSuffix={tab == "energy" ? ' Wh' : ""}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => tab == "energy" ? COLORS.primary : COLORS.loss,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: tab == "energy" ? COLORS.primary : COLORS.loss,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                bezier
                style={{
                  marginLeft: -16,
                }}
              />
            }
            {selectedBarGraphSelection == "2" &&
              <LineChart
                data={{
                  datasets: [
                    {
                      data: tab == "price" ? data.monthlyBill : data.monthlyPower
                    }
                  ]
                }}
                width={Dimensions.get("window").width - 48} // from react-native
                height={180}
                withVerticalLines={false}
                yAxisLabel={tab == "price" ? 'RM ' : ""}
                yAxisSuffix={tab == "energy" ? ' Wh' : ""}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => tab == "energy" ? COLORS.primary : COLORS.loss,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: tab == "energy" ? COLORS.primary : COLORS.loss,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                bezier
                style={{
                  marginLeft: -16,
                }}
              />
            }
          </View>
        </View>
        <View style={styles.allProperties}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12]}>Latest Events</Text>
          {latestEvents}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WallOutletData;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingTop: 24,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 32
  },
  tab: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    height: 42,
    marginHorizontal: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTab: {
    backgroundColor: COLORS.secondary,
  },
  summaryData: {
    height: 220,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryDataBg: {
    width: 220,
    height: 220,
    position: "absolute",
  },
  summaryDataValue: {
    marginTop: -5,
    alignItems: "center"
  },
  barGraph: {
    marginTop: -16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 16,
  },
  barGraphTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 9
  },
  selectListBoxStyles: {
    borderRadius: 8,
    backgroundColor: "#E6E6E6",
    borderWidth: 0,
    position: "relative",
    width: 80,
    height: 26,
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 4,
  },
  selectListInputStyles: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
  },
  selectListDropdownStyles: {
    borderWidth: 0,
    backgroundColor: "#E6E6E6",
    borderRadius: 8,
    width: 80,
    position: "absolute",
    top: "100%",
    right: 0,
    paddingVertical: -6
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
  pieChart: {
    position: 'relative'
  },
  pieChartLegend: {
    height: "100%",
    width: "40%",
    position: "absolute",
    top: 0,
    right: 10,
    justifyContent: "center",
    padding: 16,
    alignItems: "flex-start"
  },
  singlePieChartLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  singlePieChartLegendIcon: {
    width: 20,
    height: 20,
    borderRadius: 8,
  },
  allProperties: {
    marginBottom: 24,
    marginTop: 24,
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
    alignItems: "flex-start"
  },
  listItemInfoDesc: {
    flexDirection: "row",
    alignItems: "center"
  }
})