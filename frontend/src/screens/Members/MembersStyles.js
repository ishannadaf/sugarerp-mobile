import { Dimensions, Platform, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

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
    justifyContent: 'space-between',
  },
  appBarLeft: {
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
    paddingBottom: moderateScale(30),
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
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
  },
  addButton: {
    height: moderateScale(42),
    borderRadius: moderateScale(22),
    backgroundColor: colors.primary,
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginLeft: moderateScale(6),
  },
  searchBox: {
    height: moderateScale(48),
    borderRadius: moderateScale(11),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(14),
  },
  searchInput: {
    flex: 1,
    marginLeft: moderateScale(8),
    color: colors.text,
    fontSize: moderateScale(14),
    paddingVertical: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    columnGap: moderateScale(10),
    marginBottom: moderateScale(16),
  },
  summaryCard: {
    flex: 1,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    padding: moderateScale(14),
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: moderateScale(11),
  },
  summaryValue: {
    color: colors.primary,
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginTop: moderateScale(4),
  },
  list: {
    rowGap: moderateScale(12),
  },
  memberCard: {
    borderRadius: moderateScale(13),
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    padding: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(27),
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  avatarText: {
    color: colors.secondary,
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCode: {
    color: colors.primary,
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
  },
  statusText: {
    color: colors.secondary,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  memberName: {
    color: colors.black,
    fontSize: moderateScale(17),
    fontWeight: '800',
    marginTop: moderateScale(4),
  },
  memberMeta: {
    color: colors.text,
    fontSize: moderateScale(12),
    marginTop: moderateScale(4),
  },
  memberFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(12),
    marginTop: moderateScale(8),
  },
  footerText: {
    color: colors.muted,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  emptyText: {
    color: colors.muted,
    fontSize: moderateScale(14),
    textAlign: 'center',
    marginTop: moderateScale(30),
  },
});

export default styles;
