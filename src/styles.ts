import { StyleSheet } from 'react-native';

import { colors } from './theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.black,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  display: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingHorizontal: 34,
  },
  expressionLine: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  expressionLeadingSpace: {
    alignSelf: 'stretch',
    flex: 1,
  },
  expressionCharacterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expressionCharacter: {
    fontWeight: '300',
    includeFontPadding: false,
  },
  caretSlot: {
    zIndex: 1,
    width: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caret: {
    width: 2,
    backgroundColor: colors.caret,
  },
  preview: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 30,
    fontWeight: '300',
    includeFontPadding: false,
  },
  lockedMessage: {
    marginTop: 10,
    color: colors.red,
    fontSize: 14,
    fontWeight: '600',
  },
  toolbar: {
    width: '100%',
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.divider,
  },
  keypad: {
    marginTop: 14,
  },
  keyRow: {
    flexDirection: 'row',
  },
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyFace: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disabledKey: {
    opacity: 0.45,
  },
  keyText: {
    fontWeight: '300',
    textAlign: 'center',
    includeFontPadding: false,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    maxHeight: '80%',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: '#151515',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
  },
  closeText: {
    color: colors.muted,
    fontSize: 32,
    lineHeight: 34,
  },
  historyList: {
    maxHeight: 380,
  },
  emptyText: {
    paddingVertical: 34,
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  historyItem: {
    alignItems: 'flex-end',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#303030',
  },
  historyExpression: {
    color: colors.muted,
    fontSize: 17,
  },
  historyResult: {
    marginTop: 3,
    color: colors.white,
    fontSize: 25,
  },
  sheetLabel: {
    color: colors.muted,
    fontSize: 15,
  },
  converterContent: {
    paddingBottom: 4,
  },
  converterValue: {
    marginTop: 6,
    color: colors.white,
    fontSize: 38,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  unitChip: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    backgroundColor: '#282828',
    borderRadius: 16,
  },
  selectedChip: {
    backgroundColor: colors.equal,
  },
  unitText: {
    color: colors.white,
    fontSize: 16,
  },
  selectedUnitText: {
    fontWeight: '700',
  },
  conversionResults: {
    gap: 9,
    marginTop: 20,
    marginBottom: 16,
  },
  conversionResult: {
    color: colors.white,
    fontSize: 19,
  },
  converterKeyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  converterKey: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  converterKeyText: {
    color: colors.green,
    fontSize: 24,
  },
  scientificGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 8,
  },
  scientificKey: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#292929',
    borderRadius: 20,
  },
  scientificKeyText: {
    color: colors.green,
    fontSize: 21,
  },
});
