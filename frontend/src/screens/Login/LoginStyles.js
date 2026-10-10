import { Dimensions, Platform, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const guidelineWidth = 390;
const scale = (size) => Math.round((width / guidelineWidth) * size);
const moderateScale = (size, factor = 0.45) =>
  Math.round(size + (scale(size) - size) * factor);

const isSmallScreen = height < 720;
const cardWidth = Math.min(width - moderateScale(32), 440);
const inputHeight = isSmallScreen ? moderateScale(54) : moderateScale(60);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(28),
    paddingBottom: moderateScale(24),
  },
  yearWrapper: {
    marginTop: moderateScale(2),
    marginBottom: moderateScale(8),
  },
  yearLabel: {
    position: 'absolute',
    top: -moderateScale(10),
    left: moderateScale(18),
    zIndex: 2,
    paddingHorizontal: moderateScale(6),
    backgroundColor: colors.glass,
    color: colors.primary,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  yearSelector: {
    height: inputHeight,
    borderWidth: 1.3,
    borderColor: colors.border,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  yearSelectorError: {
    borderColor: colors.error,
  },
  yearText: {
    color: colors.black,
    fontSize: moderateScale(16),
  },
  yearHelper: {
    minHeight: moderateScale(18),
    marginLeft: moderateScale(4),
    fontSize: moderateScale(11),
  },
  optionsRow: {
    marginTop: moderateScale(2),
    marginBottom: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: {
    color: colors.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  footer: {
    marginTop: moderateScale(28),
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
  },
  footerText: {
    color: '#8B9288',
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  footerLinks: {
    marginTop: moderateScale(12),
    flexDirection: 'row',
    columnGap: moderateScale(24),
  },
  footerLink: {
    color: colors.text,
    fontSize: moderateScale(13),
    textDecorationLine: 'underline',
  },
});

export const logoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: moderateScale(28),
  },
  logoBox: {
    width: moderateScale(82),
    height: moderateScale(82),
    borderRadius: moderateScale(18),
    backgroundColor: '#28742D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  title: {
    marginTop: moderateScale(22),
    color: colors.primary,
    fontSize: moderateScale(34),
    fontWeight: '800',
  },
  subtitle: {
    marginTop: moderateScale(8),
    color: colors.muted,
    fontSize: moderateScale(15),
    textAlign: 'center',
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    width: cardWidth,
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(38),
    paddingBottom: moderateScale(28),
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(210, 220, 209, 0.88)',
    backgroundColor: colors.glass,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 8,
  },
});

export const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: moderateScale(8),
  },
  input: {
    height: inputHeight,
    backgroundColor: colors.white,
    fontSize: moderateScale(16),
  },
  outline: {
    borderRadius: moderateScale(10),
    borderWidth: 1.3,
  },
  content: {
    fontSize: moderateScale(16),
    paddingHorizontal: moderateScale(8),
  },
  helper: {
    minHeight: moderateScale(18),
    marginLeft: moderateScale(4),
    fontSize: moderateScale(11),
  },
});

export const buttonStyles = StyleSheet.create({
  animated: {
    width: '100%',
  },
  button: {
    height: moderateScale(58),
    borderRadius: moderateScale(12),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: moderateScale(10),
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },
  text: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
});

export const checkboxStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(7),
    borderWidth: 2.4,
    borderColor: '#7D877B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  label: {
    marginLeft: moderateScale(9),
    color: colors.text,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
});

export const responsiveIconSizes = {
  logo: moderateScale(38),
  input: moderateScale(22),
  button: moderateScale(24),
  checkbox: moderateScale(19),
  calendar: moderateScale(23),
};

export default styles;