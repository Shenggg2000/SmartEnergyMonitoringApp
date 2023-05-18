import { StyleSheet, Text, View, SafeAreaView, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS, FONT_COLORS, MARGIN, TYPOGRAPHY, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../routes';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { QR } from '../../../assets/images';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { launchImageLibrary } from 'react-native-image-picker';
import jsQR from 'jsqr';
const PNG = require('pngjs/browser').PNG;

const ScanWallOutlet = () => {
  const navigation = useNavigation();

  const [photo, setPhoto] = React.useState(null);

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        selectionLimit: 1,
        mediaType: 'photo',
        includeBase64: true,
      },
      ({ didCancel, assets, errorCode }) => {
        if (didCancel || errorCode || !assets || assets.length === 0) {
          // Handle errors here, or separately
          return;
        }

        // Get the image and its base64 data into a buffer
        const image = assets[0];
        const base64Buffer = Buffer.from(image.base64, 'base64');

        let pixelData;
        let imageBuffer;

        // Handle decoding based on different mimetypes
        if (image.type === 'image/jpeg') {
          pixelData = jpeg.decode(base64Buffer, { useTArray: true }); // --> useTArray makes jpeg-js work on react-native without needing to nodeify it
          imageBuffer = pixelData.data;
        } else if (image.type === 'image/png') {
          pixelData = PNG.sync.read(base64Buffer);
          imageBuffer = pixelData.data;
        } else {
          // you can alert the user here that the format is not supported
          return;
        }

        // Convert the buffer into a clamped array that jsqr uses
        const data = Uint8ClampedArray.from(imageBuffer);

        // Get the QR string from the image
        const code = jsQR(data, image.width, image.height);
        navigation.navigate(ROUTES.ADD_WALL_OUTLET, {
          wallOutletIdentifier: code.data,
        })
      }
    );
  };

  onSuccess = e => {
    console.log(123);
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <View style={styles.qrScanner}>
          <QRCodeScanner
            onRead={this.onSuccess}
            cameraStyle={{ height: WINDOW_HEIGHT - 64 - 12 }}
          />
          <View style={styles.qrScannerWrapper}>
            <Image source={QR} style={{ width: "100%" }} resizeMode="cover" />
          </View>
          <TouchableWithoutFeedback onPress={() => { handleChoosePhoto() }}>
            <View style={styles.accessFiles}>
              <FontAwesomeIcon icon="image" color={COLORS.secondary} size={24} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScanWallOutlet;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: COLORS.white,
    position: "relative"
  },
  container: {
    paddingTop: 12,
    position: "relative",
  },
  qrScanner: {
    flex: 1,
    width: "100%",
    backgroundColor: "red"
  },
  qrScannerWrapper: {
    position: "absolute",
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT - 64 - 12,
    top: 0,
    left: 0,
    zIndex: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  accessFiles: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    right: 20,
    top: 20,
    zIndex: 10,
  }
})