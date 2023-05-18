import * as React from 'react';
import { SafeAreaView, Text, LogBox, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigations/AuthNavigator';
import messaging from '@react-native-firebase/messaging';
import MessagingToken from './src/helper/messaging-token';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faRotateRight, faRotateLeft, faCouch, faPlug, faChevronLeft, faChevronRight, faChevronDown, faFloppyDisk, faRightFromBracket, faUser, faShieldHalved, faPowerOff, faCircleExclamation, faMicrophone, faHouse, faIndustry, faPencil, faClock, faCheck, faBoltLightning, faCoins, faImage, faXmark, faHourglassEnd, faHourglassHalf, faHourglassStart, faHeart, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { PorcupineManager, BuiltInKeywords } from '@picovoice/porcupine-react-native';

library.add(faRotateRight, faRotateLeft, faCouch, faPlug, faChevronLeft, faChevronRight, faChevronDown, faFloppyDisk, faRightFromBracket, faUser, faShieldHalved, faPowerOff, faCircleExclamation, faMicrophone, faHouse, faIndustry, faPencil, faClock, faCheck, faBoltLightning, faCoins, faImage, faXmark, faHourglassEnd, faHourglassHalf, faHourglassStart, faHeart, faEye, faEyeSlash);
LogBox.ignoreAllLogs();

const messagingToken = new MessagingToken();

_requestRecordAudioPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: '[Permission explanation]',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    }
  );
  return (granted === PermissionsAndroid.RESULTS.GRANTED)
}

export default function App() {
  const setMessagingToken = async () => {
    try {
      let messaging_token = await messagingToken.getToken();
      
      if (!messaging_token) {
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        messagingToken.saveToken(token);
      }
    } catch (err) {
      return;
    }
  };

  const createPicovoiceManager = async () => {
    const accessKey = "cxCbnNzHug6GCSGEb2+WFInGhqUKd6nZu+fs2esd3U7ealmW3VRDpw=="; // your Picovoice AccessKey
  }

  React.useEffect(() => {
    setMessagingToken();
    let recordAudioRequest = this._requestRecordAudioPermission();
    recordAudioRequest.then((hasPermission) => {
      if (!hasPermission) {
        console.error('Required microphone permission was not granted.');
        return;
      }
      createPicovoiceManager();
    });
  }, []);

  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
}
