import { useMemo, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  appendDecimal,
  appendDigit,
  appendOperator,
  backspace,
  evaluateExpression,
  formatResult,
  toggleParenthesis,
  toggleSign,
} from './src/calculator';
import { hasDrawnGlyph, KeyArtwork } from './src/KeyArtwork';
import { styles } from './src/styles';
import { calculatorRows, colors } from './src/theme';
import { ToolbarIcon, type ToolbarIconName } from './src/ToolbarIcon';
import { ToolSheet } from './src/ToolSheet';
import { type CalculatorTool, type HistoryItem } from './src/types';

const MAX_HISTORY_ITEMS = 50;

function CalculatorScreen() {
  const { width, height } = useWindowDimensions();
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTool, setActiveTool] = useState<CalculatorTool>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const keypadWidth = Math.min(width, 500);
  const keySize = Math.min((keypadWidth - 88) / 4, (height * 0.52 - 32) / 5);
  const keyGap = Math.min(16, (keypadWidth - 40 - keySize * 4) / 3);

  const preview = useMemo(() => {
    if (!expression || justEvaluated) return null;

    const result = evaluateExpression(expression);
    return result === null ? null : formatResult(result);
  }, [expression, justEvaluated]);

  function clearExpression() {
    setExpression('');
    setJustEvaluated(false);
  }

  function calculateResult() {
    const result = evaluateExpression(expression);
    if (result === null) return;

    const formattedResult = formatResult(result);
    setHistory((items) =>
      [{ expression, result: formattedResult }, ...items].slice(0, MAX_HISTORY_ITEMS),
    );
    setExpression(formattedResult);
    setJustEvaluated(true);
  }

  function updateExpression(key: string) {
    setExpression((currentExpression) => {
      const startsNewCalculation =
        justEvaluated && (/^\d$/.test(key) || key === ',' || key === '()');
      const baseExpression = startsNewCalculation ? '' : currentExpression;

      if (/^\d$/.test(key)) return appendDigit(baseExpression, key);
      if (key === ',') return appendDecimal(baseExpression);
      if (key === '()') return toggleParenthesis(baseExpression);
      if (key === '+/−') return toggleSign(baseExpression);
      if (key === '%') {
        return baseExpression && /[\d)]$/.test(baseExpression)
          ? `${baseExpression}%`
          : baseExpression;
      }

      return appendOperator(baseExpression, key);
    });
    setJustEvaluated(false);
  }

  function pressKey(key: string) {
    if (key === 'C') {
      clearExpression();
      return;
    }

    if (key === '=') {
      calculateResult();
      return;
    }

    updateExpression(key);
  }

  function applyScientificFunction(key: string) {
    if (key === 'π') {
      setExpression((currentExpression) => {
        const multiplication = currentExpression && /[\d)%]$/.test(currentExpression) ? '×' : '';
        return `${currentExpression}${multiplication}${Math.PI.toString().replace('.', ',')}`;
      });
    } else {
      const value = evaluateExpression(expression);
      if (value === null) return;

      const result = calculateScientificValue(key, value);
      if (Number.isFinite(result)) setExpression(formatResult(result));
    }

    setJustEvaluated(false);
    setActiveTool(null);
  }

  function selectHistoryItem(result: string) {
    setExpression(result);
    setJustEvaluated(true);
    setActiveTool(null);
  }

  const toolbarItems: {
    icon: ToolbarIconName;
    label: string;
    action: () => void;
  }[] = [
    { icon: 'history', label: 'Histórico', action: () => setActiveTool('history') },
    { icon: 'ruler', label: 'Conversor de unidades', action: () => setActiveTool('converter') },
    {
      icon: 'scientific',
      label: 'Funções científicas',
      action: () => setActiveTool('scientific'),
    },
    {
      icon: 'backspace',
      label: 'Apagar último caractere',
      action: () => {
        setExpression((currentExpression) => backspace(currentExpression));
        setJustEvaluated(false);
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={styles.screen}>
        <View style={styles.display}>
          <View style={styles.expressionLine}>
            <Text
              style={[styles.expression, { fontSize: expression.length > 13 ? 35 : 52 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.55}
              accessibilityLabel={expression || 'Visor vazio'}
            >
              {expression}
            </Text>
            {!expression && <View style={styles.caret} />}
          </View>

          {preview && (
            <Text style={styles.preview} numberOfLines={1}>
              = {preview}
            </Text>
          )}
        </View>

        <View style={[styles.toolbar, { maxWidth: keypadWidth }]}>
          {toolbarItems.map(({ icon, label, action }) => (
            <Pressable
              key={icon}
              style={[styles.toolbarButton, icon === 'backspace' && styles.backspaceButton]}
              accessibilityRole="button"
              accessibilityLabel={label}
              hitSlop={8}
              onPress={action}
            >
              <ToolbarIcon name={icon} color={icon === 'backspace' ? '#315b25' : colors.muted} />
            </Pressable>
          ))}
        </View>

        <View style={[styles.divider, { maxWidth: keypadWidth - 40 }]} />

        <View style={[styles.keypad, { width: keypadWidth }]}>
          {calculatorRows.map((row, rowIndex) => (
            <View
              key={row.join('-')}
              style={[
                styles.keyRow,
                { gap: keyGap, marginBottom: rowIndex === calculatorRows.length - 1 ? 0 : 8 },
              ]}
            >
              {row.map((key) => (
                <CalculatorKey key={key} label={key} size={keySize} onPress={() => pressKey(key)} />
              ))}
            </View>
          ))}
        </View>
      </View>

      <ToolSheet
        activeTool={activeTool}
        history={history}
        onClose={() => setActiveTool(null)}
        onSelectHistoryItem={selectHistoryItem}
        onSelectScientificFunction={applyScientificFunction}
      />
    </SafeAreaView>
  );
}

function CalculatorKey({
  label,
  size,
  onPress,
}: {
  label: string;
  size: number;
  onPress: () => void;
}) {
  const textColor = label === 'C' ? colors.red : colors.white;
  const fontSize = size * (label === 'C' ? 0.43 : 0.47);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && { opacity: 0.78 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label === '()' ? 'Parênteses' : label}
      onPress={onPress}
    >
      <KeyArtwork label={label} size={size} />
      {!hasDrawnGlyph(label) && (
        <Text allowFontScaling={false} style={[styles.keyText, { color: textColor, fontSize }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function calculateScientificValue(key: string, value: number) {
  const radians = (value * Math.PI) / 180;

  switch (key) {
    case '√':
      return Math.sqrt(value);
    case 'x²':
      return value ** 2;
    case 'sin':
      return Math.sin(radians);
    case 'cos':
      return Math.cos(radians);
    case 'tan':
      return Math.tan(radians);
    default:
      return Number.NaN;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CalculatorScreen />
    </SafeAreaProvider>
  );
}
