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
const timerSecond = [...Array(60).keys()];
const itemSize = 30;

const Countdown = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [refHour, setRefHour] = React.useState(null);
  const [refMinute, setRefMinute] = React.useState(null);
  const [refSecond, setRefSecond] = React.useState(null);

  const hourScroll = React.useRef(new Animated.Value(0)).current;
  const minuteScroll = React.useRef(new Animated.Value(0)).current;
  const secondScroll = React.useRef(new Animated.Value(0)).current;
  const [durationHour, setDurationHour] = React.useState(timerHour[0]);
  const [durationMinute, setDurationMinute] = React.useState(timerMinute[0]);
  const [durationSecond, setDurationSecond] = React.useState(timerSecond[0]);
  const [isModalVisible, setModalVisible] = React.useState(false);

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    route.params.refresh();
    navigation.goBack();
  };

  saveCountdown = async () => {
    let now = new Date();

    // Add 1 hour and 30 minutes to the current time
    let hour = 60 * 60 * 1000; // milliseconds in an hour
    let minute = 60 * 1000; // milliseconds in a minute
    let second = 1000; // milliseconds in a minute
    let futureTime = new Date(now.getTime() + (durationHour * hour + durationMinute * minute + durationSecond * second));
    futureTime.setUTCHours(futureTime.getUTCHours() + 8);

    let auth_token = await authToken.getToken();
    let result = await axios.post('http://10.0.2.2:5000/api/task-schedules',
      {
        wall_outlet_id: route.params.wallOutletId,
        wall_outlet_identifier: route.params.wallOutletIdentifier,
        action: route.params.wallOutletIsOn ? "OFF" : "ON",
        action_datetime: futureTime.toISOString().slice(0, 19).replace('T', ' '),
        is_schedule: "0"
      },
      { headers: { "Authorization": `Bearer ${auth_token}` } });
    let response = result.data;

    if (!response.error) {
      showModal();
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableWithoutFeedback onPress={() => {
          saveCountdown();
        }}>
          <View style={styles.save}>
            <Icon icon="floppy-disk" iconColor={COLORS.secondary} bgColor={BACKGROUND_COLORS.lightGray} size="medium" />
          </View>
        </TouchableWithoutFeedback>
      ),
    });
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.modal} >
            <View style={styles.modalContent}>
              <Text style={[TYPOGRAPHY.h4, FONT_COLORS.secondary, MARGIN.mb12, { textAlign: "center" }]}>Countdown started successfully!</Text>
              <TouchableWithoutFeedback onPress={hideModal}>
                <Text style={[TYPOGRAPHY.h5, FONT_COLORS.info]}>OK</Text>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
        <View style={styles.firstLine}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{route.params.wallOutletName}</Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray, MARGIN.mx4]}>is turn</Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary]}>{route.params.wallOutletIsOn ? "ON" : "OFF"}</Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray, MARGIN.mx4]}>right now</Text>
        </View>
        <View style={styles.secondLine}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Set countdown timer to automatically</Text>
        </View>
        <View style={styles.thridLine}>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>turn</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx4, route.params.wallOutletIsOn ? FONT_COLORS.loss : FONT_COLORS.profit]}>
            {route.params.wallOutletIsOn ? "OFF" : "ON"}
          </Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>after</Text>
        </View>
        <View style={styles.timerStyles}>
          <Animated.FlatList
            data={timerHour}
            ref={(ref) => { setRefHour(ref); }}
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
              refHour.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationHour(timerHour[index]);
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: hourScroll } } }],
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

              const opacity = hourScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = hourScroll.interpolate({
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
            data={timerMinute}
            ref={(ref) => { setRefMinute(ref); }}
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
              refMinute.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationMinute(timerMinute[index]);
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: minuteScroll } } }],
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

              const opacity = minuteScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = minuteScroll.interpolate({
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
            data={timerSecond}
            ref={(ref) => { setRefSecond(ref); }}
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
              refSecond.scrollToOffset({
                animated: true,
                offset: index * (itemSize + 4),
              })
              setDurationSecond(timerSecond[index]);
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: secondScroll } } }],
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

              const opacity = secondScroll.interpolate({
                inputRange,
                outputRange: [.4, .4, 1, .4, .4]
              })

              const scale = secondScroll.interpolate({
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
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx8, FONT_COLORS.secondary]}>
            {durationHour}
          </Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Hours</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx8, FONT_COLORS.secondary]}>
            {durationMinute}
          </Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Minutes</Text>
          <Text style={[TYPOGRAPHY.h2, MARGIN.mx8, FONT_COLORS.secondary]}>
            {durationSecond}
          </Text>
          <Text style={[TYPOGRAPHY.h5, FONT_COLORS.drakGray]}>Seconds</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Countdown;

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
  firstLine: {
    flexDirection: "row",
    marginBottom: 12,
  },
  thridLine: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  forthLine: {
    flexDirection: "row",
    alignItems: "baseline"
  },
  timerStyles: {
    marginVertical: 40,
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
    borderRightWidth: 1,
    borderLeftColor: COLORS.gray,
    borderRightColor: COLORS.gray,
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