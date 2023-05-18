import { Dimensions, StyleSheet } from 'react-native';

export const WINDOW_HEIGHT = Dimensions.get("window").height;
export const WINDOW_WIDTH = Dimensions.get("window").width;

export const FONTS = {
  thin: 'Poppins-Thin',
  thinItalic: 'Poppins-ThinItalic',
  extraLight: 'Poppins-Bold',
  extraLightItalic: 'Poppins-BoldItalic',
  light: 'Poppins-Light',
  lightItalic: 'Poppins-LightItalic',
  regular: 'Poppins-Regular',
  italic: 'Poppins-Italic',
  medium: 'Poppins-Medium',
  mediumItalic: 'Poppins-LightItalic',
  semiBold: 'Poppins-SemiBold',
  semiBoldItalic: 'Poppins-SemiBoldItalic',
  bold: 'Poppins-Bold',
  boldItalic: 'Poppins-BoldItalic',
  extraBold: 'Poppins-ExtraBold',
  extraBoldItalic: 'Poppins-ExtraBoldItalic',
  black: 'Poppins-Black',
  blackItalic: 'Poppins-BlackItalic',
};

export const TYPOGRAPHY = StyleSheet.create({
  h1: {
    fontFamily: FONTS.semiBold,
    fontSize: 32,
  },
  h2: {
    fontFamily: FONTS.semiBold,
    fontSize: 24,
  },
  h3: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
  },
  h4: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  h5: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  h6: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
});

export const COLORS = {
  primary: "#FEBB53",
  secondary: "#2C2F42",
  lightGray: "#F8F8FA",
  white: "#FFFFFF",
  black: "#000000",
  profit: "#26D541",
  info: "#5396FE",
  loss: "#EF525E",
  gray: "#BEBDC0",
  drakGray: "#AFAFAF",
}

export const FONT_COLORS = StyleSheet.create({
  primary: {
    color: COLORS.primary,
  },
  secondary: {
    color: COLORS.secondary,
  },
  lightGray: {
    color: COLORS.lightGray,
  },
  white: {
    color: COLORS.white,
  },
  black: {
    color: COLORS.black,
  },
  profit: {
    color: COLORS.profit,
  },
  info: {
    color: COLORS.info,
  },
  loss: {
    color: COLORS.loss,
  },
  gray: {
    color: COLORS.gray,
  },
  drakGray: {
    color: COLORS.drakGray,
  },
});

export const BACKGROUND_COLORS = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  lightGray: {
    backgroundColor: COLORS.lightGray,
  },
  white: {
    backgroundColor: COLORS.white,
  },
  black: {
    backgroundColor: COLORS.black,
  },
  profit: {
    backgroundColor: COLORS.profit,
  },
  info: {
    backgroundColor: COLORS.info,
  },
  loss: {
    backgroundColor: COLORS.loss,
  },
  gray: {
    backgroundColor: COLORS.gray,
  },
  drakGray: {
    backgroundColor: COLORS.drakGray,
  },
});

export const PADDING = StyleSheet.create({
  p4: {
    padding: 4
  },
  p8: {
    padding: 8
  },
  p12: {
    padding: 12
  },
  p16: {
    padding: 16
  },
  p20: {
    padding: 20
  },
  p24: {
    padding: 24
  },
  p32: {
    padding: 32
  },

  px4: {
    paddingHorizontal: 4
  },
  px8: {
    paddingHorizontal: 8
  },
  px12: {
    paddingHorizontal: 12
  },
  px16: {
    paddingHorizontal: 16
  },
  px20: {
    paddingHorizontal: 20
  },
  px24: {
    paddingHorizontal: 24
  },
  px32: {
    paddingHorizontal: 32
  },

  py4: {
    paddingVertical: 4
  },
  py8: {
    paddingVertical: 8
  },
  py12: {
    paddingVertical: 12
  },
  py16: {
    paddingVertical: 16
  },
  py20: {
    paddingVertical: 20
  },
  py24: {
    paddingVertical: 24
  },
  py32: {
    paddingVertical: 32
  },

  pt4: {
    paddingTop: 4
  },
  pt8: {
    paddingTop: 8
  },
  pt12: {
    paddingTop: 12
  },
  pt16: {
    paddingTop: 16
  },
  pt20: {
    paddingTop: 20
  },
  pt24: {
    paddingTop: 24
  },
  pt32: {
    paddingTop: 32
  },

  pb4: {
    paddingBottom: 4
  },
  pb8: {
    paddingBottom: 8
  },
  pb12: {
    paddingBottom: 12
  },
  pb16: {
    paddingBottom: 16
  },
  pb20: {
    paddingBottom: 20
  },
  pb24: {
    paddingBottom: 24
  },
  pb32: {
    paddingBottom: 32
  },

  pl4: {
    paddingLeft: 4
  },
  pl8: {
    paddingLeft: 8
  },
  pl12: {
    paddingLeft: 12
  },
  pl16: {
    paddingLeft: 16
  },
  pl20: {
    paddingLeft: 20
  },
  pl24: {
    paddingLeft: 24
  },
  pl32: {
    paddingLeft: 32
  },

  pr4: {
    paddingRight: 4
  },
  pr8: {
    paddingRight: 8
  },
  pr12: {
    paddingRight: 12
  },
  pr16: {
    paddingRight: 16
  },
  pr20: {
    paddingRight: 20
  },
  pr24: {
    paddingRight: 24
  },
  pr32: {
    paddingRight: 32
  },
});
export const MARGIN = StyleSheet.create({
  m4: {
    margin: 4
  },
  m8: {
    margin: 8
  },
  m12: {
    margin: 12
  },
  m16: {
    margin: 16
  },
  m20: {
    margin: 20
  },
  m24: {
    margin: 24
  },
  m32: {
    margin: 32
  },

  mx4: {
    marginHorizontal: 4
  },
  mx8: {
    marginHorizontal: 8
  },
  mx12: {
    marginHorizontal: 12
  },
  mx16: {
    marginHorizontal: 16
  },
  mx20: {
    marginHorizontal: 20
  },
  mx24: {
    marginHorizontal: 24
  },
  mx32: {
    marginHorizontal: 32
  },

  my4: {
    marginVertical: 4
  },
  my8: {
    marginVertical: 8
  },
  my12: {
    marginVertical: 12
  },
  my16: {
    marginVertical: 16
  },
  my20: {
    marginVertical: 20
  },
  my24: {
    marginVertical: 24
  },
  my32: {
    marginVertical: 32
  },

  mt4: {
    marginTop: 4
  },
  mt8: {
    marginTop: 8
  },
  mt12: {
    marginTop: 12
  },
  mt16: {
    marginTop: 16
  },
  mt20: {
    marginTop: 20
  },
  mt24: {
    marginTop: 24
  },
  mt32: {
    marginTop: 32
  },

  mb4: {
    marginBottom: 4
  },
  mb8: {
    marginBottom: 8
  },
  mb12: {
    marginBottom: 12
  },
  mb16: {
    marginBottom: 16
  },
  mb20: {
    marginBottom: 20
  },
  mb24: {
    marginBottom: 24
  },
  mb32: {
    marginBottom: 32
  },

  ml4: {
    marginLeft: 4
  },
  ml8: {
    marginLeft: 8
  },
  ml12: {
    marginLeft: 12
  },
  ml16: {
    marginLeft: 16
  },
  ml20: {
    marginLeft: 20
  },
  ml24: {
    marginLeft: 24
  },
  ml32: {
    marginLeft: 32
  },

  mr4: {
    marginRight: 4
  },
  mr8: {
    marginRight: 8
  },
  mr12: {
    marginRight: 12
  },
  mr16: {
    marginRight: 16
  },
  mr20: {
    marginRight: 20
  },
  mr24: {
    marginRight: 24
  },
  mr32: {
    marginRight: 32
  },
});