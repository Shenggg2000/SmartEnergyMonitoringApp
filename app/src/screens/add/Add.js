import { StyleSheet, Text, View, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../routes';

const Add = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={styles.addButtonRow}>
          <TouchableWithoutFeedback onPress={() =>
            navigation.navigate(ROUTES.ADD_PROPERTY)
          }>
            <View style={styles.addButton}>
              <FontAwesomeIcon icon="house" color={COLORS.secondary} size={24} />
              <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>Property</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() =>
            navigation.navigate(ROUTES.ADD_ROOM)
          }>
            <View style={styles.addButton}>
              <FontAwesomeIcon icon="couch" color={COLORS.secondary} size={24} />
              <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>Room</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() =>
            navigation.navigate(ROUTES.SCAN_WALL_OUTLET)
          }>
            <View style={styles.addButton}>
              <FontAwesomeIcon icon="plug" color={COLORS.secondary} size={24} />
              <Text style={[TYPOGRAPHY.h5, FONT_COLORS.secondary, MARGIN.mt4]}>Wall Outlet</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>


  );
};

export default Add;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 24,
    padding: 16,
  },
  addButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  addButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    width: (WINDOW_WIDTH / 2) - 24,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
    justifyContent: "space-between"
  },
})