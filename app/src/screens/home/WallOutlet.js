import React from 'react';
import { StyleSheet, Text, Image, View, SafeAreaView, ScrollView, TouchableWithoutFeedback, Animated as RNAnimated, FlatList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Icon } from '../../components/Icon';
import { Switch } from '../../components/Switch';
import Modal from "react-native-modal";
import { PLUG, UNPLUG } from '../../../assets/images';

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { COLORS, FONT_COLORS, FONTS, MARGIN, PADDING, TYPOGRAPHY, WINDOW_WIDTH, BACKGROUND_COLORS, WINDOW_HEIGHT } from '../../constants';
import { ROUTES } from '../../routes';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const authToken = new AuthToken();

const timerHour = [...Array(24).keys()];
const timerMinute = [...Array(60).keys()];
const itemSize = 30;

const WallOutlet = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const H_SWIPE_RANGE = WINDOW_WIDTH - 32 - 32 - 64 - 16 - 42;
  const X = useSharedValue(0);

  const handleComplete = () => {
    switchWallOutlet(wallOutlet.id, wallOutlet.state == 0)
    getWallOutlet();
    route.params.refreshQA();
    if (route.params.refresh) {
      route.params.refresh();
    }
    setTimeout(() => {
      X.value = 0;
    }, 1000);
  };
  const animatedGestureHandler = useAnimatedGestureHandler({
    onActive: (e) => {
      let newValue;
      newValue = e.translationX;

      if (newValue >= 0 && newValue <= H_SWIPE_RANGE) {
        X.value = newValue;
      }
    },
    onEnd: () => {
      if (X.value < (WINDOW_WIDTH - 32 - 32 - 64 - 16) / 2 - 42 / 2) {
        X.value = withSpring(0);
      } else {
        X.value = withSpring(WINDOW_WIDTH - 32 - 32 - 64 - 16 - 42);
        runOnJS(handleComplete)();
      }
    }
  });
  const InterpolateXInput = [0, H_SWIPE_RANGE];
  const AnimatedStyles = {
    colorWave: useAnimatedStyle(() => {
      return {
        width: 42 + 32 + X.value,

        opacity: interpolate(X.value, InterpolateXInput, [0, 1]),
      };
    }),
    swipeable: useAnimatedStyle(() => {
      return {
        transform: [{ translateX: X.value }]
      }
    }),
    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          X.value,
          InterpolateXInput,
          [0.7, 0],
          Extrapolate.CLAMP,
        ),
        transform: [
          {
            translateX: interpolate(
              X.value,
              InterpolateXInput,
              [0, (H_SWIPE_RANGE + 42 + 32) / 2 - 42],
              Extrapolate.CLAMP,
            ),
          },
        ],
      };
    })
  }

  const [isModalVisible, setModalVisible] = React.useState(false);
  const showModal = () => {
    setModalVisible(true);
  };
  const hideModal = () => {
    setModalVisible(false);
  };

  const [isModalWarningVisible, setModalWarningVisible] = React.useState(false);
  const showModalWarning = () => {
    setModalWarningVisible(true);
  };
  const hideModalWarning = async (decision, id) => {
    try {
      if (decision) {
        let auth_token = await authToken.getToken();
        let result;
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/on/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
        let response = result.data;
        if (!response.error) {
          getWallOutlet();
        }
      }
    } catch (err) {
      return;
    }
    setModalWarningVisible(false);
  };

  const [wallOutlet, setWallOutlet] = React.useState({});
  const [isCountdowning, setIsCountdowning] = React.useState("ON");
  const [schedules, setSchedules] = React.useState([]);
  const [realTimeInterval, setRealTimeInterval] = React.useState(null);

  const [rotateAnimProgress, setRotateAnimProgress] = React.useState(0);
  const [countDownHour, setCountDownHour] = React.useState(0);
  const [countDownMin, setCountDownMin] = React.useState(1);
  const [countDownSec, setCountDownSec] = React.useState(10);
  let hourglassAnimation = () => {
    setInterval(() => {
      if (isCountdowning) {
        setCountDownSec(current => {
          if (current == 0) {
            setCountDownMin(current => {
              if (current == 0) {
                setCountDownHour(current => {
                  if (current == 0) {
                    countDownEnd();
                    return 0;
                  } else {
                    return --current;
                  }
                });
                return 59;
              } else {
                return --current;
              }
            });
            return 59;
          } else {
            return --current;
          }
        });
        setRotateAnimProgress((current) => {
          if (current == 2) {
            return 0;
          } else {
            return ++current;
          }
        });
      }
    }, 1000);
  }

  let cancelCountdown = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.delete('http://10.0.2.2:5000/api/task-schedules/countdown/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;
      if (!response.error) {
        getWallOutlet();
      }
    } catch (err) {
      return;
    }
  }

  let countDownEnd = () => {
    getWallOutlet();
    route.params.refreshQA();
    if (route.params.refresh) {
      route.params.refresh();
    }
  }

  let changeScheduleState = async (isOn, scheduleId, wall_outlet_id, wall_outlet_identifier) => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.put(
        'http://10.0.2.2:5000/api/wall-outlets/schedules/' + scheduleId,
        {
          status: isOn ? "1" : "0",
          wall_outlet_id,
          wall_outlet_identifier
        },
        { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        getWallOutlet();
      }
    } catch (err) {
      return;
    }
  }

  let getWallOutlet = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      console.log(response.data);
      if (!response.error) {
        let schedules = []
        response.data.schedules.map((item) => {
          schedules.push(
            <View style={styles.singleSchedule} key={item.id}>
              <View style={styles.scheduleTime}>
                <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>From</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mx8]}>{item.start_time.slice(0, 5)}</Text>
                <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray]}>To</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mx8]}>{item.end_time.slice(0, 5)}</Text>
                <TouchableWithoutFeedback onPress={() => {
                  navigation.navigate(ROUTES.SCHEDULE, {
                    item,
                    wallOutletId: response.data.id,
                    wallOutletName: response.data.wall_outlet_name,
                    wallOutletIdentifier: response.data.wall_outlet_identifier,
                    refresh: getWallOutlet
                  })
                }}>
                  <View style={{ marginLeft: 8, marginTop: -4 }}>
                    <FontAwesomeIcon icon="pencil" color={COLORS.secondary} size={14} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Switch defaultState={item.status} onChanged={(isOn) => {
                  changeScheduleState(isOn, item.id, response.data.id, response.data.wall_outlet_identifier);
                }}></Switch>
              </View>
            </View>
          )
        });
        setSchedules(schedules);
        if (response.data.countdown) {
          const date = new Date();
          const timestamp = date.getTime();
          let timeDiff = Math.floor((response.data.countdownTime - timestamp) / 1000);
          setCountDownHour(Math.floor(timeDiff / 60 / 60));
          setCountDownMin(Math.floor(timeDiff / 60));
          setCountDownSec(timeDiff % 60);
        }
        setIsCountdowning(response.data.countdown);
        setWallOutlet(response.data);

        navigation.setOptions({
          headerRight: () => (
            <TouchableWithoutFeedback onPress={() => {
              changeQuickAccess(response.data.id, response.data.quick_access);
            }}>
              <View style={styles.save}>
                <Icon icon="heart" iconColor={response.data.quick_access == 1 ? COLORS.loss : COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
              </View>
            </TouchableWithoutFeedback>
          ),
        });
      }
    } catch (err) {
      return;
    }
  };

  let getWallOutletRealTime = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.get('http://10.0.2.2:5000/api/wall-outlets/' + route.params.id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        setWallOutlet(response.data);

        navigation.setOptions({
          headerRight: () => (
            <TouchableWithoutFeedback onPress={() => {
              changeQuickAccess(response.data.id, response.data.quick_access);
            }}>
              <View style={styles.save}>
                <Icon icon="heart" iconColor={response.data.quick_access == 1 ? COLORS.loss : COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
              </View>
            </TouchableWithoutFeedback>
          ),
        });
      }
    } catch (err) {
      return;
    }
  };

  let addSchedule = async () => {
    try {
      let auth_token = await authToken.getToken();
      let result = await axios.post(
        'http://10.0.2.2:5000/api/wall-outlets/schedules',
        {
          wall_outlet_id: route.params.id,
          start_time: "00:00:00",
          end_time: "12:00:00"
        },
        { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        getWallOutlet();
      }
    } catch (err) {
      return;
    }
  }

  let switchWallOutlet = async (id, state) => {
    try {
      let auth_token = await authToken.getToken();
      let result;
      if (state) {
        if (wallOutlet.warning == "1") {
          showModalWarning();
        } else {
          result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/on/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
        }
      } else {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/off/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      }
      let response = result.data;
      if (!response.error) {
        getWallOutlet();
      }
    } catch (err) {
      return;
    }
  };

  let changeQuickAccess = async (id, quick_access) => {
    try {
      let auth_token = await authToken.getToken();
      let result;
      if (quick_access == 1) {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/unset-quick-access/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      } else {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/set-quick-access/' + id, { headers: { "Authorization": `Bearer ${auth_token}` } });
      }
      let response = result.data;
      if (!response.error) {
        getWallOutlet();
        route.params.refreshQA();
        showModal();
      }
    } catch (err) {
      return;
    }
  }

  const styles = getStyles(wallOutlet);

  React.useEffect(() => {
    hourglassAnimation();
    getWallOutlet();
    let myInterval = setInterval(() => {
      getWallOutletRealTime();
    }, 12000)
    setRealTimeInterval(myInterval);

    return () => {
      clearInterval(realTimeInterval);
      clearInterval(myInterval);
      console.log(123);
    }
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={PADDING.p16}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Quick access updated successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <Modal isVisible={isModalWarningVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Are you sure to turn on?</Text>
              <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Wall outlet has not load on it.</Text>
              <View style={{ flexDirection: "row" }}>
                <View style={[MARGIN.mr16]}>
                  <TouchableWithoutFeedback onPress={() => {
                    hideModalWarning(false, wallOutlet.id)
                  }}>
                    <Text style={[TYPOGRAPHY.h5, FONT_COLORS.loss]}>No</Text>
                  </TouchableWithoutFeedback>
                </View>
                <TouchableWithoutFeedback onPress={() => {
                  hideModalWarning(true, wallOutlet.id)
                }}>
                  <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>Yes</Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.wallOutletImageSection}>
          <View style={styles.wallOutletImage}>
            <Image source={wallOutlet.state == 0 ? UNPLUG : PLUG} style={{ width: "75%", marginLeft: 16 }} resizeMode="contain" />
          </View>
          <View style={styles.wallOutletRealTimeData}>
            <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb8]}>Real Time</Text>
            <View style={styles.realTimeData}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>Power</Text>
              {wallOutlet.state == 0 &&
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.drakGray]}>Not in use</Text>
              }
              {wallOutlet.state == 1 &&
                <Text style={[TYPOGRAPHY.h3, FONT_COLORS.primary]}>{Number(wallOutlet.power).toFixed(3)}W</Text>
              }
              <View style={styles.breakLine}></View>
            </View>
            <View style={styles.realTimeData}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>Current</Text>
              {wallOutlet.state == 0 &&
                <Text style={[TYPOGRAPHY.h4, FONT_COLORS.drakGray]}>Not in use</Text>
              }
              {wallOutlet.state == 1 &&
                <Text style={[TYPOGRAPHY.h3, FONT_COLORS.profit]}>{Number(wallOutlet.current).toFixed(3)}A</Text>
              }
              <View style={styles.breakLine}></View>
            </View>
            <View style={styles.realTimeData}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.secondary]}>Bill</Text>
              <Text style={[TYPOGRAPHY.h3, FONT_COLORS.loss]}>RM {Number(wallOutlet.bill).toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <View style={MARGIN.mt16}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12]}>Energy Consumption Alert</Text>
          <View style={styles.alertButtonRow}>
            <View style={styles.alertButton}>
              <View style={styles.alertLevelTitle}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>Daily</Text>
                <TouchableWithoutFeedback onPress={() =>
                  navigation.navigate(ROUTES.ALERT, {
                    wallOutletId: wallOutlet.id,
                    wallOutletName: wallOutlet.wall_outlet_name,
                    wallOutletIsDaily: true,
                    warning: wallOutlet.daily_warning_value,
                    stop: wallOutlet.daily_stop_value,
                    refresh: getWallOutlet
                  })
                }>
                  <View>
                    <FontAwesomeIcon icon="pencil" color={COLORS.secondary} size={14} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.alertLevelValue}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary, MARGIN.mr8]}>Warning</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{wallOutlet.daily_warning_value ? "RM" + wallOutlet.daily_warning_value : "Unset"}</Text>
              </View>
              <View style={styles.alertLevelValue}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.loss, MARGIN.mr8]}>Force Stop</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{wallOutlet.daily_stop_value ? "RM" + wallOutlet.daily_stop_value : "Unset"}</Text>
              </View>
            </View>
            <View style={styles.alertButton}>
              <View style={styles.alertLevelTitle}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>Monthly</Text>
                <TouchableWithoutFeedback onPress={() =>
                  navigation.navigate(ROUTES.ALERT, {
                    wallOutletId: wallOutlet.id,
                    wallOutletName: wallOutlet.wall_outlet_name,
                    wallOutletIsDaily: false,
                    warning: wallOutlet.monthly_warning_value,
                    stop: wallOutlet.monthly_stop_value,
                    refresh: getWallOutlet
                  })
                }>
                  <View>
                    <FontAwesomeIcon icon="pencil" color={COLORS.secondary} size={14} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.alertLevelValue}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary, MARGIN.mr8]}>Warning</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{wallOutlet.monthly_warning_value ? "RM" + wallOutlet.monthly_warning_value : "Unset"}</Text>
              </View>
              <View style={styles.alertLevelValue}>
                <Text style={[TYPOGRAPHY.h6, FONT_COLORS.loss, MARGIN.mr8]}>Force Stop</Text>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{wallOutlet.monthly_stop_value ? "RM" + wallOutlet.monthly_stop_value : "Unset"}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.scheduleArea}>
          <View style={[styles.allSchedules, MARGIN.mb16]}>
            <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary]}>Schedules</Text>
            <TouchableWithoutFeedback onPress={() => {
              addSchedule()
            }}>
              <Text style={[TYPOGRAPHY.h6, FONT_COLORS.primary]}>+ Add Schedule</Text>
            </TouchableWithoutFeedback>
          </View>
          {schedules}
        </View>
      </ScrollView>
      <View style={styles.wallOutletControl}>
        {!isCountdowning &&
          <>
            <View style={styles.slideControl}>
              <Animated.View
                style={[AnimatedStyles.colorWave, styles.colorWave]}
              />
              <PanGestureHandler onGestureEvent={animatedGestureHandler}>
                <Animated.View style={[styles.slideButton, AnimatedStyles.swipeable]}>
                  <Icon icon="power-off" iconColor={COLORS.white} bgColor={wallOutlet.state == 1 ? BACKGROUND_COLORS.loss : BACKGROUND_COLORS.profit} size="medium" />
                </Animated.View>
              </PanGestureHandler>
              <Animated.Text style={[MARGIN.ml24, TYPOGRAPHY.body, FONT_COLORS.drakGray, styles.swipeText, AnimatedStyles.swipeText]}>Slide To Switch {wallOutlet.state == 1 ? "Off" : "On"} &#x3e;&#x3e;&#x3e;</Animated.Text>
            </View>
            <TouchableWithoutFeedback onPress={() =>
              navigation.navigate(ROUTES.COUNTDOWN, {
                wallOutletId: wallOutlet.id,
                wallOutletName: wallOutlet.wall_outlet_name,
                wallOutletIdentifier: wallOutlet.wall_outlet_identifier,
                wallOutletIsOn: wallOutlet.state == 1,
                refresh: getWallOutlet
              })
            }>
              <View style={MARGIN.ml16}>
                <Icon icon="clock" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="large" />
              </View>
            </TouchableWithoutFeedback>
          </>
        }
        {isCountdowning &&
          <>
            <View style={[styles.slideControl, BACKGROUND_COLORS.lightGray]}>
              <View style={PADDING.pl12}>
                {
                  rotateAnimProgress == 0 &&
                  <FontAwesomeIcon icon="hourglass-start" color={isCountdowning == "ON" ? COLORS.profit : COLORS.loss} size={18} />
                }
                {
                  rotateAnimProgress == 1 &&
                  <FontAwesomeIcon icon="hourglass-half" color={isCountdowning == "ON" ? COLORS.profit : COLORS.loss} size={18} />
                }
                {
                  rotateAnimProgress == 2 &&
                  <FontAwesomeIcon icon="hourglass-end" color={isCountdowning == "ON" ? COLORS.profit : COLORS.loss} size={18} />
                }
              </View>
              {isCountdowning == "ON" &&
                <View style={styles.countdownText}>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary]}>Turn on in</Text>
                  {
                    countDownHour != 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownHour} hour</Text>
                  }
                  {
                    countDownMin != 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownMin} min</Text>
                  }
                  {
                    countDownHour == 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownSec} sec</Text>
                  }
                </View>
              }
              {isCountdowning == "OFF" &&
                <View style={styles.countdownText}>
                  <Text style={[TYPOGRAPHY.body, FONT_COLORS.secondary]}>Switch Off in</Text>
                  {
                    countDownHour != 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownHour} hour</Text>
                  }
                  {
                    countDownMin != 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownMin} min</Text>
                  }
                  {
                    countDownHour == 0 &&
                    <Text style={[FONT_COLORS.secondary, TYPOGRAPHY.h5, MARGIN.ml4]}>{countDownSec} sec</Text>
                  }
                </View>
              }
            </View>
            <TouchableWithoutFeedback onPress={() =>
              cancelCountdown()
            }>
              <View style={MARGIN.ml16}>
                <Icon icon="xmark" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="large" />
              </View>
            </TouchableWithoutFeedback>
          </>
        }
      </View>
    </SafeAreaView>
  );
};

export default WallOutlet;

const getStyles = (wallOutlet) => StyleSheet.create({
  save: {
    right: 16,
    top: 8,
    zIndex: 999
  },
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  wallOutletImageSection: {
    flexDirection: "row",
    marginVertical: 16,
  },
  wallOutletImage: {
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  wallOutletRealTimeData: {
    minWidth: 100,
  },
  realTimeData: {
    paddingTop: 10,
    paddingBottom: 6,
    position: "relative"
  },
  breakLine: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    height: 1,
    backgroundColor: COLORS.lightGray
  },
  alertButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  alertButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
  },
  alertLevelTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  alertLevelValue: {
    flexDirection: "row",
  },
  scheduleArea: {
    marginTop: 8,
    marginBottom: 108,
  },
  allSchedules: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  singleSchedule: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center"
  },
  wallOutletControl: {
    position: "absolute",
    width: "100%",
    height: 88,
    flexDirection: "row",
    left: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    zIndex: 999
  },
  slideControl: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    flexGrow: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  colorWave: {
    position: 'absolute',
    left: 0,
    height: 42 + 20,
    borderRadius: 16,
    backgroundColor: wallOutlet.state == 1 ? COLORS.loss : COLORS.profit
  },
  slideButton: {
    position: "absolute",
    left: 16,
    zIndex: 3,
  },
  swipeText: {
    alignSelf: 'center',
    zIndex: 2,
  },
  modalBox: {
    flex: 0.4,
    flexDirection: "row",
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    position: "relative",
    paddingHorizontal: 16
  },
  timerStyles: {
    marginRight: 80,
    width: 120,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  timerList: {
    width: 30,
    height: 170,
  },
  timerListMinute: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray,
  },
  countdownText: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center'
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