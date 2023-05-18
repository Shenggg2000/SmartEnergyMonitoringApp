import { StyleSheet, Text, View, SafeAreaView, ScrollView, Image, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../../components/Icon';
import React from 'react';
import { COLORS, FONTS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { SelectList } from 'react-native-dropdown-select-list';
import { LineChart, PieChart } from "react-native-chart-kit";
import { ENERGY_BAR, PRICE_BAR } from '../../../assets/images';
import { ROUTES } from '../../routes';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const RoomData = () => {
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
    ratio: {
      weekly: [],
      monthly: []
    },
  });

  const [wallOutlets, setWallOutlets] = React.useState([]);

  const [weeklyPowerPie, setWeeklyPowerPie] = React.useState([]);
  const [weeklyBillPie, setWeeklyBillPie] = React.useState([]);
  const [monthlyPowerPie, setMonthlyPowerPie] = React.useState([]);
  const [monthlyBillPie, setMonthlyBillPie] = React.useState([]);

  const [weeklyPowerPieLegend, setWeeklyPowerPieLegend] = React.useState([]);
  const [weeklyBillPieLegend, setWeeklyBillPieLegend] = React.useState([]);
  const [monthlyPowerPieLegend, setMonthlyPowerPieLegend] = React.useState([]);
  const [monthlyBillPieLegend, setMonthlyBillPieLegend] = React.useState([]);

  const [weeklyPowerIsNoPie, setWeeklyPowerIsNoPie] = React.useState([]);
  const [weeklyBillIsNoPie, setWeeklyBillIsNoPie] = React.useState([]);
  const [monthlyPowerIsNoPie, setMonthlyPowerIsNoPie] = React.useState([]);
  const [monthlyBillIsNoPie, setMonthlyBillIsNoPie] = React.useState([]);

  const barGraphSelection = [
    { key: '1', value: 'Weekly' },
    { key: '2', value: 'Monthly' },
  ]

  let getWallOutlets = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets?room_id=' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        getData(response.data);
      }
    } catch (err) {
      return;
    }
  };

  let getWallOutletsList = (wallOutletsData, pie1, pie2, pie3, pie4) => {
    let wallOutlets = []
    wallOutletsData.map((item) => {
      wallOutlets.push(
        <TouchableWithoutFeedback key={item.id} onPress={() =>
          navigation.navigate(ROUTES.WALL_OUTLET_DATA, {
            wallOutletName: item.wall_outlet_name,
            id: item.id
          })
        }>
          <View style={styles.listItem}>
            <View style={styles.listItemInfo}>
              <View style={MARGIN.mr12}>
                <Icon icon="couch" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.secondary} size="medium">
                </Icon>
              </View>
              <View>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{item.wall_outlet_name}</Text>
                <View style={styles.listItemInfoDesc}>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>{tab == "energy" ? "Energy Consumed: " : "Price To Pay: "}</Text>
                  {selectedBarGraphSelection == "1" && tab == "price" &&
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.loss]}>RM{getUsage(item.id, pie2, "bill").toFixed(2)}</Text>
                  }
                  {selectedBarGraphSelection == "1" && tab == "energy" &&
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary]}>{getUsage(item.id, pie1, "power").toFixed(2)}Wh</Text>
                  }
                  {selectedBarGraphSelection == "2" && tab == "price" &&
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.loss]}>RM{getUsage(item.id, pie4, "bill").toFixed(2)}</Text>
                  }
                  {selectedBarGraphSelection == "2" && tab == "energy" &&
                    <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary]}>{getUsage(item.id, pie3, "power").toFixed(2)}Wh</Text>
                  }
                </View>
              </View>
            </View>
            <FontAwesomeIcon icon="chevron-right" color={COLORS.secondary} size={16} style={MARGIN.mr4} />
          </View>
        </TouchableWithoutFeedback>
      )
    });
    setWallOutlets(wallOutlets)
  }

  let getData = async (wallOutletsData) => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/rooms/usage/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        let pieChartColor = ["#5396FE", "#97C0FE", "#DCEAFE"]

        let weeklyPowerPie = [];
        let weeklyPowerPieTemp = [];
        let weeklyPowerData = JSON.parse(JSON.stringify(response.data.ratio.weekly));
        weeklyPowerData.sort((a, b) => b.power - a.power);
        if (weeklyPowerData.length > 2) {
          weeklyPowerPieTemp = weeklyPowerData.slice(0, weeklyPowerData.length > 2 ? 2 : weeklyPowerData.length);
          const sum = weeklyPowerData.slice(2).reduce((acc, cur) => acc + cur.power, 0);
          weeklyPowerPieTemp.push({ bill: null, id: 0, power: sum });
        } else {
          weeklyPowerPieTemp = weeklyPowerData;
        }
        for (let i = 0; i < weeklyPowerPieTemp.length; i++) {
          weeklyPowerPie.push({
            name: weeklyPowerPieTemp[i].id,
            usage: weeklyPowerPieTemp[i].power,
            color: pieChartColor[i]
          });
        }

        let weeklyBillPie = [];
        let weeklyBillPieTemp = [];
        let weeklyBillData = JSON.parse(JSON.stringify(response.data.ratio.weekly));
        weeklyBillData.sort((a, b) => b.bill - a.bill);
        if (weeklyBillData.length > 2) {
          weeklyBillPieTemp = weeklyBillData.slice(0, weeklyBillData.length > 2 ? 2 : weeklyBillData.length);
          const sum = weeklyBillData.slice(2).reduce((acc, cur) => acc + cur.bill, 0);
          weeklyBillPieTemp.push({ power: null, id: 0, bill: sum });
        } else {
          weeklyBillPieTemp = weeklyBillData;
        }
        for (let i = 0; i < weeklyBillPieTemp.length; i++) {
          weeklyBillPie.push({
            name: weeklyBillPieTemp[i].id,
            usage: weeklyBillPieTemp[i].bill,
            color: pieChartColor[i]
          });
        }

        let monthlyPowerPie = [];
        let monthlyPowerPieTemp = [];
        let monthlyPowerData = JSON.parse(JSON.stringify(response.data.ratio.monthly));
        monthlyPowerData.sort((a, b) => b.power - a.power);
        if (monthlyPowerData.length > 2) {
          monthlyPowerPieTemp = monthlyPowerData.slice(0, monthlyPowerData.length > 2 ? 2 : monthlyPowerData.length);
          const sum = monthlyPowerData.slice(2).reduce((acc, cur) => acc + cur.power, 0);
          monthlyPowerPieTemp.push({ bill: null, id: 0, power: sum });
        } else {
          monthlyPowerPieTemp = monthlyPowerData;
        }
        for (let i = 0; i < monthlyPowerPieTemp.length; i++) {
          monthlyPowerPie.push({
            name: monthlyPowerPieTemp[i].id,
            usage: monthlyPowerPieTemp[i].power,
            color: pieChartColor[i]
          });
        }

        let monthlyBillPie = [];
        let monthlyBillPieTemp = [];
        let monthlyBillData = JSON.parse(JSON.stringify(response.data.ratio.monthly));
        monthlyBillData.sort((a, b) => b.bill - a.bill);
        if (monthlyBillData.length > 2) {
          monthlyBillPieTemp = monthlyBillData.slice(0, monthlyBillData.length > 2 ? 2 : monthlyBillData.length);
          const sum = monthlyBillData.slice(2).reduce((acc, cur) => acc + cur.bill, 0);
          monthlyBillPieTemp.push({ power: null, id: 0, bill: sum });
        } else {
          monthlyBillPieTemp = monthlyBillData;
        }
        for (let i = 0; i < monthlyBillPieTemp.length; i++) {
          monthlyBillPie.push({
            name: monthlyBillPieTemp[i].id,
            usage: monthlyBillPieTemp[i].bill,
            color: pieChartColor[i]
          });
        }

        setData(response.data);

        setWeeklyPowerPie(weeklyPowerPie);
        setWeeklyBillPie(weeklyBillPie);
        setMonthlyPowerPie(monthlyPowerPie);
        setMonthlyBillPie(monthlyBillPie);

        setWeeklyPowerPieLegend(legendCreator(weeklyPowerPie, wallOutletsData));
        setWeeklyBillPieLegend(legendCreator(weeklyBillPie, wallOutletsData));
        setMonthlyPowerPieLegend(legendCreator(monthlyPowerPie, wallOutletsData));
        setMonthlyBillPieLegend(legendCreator(monthlyBillPie, wallOutletsData));

        setWeeklyPowerIsNoPie(noPieDetector(weeklyPowerPie));
        setWeeklyBillIsNoPie(noPieDetector(weeklyBillPie));
        setMonthlyPowerIsNoPie(noPieDetector(monthlyPowerPie));
        setMonthlyBillIsNoPie(noPieDetector(monthlyBillPie));

        getWallOutletsList(wallOutletsData, weeklyPowerData, weeklyBillData, monthlyPowerData, monthlyBillData);
      }
    } catch (err) {
      return;
    }
  };

  let noPieDetector = (pie = []) => {
    let filteredPie = pie.filter(item => item.usage > 0);
    return filteredPie.length == 0 ? true : false;
  }

  let legendCreator = (pie = [], wallOutletsData) => {
    let returnArray = [];
    pie.map(item => {
      if (item.name != 0) {
        let wallOutlet = wallOutletsData.find(obj => obj.id == item.name)
        returnArray.push(
          <View style={styles.singlePieChartLegend} key={wallOutlet.id}>
            <View style={[styles.singlePieChartLegendIcon, { backgroundColor: item.color }]}></View>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.ml8]}>{wallOutlet.wall_outlet_name ? wallOutlet.wall_outlet_name : ""}</Text>
          </View>
        )
      }else{
        returnArray.push(
          <View style={styles.singlePieChartLegend} key="Other">
            <View style={[styles.singlePieChartLegendIcon, { backgroundColor: item.color }]}></View>
            <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary, MARGIN.ml8]}>Other</Text>
          </View>
        )
      }
    })
    return returnArray;
  }

  let getUsage = (id, pie, type) => {
    let usage = 0;
    let found = pie.find(item => item.id == id);
    usage = found[type];
    return usage;
  }

  React.useEffect(() => {
    getWallOutlets();
  }, []);

  React.useEffect(() => {
    getWallOutlets();
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
        <View style={[MARGIN.mt20, MARGIN.mb20, styles.pieChart]}>
          {selectedBarGraphSelection == "1" && tab == "price" && !weeklyBillIsNoPie &&
            <>
              <PieChart
                data={weeklyBillPie}
                width={Dimensions.get("window").width - 32}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => COLORS.primary,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: COLORS.primary,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                accessor={"usage"}
                backgroundColor={"transparent"}
                paddingLeft={"30"}
                absolute={false}
                hasLegend={false}
              />
              <View style={styles.pieChartLegend}>
                {weeklyBillPieLegend}
              </View>
            </>
          }
          {selectedBarGraphSelection == "1" && tab == "price" && weeklyBillIsNoPie &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No usage found for pie chart.</Text>
          }
          {selectedBarGraphSelection == "1" && tab == "energy" && !weeklyPowerIsNoPie &&
            <>
              <PieChart
                data={weeklyPowerPie}
                width={Dimensions.get("window").width - 32}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => COLORS.primary,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: COLORS.primary,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                accessor={"usage"}
                backgroundColor={"transparent"}
                paddingLeft={"30"}
                absolute={false}
                hasLegend={false}
              />
              <View style={styles.pieChartLegend}>
                {weeklyPowerPieLegend}
              </View>
            </>
          }
          {selectedBarGraphSelection == "1" && tab == "energy" && weeklyPowerIsNoPie &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No usage found for pie chart.</Text>
          }
          {selectedBarGraphSelection == "2" && tab == "price" && !monthlyBillIsNoPie &&
            <>
              <PieChart
                data={monthlyBillPie}
                width={Dimensions.get("window").width - 32}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => COLORS.primary,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: COLORS.primary,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                accessor={"usage"}
                backgroundColor={"transparent"}
                paddingLeft={"30"}
                absolute={false}
                hasLegend={false}
              />
              <View style={styles.pieChartLegend}>
                {monthlyBillPieLegend}
              </View>
            </>
          }
          {selectedBarGraphSelection == "2" && tab == "price" && monthlyBillIsNoPie &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No usage found for pie chart.</Text>
          }
          {selectedBarGraphSelection == "2" && tab == "energy" && !monthlyPowerIsNoPie &&
            <>
              <PieChart
                data={monthlyPowerPie}
                width={Dimensions.get("window").width - 32}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: COLORS.lightGray,
                  backgroundGradientTo: COLORS.lightGray,
                  fillShadowGradientFromOpacity: 0.4,
                  fillShadowGradientToOpacity: 0,
                  decimalPlaces: 0, // optional, defaults to 2dp
                  color: () => COLORS.primary,
                  labelColor: () => COLORS.secondary,
                  strokeWidth: 1.5,
                  propsForDots: {
                    r: "5",
                    fill: COLORS.primary,
                  },
                  propsForBackgroundLines: {
                    stroke: "#2C2F424D"
                  },
                  propsForLabels: {
                    fontWeight: "500"
                  }
                }}
                accessor={"usage"}
                backgroundColor={"transparent"}
                paddingLeft={"30"}
                absolute={false}
                hasLegend={false}
              />
              <View style={styles.pieChartLegend}>
                {monthlyPowerPieLegend}
              </View>
            </>
          }
          {selectedBarGraphSelection == "2" && tab == "energy" && monthlyPowerIsNoPie &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb16]}>No usage found for pie chart.</Text>
          }
        </View>
        <View style={styles.allProperties}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12]}>All Wall Outlets</Text>
          {wallOutlets}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RoomData;

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
    marginBottom: 24
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
  listItemInfoDesc: {
    flexDirection: "row",
    alignItems: "center"
  }
})