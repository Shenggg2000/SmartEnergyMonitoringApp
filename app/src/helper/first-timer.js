import AsyncStorage from '@react-native-async-storage/async-storage';

export default class FirstTimer {
  getToken = async () => {
    const firstTime = await AsyncStorage.getItem('first-timer');
    return firstTime
  };

  saveToken = async firstTime => {
    await AsyncStorage.setItem('first-timer', firstTime);
  };

  deleteToken = async () => {
    await AsyncStorage.removeItem('first-timer');
  };
}

