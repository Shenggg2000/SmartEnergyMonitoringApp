import { StyleSheet, Text, Image, View, ScrollView, SafeAreaView, TouchableWithoutFeedback, NativeEventEmitter } from 'react-native';
import React from 'react';
import { BACKGROUND_COLORS, COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_WIDTH } from '../../constants';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { VOICE_ASSISTANT } from '../../../assets/images';

import { BufferEmitter, VoiceProcessor } from '@picovoice/react-native-voice-processor';
import { Leopard } from '@picovoice/leopard-react-native';
import Recorder from '../../helper/Recorder';

import AuthToken from '../../helper/auth-token';
import axios from 'axios';

const authToken = new AuthToken();
let recorder = new Recorder();

const Voice = () => {
  const navigation = useNavigation();

  const [leopard, setLeopard] = React.useState(null);
  const [voiceProcessor, setVoiceProcessor] = React.useState(null);
  const [bufferEmitter, setBufferEmitter] = React.useState(null);

  const [isListening, setIsListening] = React.useState(false);
  const [chatRecord, setChatRecord] = React.useState([
    "How can I help you with?"
  ])

  let init = async () => {
    const accessKey = "cxCbnNzHug6GCSGEb2+WFInGhqUKd6nZu+fs2esd3U7ealmW3VRDpw=="
    const modelPath = "SEM-leopard-v1.2.0-23-04-15--07-38-48.pv"
    try {
      let myLeopard = await Leopard.create(accessKey, modelPath, { enableAutomaticPunctuation: true });
      setLeopard(myLeopard);

      let myVoiceProcessor = VoiceProcessor.getVoiceProcessor(
        512,
        myLeopard.sampleRate,
      );
      setVoiceProcessor(myVoiceProcessor)

      let bufferEmitter = new NativeEventEmitter(BufferEmitter);
      setBufferEmitter(bufferEmitter);

      console.log("setup done");
    } catch (err) {
    }
  }

  _startProcessing = async () => {
    await recorder.resetFile();
    await recorder.writeWavHeader();

    let bufferListener = bufferEmitter.addListener(
      BufferEmitter.BUFFER_EMITTER_KEY,
      async (buffer) => {
        await recorder.writeSamples(buffer);
      },
    );
    await voiceProcessor?.start();
  }

  _stopProcessing = () => {
    bufferEmitter.removeAllListeners(BufferEmitter.BUFFER_EMITTER_KEY);

    voiceProcessor?.stop().then(async () => {
      try {
        const audioPath = await recorder.finalize();
        const data = await leopard.processFile(audioPath);
        setChatRecord((curr) => {
          return [...curr, data.transcript];
        })
        processAction(data.transcript);
      } catch (err) {
      }
    });
  }

  processAction = async (action) => {
    let myAction = action.toLowerCase();
    let actionable = false;
    let actionIsOn = true;
    let wallOutletName = "";

    if (myAction.includes("turn on")) {
      let index = myAction.indexOf("turn on");
      wallOutletName = myAction.substring(index + 7).trim().replace(/\.$/, "");
      actionable = true;
    } else if (myAction.includes("switch on")) {
      let index = myAction.indexOf("switch on");
      wallOutletName = myAction.substring(index + 9).trim().replace(/\.$/, "");
      actionable = true;
    } else if (myAction.includes("turn off")) {
      let index = myAction.indexOf("turn off");
      wallOutletName = myAction.substring(index + 8).trim().replace(/\.$/, "");
      actionIsOn = false;
      actionable = true;
    } else if (myAction.includes("switch off")) {
      let index = myAction.indexOf("switch off");
      wallOutletName = myAction.substring(index + 10).trim().replace(/\.$/, "");
      actionIsOn = false;
      actionable = true;
    }

    let systemReply = ""
    if(actionable){
      let success = await switchWallOutlet(wallOutletName, actionIsOn);
      let firstChar = wallOutletName.charAt(0).toUpperCase();
      let newWallOutletName = firstChar + wallOutletName.slice(1);
      if (success) {
        systemReply = `${newWallOutletName} turned ${actionIsOn ? "on." : "off."}`
      }else{
        systemReply = `${newWallOutletName} not found. Please try again`
      }
    }else{
      systemReply = `Fail to recognize your command. Please try again.`
    }

    setChatRecord((curr) => {
      return [...curr, systemReply];
    })
  }

  let switchWallOutlet = async (name, state) => {
    try {
      let auth_token = await authToken.getToken();
      let data = {
        wall_outlet_name: name
      }
      let result;
      if (state) {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/likely/on/', data, { headers: { "Authorization": `Bearer ${auth_token}` } });
      } else {
        result = await axios.put('http://10.0.2.2:5000/api/wall-outlets/likely/off/', data, { headers: { "Authorization": `Bearer ${auth_token}` } });
      }
      let response = result.data;
      if (!response.error) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return;
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={styles.container}>
        {
          chatRecord.map((item, index) => {
            if (index % 2 == 0) {
              return (
                <Text key={index} style={[TYPOGRAPHY.h4, FONT_COLORS.drakGray, MARGIN.mb12, { width: "100%" }]}>{item}</Text>
              )
            } else {
              return (
                <Text key={index} style={[TYPOGRAPHY.h3, FONT_COLORS.secondary, MARGIN.mb12, { width: "100%", textAlign: "right" }]}>{item}</Text>
              )
            }
          })
        }
      </ScrollView>
      <View style={styles.voiceWrapper}>
        <Image source={VOICE_ASSISTANT} style={styles.voiceImg} />
        <View style={styles.voiceIcon}>
          {
            isListening &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb8]}>Listening...</Text>
          }
          {
            !isListening &&
            <Text style={[TYPOGRAPHY.body, FONT_COLORS.drakGray, MARGIN.mb8]}>Press and speak</Text>
          }
          <TouchableWithoutFeedback onPress={() => {
            setIsListening((curr) => {
              if (!curr) {
                _startProcessing();
              } else {
                _stopProcessing();
              }
              return !curr;
            });
          }}>
            <View>
              <Icon icon="microphone" iconColor={COLORS.lightGray} bgColor={BACKGROUND_COLORS.secondary} size="medium">
              </Icon>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Voice;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 48,
    padding: 16,
    paddingBottom: 80,
    height: 500
  },
  voiceWrapper: {
    width: "100%",
    position: "absolute",
    height: 250,
    left: 0,
    bottom: 58,
    zIndex: 999,
    alignItems: "center"
  },
  voiceImg: {
    width: "100%",
    height: 120,
  },
  voiceIcon: {
    alignItems: "center",
    marginTop: 32
  }
})




