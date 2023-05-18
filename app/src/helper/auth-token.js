import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AuthToken {
  getToken = async () => {
    const userToken = await AsyncStorage.getItem('auth-token');
    return userToken
  };

  saveToken = async userToken => {
    await AsyncStorage.setItem('auth-token', userToken);
  };

  deleteToken = async () => {
    await AsyncStorage.removeItem('auth-token');
  };
}

