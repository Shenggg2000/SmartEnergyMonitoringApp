import AsyncStorage from '@react-native-async-storage/async-storage';

export default class MessagingToken {
  getToken = async () => {
    const userToken = await AsyncStorage.getItem('messaging-token');
    return userToken;
  };

  saveToken = async userToken => {
    await AsyncStorage.setItem('messaging-token', userToken);
  };

  deleteToken = async () => {
    await AsyncStorage.removeItem('messaging-token');
  };
}