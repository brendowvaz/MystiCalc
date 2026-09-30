import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { appendDecimal, appendDigit, formatResult } from './calculator';
import { styles } from './styles';
import { type CalculatorTool, type HistoryItem } from './types';

type LengthUnit = 'cm' | 'm' | 'km';

type ToolSheetProps = {
  activeTool: CalculatorTool;
  history: HistoryItem[];
  onClose: () => void;
  onSelectHistoryItem: (result: string) => void;
  onSelectScientificFunction: (key: string) => void;
};

const scientificKeys = ['sin', 'cos', 'tan', '√', 'x²', 'π'];
const converterKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', ','];
const lengthUnits: LengthUnit[] = ['cm', 'm', 'km'];

function getSheetTitle(tool: Exclude<CalculatorTool, null>) {
  if (tool === 'history') return 'Histórico';
  if (tool === 'converter') return 'Conversor de comprimento';
  return 'Funções científicas';
}

function HistoryPanel({
  history,
  onSelect,
}: {
  history: HistoryItem[];
  onSelect: (result: string) => void;
}) {
  return (
    <ScrollView style={styles.historyList}>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum cálculo ainda</Text>
      ) : (
        history.map((item, index) => (
          <Pressable
            key={`${item.expression}-${index}`}
            style={styles.historyItem}
            onPress={() => onSelect(item.result)}
          >
            <Text style={styles.historyExpression}>{item.expression}</Text>
            <Text style={styles.historyResult}>= {item.result}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function ConverterPanel() {
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState<LengthUnit>('cm');

  const numericValue = Number(value.replace(',', '.')) || 0;
  const meters =
    unit === 'cm' ? numericValue / 100 : unit === 'km' ? numericValue * 1000 : numericValue;

  function pressKey(key: string) {
    setValue((currentValue) => {
      if (key === 'C') return '0';
      if (key === ',') return appendDecimal(currentValue);
      return appendDigit(currentValue === '0' ? '' : currentValue, key);
    });
  }

  return (
    <View style={styles.converterContent}>
      <Text style={styles.sheetLabel}>Valor</Text>
      <Text style={styles.converterValue}>{value}</Text>

      <View style={styles.unitRow}>
        {lengthUnits.map((lengthUnit) => {
          const isSelected = unit === lengthUnit;

          return (
            <Pressable
              key={lengthUnit}
              style={[styles.unitChip, isSelected && styles.selectedChip]}
              onPress={() => setUnit(lengthUnit)}
            >
              <Text style={[styles.unitText, isSelected && styles.selectedUnitText]}>
                {lengthUnit}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.conversionResults}>
        <Text style={styles.conversionResult}>{formatResult(meters * 100)} cm</Text>
        <Text style={styles.conversionResult}>{formatResult(meters)} m</Text>
        <Text style={styles.conversionResult}>{formatResult(meters / 1000)} km</Text>
      </View>

      <View style={styles.converterKeyboard}>
        {converterKeys.map((key) => (
          <Pressable key={key} style={styles.converterKey} onPress={() => pressKey(key)}>
            <Text style={styles.converterKeyText}>{key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ScientificPanel({ onSelect }: { onSelect: (key: string) => void }) {
  return (
    <View style={styles.scientificGrid}>
      {scientificKeys.map((key) => (
        <Pressable key={key} style={styles.scientificKey} onPress={() => onSelect(key)}>
          <Text style={styles.scientificKeyText}>{key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ToolSheet({
  activeTool,
  history,
  onClose,
  onSelectHistoryItem,
  onSelectScientificFunction,
}: ToolSheetProps) {
  return (
    <Modal
      visible={activeTool !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fechar" onPress={onClose} />

        {activeTool !== null && (
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{getSheetTitle(activeTool)}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {activeTool === 'history' && (
              <HistoryPanel history={history} onSelect={onSelectHistoryItem} />
            )}
            {activeTool === 'converter' && <ConverterPanel />}
            {activeTool === 'scientific' && (
              <ScientificPanel onSelect={onSelectScientificFunction} />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
