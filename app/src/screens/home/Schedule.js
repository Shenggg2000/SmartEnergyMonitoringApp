import { StyleSheet, Text, View, SafeAreaView, FlatList, Animated, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { COLORS, FONT_COLORS, MARGIN, PADDING, TYPOGRAPHY, FONTS, BACKGROUND_COLORS, WINDOW_WIDTH } from '../../constants';
import { Icon } from '../../components/Icon';
import Modal from "react-native-modal";

import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();

const timerHour = [...Array(24).keys()];
const timerMinute = [...Array(60).keys()];
const itemSize = 30;

const Schedule = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [refStartHour, setRefStartHour] = React.useState(null);
  const [refStartMinute, setRefStartMinute] = React.useState(null);
  const startHourScroll = React.useRef(new Animated.Value(0)).current;
  const startMinuteScroll = React.useRef(new Animated.Value(0)).current;
  const [durationStartHour, setDurationStartHour] = React.useState(timerHour[0]);
  const [durationStartMinute, setDurationStartMinute] = React.useState(timerMinute[0]);

  const [refEndHour, setRefEndHour] = React.useState(null);
  const [refEndMinute, setRefEndMinute] = React.useState(null);
  const endHourScroll = React.useRef(new Animated.Value(0)).current;
  const endMinuteScroll = React.useRef(new Animated.Value(0)).current;
  const [durationEndHour, setDurationEndHour] = React.useState(timerHour[0]);
  const [durationEndMinute, setDurationEndMinute] = React.useState(timerMinute[0]);

  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh();
    navigation.goBack();
  };

  let changeScheduleTime = async () => {
    try {
      let data = {
        start_time: `${String(durationStartHour).padStart(2, '0')}:${String(durationStartMinute).padStart(2, '0')}:00`,
        end_time: `${String(durationEndHour).padStart(2, '0')}:${String(durationEndMinute).padStart(2, '0')}:00`,
        wall_outlet_id: route.params.wallOutletId,
        wall_outlet_identifier: route.params.wallOutletIdentifier
      }
      console.log(data);
      let auth_token = await authToken.getToken();
      let result = await axios.put(
        'http://10.0.2.2:5000/api/wall-outlets/schedules/' + route.params.item.id,
        data,
        { headers: { "Authorization": `Bearer ${auth_token}` } });
      let response = result.data;

      if (!response.error) {
        showModal();
      }
    } catch (err) {
      return;
    }
  }

  let init = () => {
    let startTime = route.params.item.start_time;
    let startTimeHour = parseInt(startTime.slice(0, 2));
    let startTimeMinute = parseInt(startTime.slice(3, 5));

    let endTime = route.params.item.end_time;
    let endTimeHour = parseInt(endTime.slice(0, 2));
    let endTimeMinute = parseInt(endTime.slice(3, 5));

    refStartHour?.scrollToOffset({
      animated: false,
      offset: startTimeHour * (itemSize + 4),
    })
    refStartMinute?.scrollToOffset({
      animated: false,
      offset: startTimeMinute * (itemSize + 4),
    })
    setDurationStartHour(startTimeHour);
    setDurationStartMinute(startTimeMinute);

    refEndHour?.scrollToOffset({
      animated: false,
      offset: endTimeHour * (itemSize + 4),
    })
    refEndMinute?.scrollToOffset({
      animated: false,
      offset: endTimeMinute * (itemSize + 4),
    })
    setDurationEndHour(endTimeHour);
    setDurationEndMinute(endTimeMinute);

    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          changeScheduleTime();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });
  }

  React.useEffect(() => {
    init();
  }, [refStartHour]);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Schedule updated successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.profit]}>Turn ON</Text>
        </View>
        <View style={styles.timerStyles}>
          <Animated.FlatList
            initialNumToRender={24}
            data={timerHour}
            ref={(ref) => { setRefStartHour(ref); }}
            keyExtractor={item => item.toString()}
            style={styles.timerList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 68
            }}
            decelerationRate="fast"
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.y / (itemSize + 4)
              )
              refStartHour.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationStartHour(timerHour[index]);
              navigation.setOptions({
                headerRight: () => (
                  <TouchableWithoutFeedback onPress={() => {
                    changeScheduleTime();
                  }}>
                    <View style={styles.save}>
                      <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                    </View>
                  </TouchableWithoutFeedback>
                ),
              });
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: startHourScroll } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * (itemSize + 4),
                (index - 1) * (itemSize + 4),
                index * (itemSize + 4),
                (index + 1) * (itemSize + 4),
                (index + 2) * (itemSize + 4)
              ];

              const opacity = startHourScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = startHourScroll.interpolate({
                inputRange,
                outputRange: [.7, .7, 1, .7, .7]
              })
              return <View style={{
                height: itemSize,
                marginVertical: 2,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Animated.Text style={[{
                  textAlign: 'center',
                  fontFamily: FONTS.semiBold,
                  fontSize: 20,
                  color: COLORS.secondary
                },
                {
                  opacity,
                  transform: [{
                    scale
                  }]
                }]}>
                  {item <= 9 ? '0' + item : item}
                </Animated.Text>
              </View>
            }}
          />
          <Animated.FlatList
            initialNumToRender={60}
            data={timerMinute}
            ref={(ref) => { setRefStartMinute(ref); }}
            keyExtractor={item => item.toString()}
            style={[styles.timerList, styles.timerListMinute]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 68
            }}
            decelerationRate="fast"
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.y / (itemSize + 4)
              )
              refStartMinute.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationStartMinute(timerMinute[index]);
              navigation.setOptions({
                headerRight: () => (
                  <TouchableWithoutFeedback onPress={() => {
                    changeScheduleTime();
                  }}>
                    <View style={styles.save}>
                      <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                    </View>
                  </TouchableWithoutFeedback>
                ),
              });
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: startMinuteScroll } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * (itemSize + 4),
                (index - 1) * (itemSize + 4),
                index * (itemSize + 4),
                (index + 1) * (itemSize + 4),
                (index + 2) * (itemSize + 4)
              ];

              const opacity = startMinuteScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = startMinuteScroll.interpolate({
                inputRange,
                outputRange: [.7, .7, 1, .7, .7]
              })
              return <View style={{
                height: itemSize,
                marginVertical: 2,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Animated.Text style={[{
                  textAlign: 'center',
                  fontFamily: FONTS.semiBold,
                  fontSize: 20,
                  color: COLORS.secondary
                },
                {
                  opacity,
                  transform: [{
                    scale
                  }]
                }]}>
                  {item <= 9 ? '0' + item : item}
                </Animated.Text>
              </View>
            }}
          />
        </View>
        <View>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.loss]}>Turn OFF</Text>
        </View>
        <View style={styles.timerStyles}>
          <Animated.FlatList
            initialNumToRender={24}
            data={timerHour}
            ref={(ref) => { setRefEndHour(ref); }}
            keyExtractor={item => item.toString()}
            style={styles.timerList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 68
            }}
            decelerationRate="fast"
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.y / (itemSize + 4)
              )
              refEndHour.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationEndHour(timerHour[index]);
              navigation.setOptions({
                headerRight: () => (
                  <TouchableWithoutFeedback onPress={() => {
                    changeScheduleTime();
                  }}>
                    <View style={styles.save}>
                      <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                    </View>
                  </TouchableWithoutFeedback>
                ),
              });
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: endHourScroll } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * (itemSize + 4),
                (index - 1) * (itemSize + 4),
                index * (itemSize + 4),
                (index + 1) * (itemSize + 4),
                (index + 2) * (itemSize + 4)
              ];

              const opacity = endHourScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = endHourScroll.interpolate({
                inputRange,
                outputRange: [.7, .7, 1, .7, .7]
              })
              return <View style={{
                height: itemSize,
                marginVertical: 2,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Animated.Text style={[{
                  textAlign: 'center',
                  fontFamily: FONTS.semiBold,
                  fontSize: 20,
                  color: COLORS.secondary
                },
                {
                  opacity,
                  transform: [{
                    scale
                  }]
                }]}>
                  {item <= 9 ? '0' + item : item}
                </Animated.Text>
              </View>
            }}
          />
          <Animated.FlatList
            initialNumToRender={60}
            data={timerMinute}
            ref={(ref) => { setRefEndMinute(ref); }}
            keyExtractor={item => item.toString()}
            style={[styles.timerList, styles.timerListMinute]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 68
            }}
            decelerationRate="fast"
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.y / (itemSize + 4)
              )
              refEndMinute.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationEndMinute(timerMinute[index]);
              navigation.setOptions({
                headerRight: () => (
                  <TouchableWithoutFeedback onPress={() => {
                    changeScheduleTime();
                  }}>
                    <View style={styles.save}>
                      <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
                    </View>
                  </TouchableWithoutFeedback>
                ),
              });
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: endMinuteScroll } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * (itemSize + 4),
                (index - 1) * (itemSize + 4),
                index * (itemSize + 4),
                (index + 1) * (itemSize + 4),
                (index + 2) * (itemSize + 4)
              ];

              const opacity = endMinuteScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = endMinuteScroll.interpolate({
                inputRange,
                outputRange: [.7, .7, 1, .7, .7]
              })
              return <View style={{
                height: itemSize,
                marginVertical: 2,
                justifyContent: "center",
                alignItems: "center"
              }}>
                <Animated.Text style={[{
                  textAlign: 'center',
                  fontFamily: FONTS.semiBold,
                  fontSize: 20,
                  color: COLORS.secondary
                },
                {
                  opacity,
                  transform: [{
                    scale
                  }]
                }]}>
                  {item <= 9 ? '0' + item : item}
                </Animated.Text>
              </View>
            }}
          />
        </View>
        <View style={styles.forthLine}>
          <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb8]}>Daily Schedule</Text>
        </View>
        <View style={styles.forthLine}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Turn ON at</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx4, FONT_COLORS.secondary]}>{String(durationStartHour).padStart(2, '0')}</Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>:</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx4, FONT_COLORS.secondary]}>{String(durationStartMinute).padStart(2, '0')}</Text>
        </View>
        <View style={styles.forthLine}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Turn OFF at</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx4, FONT_COLORS.secondary]}>{String(durationEndHour).padStart(2, '0')}</Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>:</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx4, FONT_COLORS.secondary]}>{String(durationEndMinute).padStart(2, '0')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Schedule;

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
    paddingTop: 32,
    padding: 16,
    alignItems: "center"
  },
  forthLine: {
    flexDirection: "row",
    alignItems: "center"
  },
  timerStyles: {
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 60,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  timerList: {
    width: 38,
    height: 170,
  },
  timerListMinute: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray,
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