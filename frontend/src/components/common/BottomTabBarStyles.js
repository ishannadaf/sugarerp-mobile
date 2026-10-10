import { Dimensions, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');
const guidelineWidth = 390;
const scale = (size) => Math.round((width / guidelineWidth) * size);
const moderateScale = (size, factor = 0.35) =>
  Math.round(size + (scale(size) - size) * factor);

const horizontalPadding = moderateScale(16);

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: moderateScale(70),
    paddingHorizontal: horizontalPadding,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(8),
    borderTopLeftRadius: moderateScale(12),
    borderTopRightRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  activeTab: {
    minWidth: moderateScale(112),
    minHeight: moderateScale(52),
    borderRadius: moderateScale(28),
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    color: colors.secondary,
    fontSize: moderateScale(12),
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  tabItem: {
    minWidth: moderateScale(64),
    minHeight: moderateScale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: colors.text,
    fontSize: moderateScale(12),
    letterSpacing: 0.4,
    marginTop: moderateScale(2),
  },
});

export default styles;
