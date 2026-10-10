import { Dimensions, Platform, StyleSheet } from 'react-native';
import colors from '../constants/colors';


const { width } = Dimensions.get('window');
const guidelineWidth = 390;
const scale = (size) => Math.round((width / guidelineWidth) * size);
const moderateScale = (size, factor = 0.35) =>
  Math.round(size + (scale(size) - size) * factor);

const horizontalPadding = moderateScale(16);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  appBar: {
    height: Platform.OS === 'ios' ? moderateScale(84) : moderateScale(64),
    paddingTop: Platform.OS === 'ios' ? moderateScale(20) : 0,
    paddingHorizontal: horizontalPadding,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: moderateScale(42),
    height: moderateScale(42),
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    color: colors.white,
    fontSize: moderateScale(21),
    fontWeight: '700',
    marginLeft: moderateScale(6),
  },
  scrollContent: {
    padding: horizontalPadding,
    paddingBottom: moderateScale(34),
  },
  title: {
    color: colors.black,
    fontSize: moderateScale(23),
    fontWeight: '800',
  },
  subtitle: {
    color: colors.text,
    fontSize: moderateScale(13),
    marginTop: moderateScale(4),
    marginBottom: moderateScale(18),
  },
  formCard: {
    borderRadius: moderateScale(13),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    padding: moderateScale(16),
  },
  field: {
    marginBottom: moderateScale(14),
  },
  label: {
    color: colors.text,
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: moderateScale(7),
  },
  input: {
    minHeight: moderateScale(48),
    borderRadius: moderateScale(9),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    color: colors.black,
    fontSize: moderateScale(15),
    paddingHorizontal: moderateScale(12),
  },
  inputError: {
    borderColor: colors.error,
  },
  multilineInput: {
    minHeight: moderateScale(82),
    paddingTop: moderateScale(11),
  },
  errorText: {
    color: colors.error,
    fontSize: moderateScale(11),
    marginTop: moderateScale(5),
  },
  row: {
    flexDirection: 'row',
    columnGap: moderateScale(12),
  },
  halfField: {
    flex: 1,
  },
  saveButton: {
    height: moderateScale(56),
    borderRadius: moderateScale(12),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(10),
  },
  saveButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '800',
    marginLeft: moderateScale(8),
  },
});

export default styles;
