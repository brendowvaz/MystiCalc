import { useEffect, useMemo, useRef, useState } from 'react';
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
} from './src/utils/calculator';
import { triggerKeyHaptic } from './src/utils/haptics';
import { hasDrawnGlyph, KeyArtwork } from './src/components/KeyArtwork';
import { styles } from './src/styles';
import { calculatorRows, colors } from './src/theme';
import { ToolbarIcon, type ToolbarIconName } from './src/components/ToolbarIcon';
import { ToolSheet } from './src/components/ToolSheet';
import { ExpressionEditor } from './src/components/ExpressionEditor';
import { type CalculatorTool, type HistoryItem } from './src/types';
import { useFaceDownLock } from './src/hooks/useFaceDownLock';

const MAX_HISTORY_ITEMS = 50;

function CalculatorScreen() {
  const { width, height } = useWindowDimensions();
  const [expression, setExpression] = useState('');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTool, setActiveTool] = useState<CalculatorTool>(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const isKeyboardLocked = useFaceDownLock();
  const expressionRef = useRef(expression);
  const cursorIndexRef = useRef(cursorIndex);
  const isKeyboardLockedRef = useRef(isKeyboardLocked);
  const deleteDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  expressionRef.current = expression;
  cursorIndexRef.current = cursorIndex;
  isKeyboardLockedRef.current = isKeyboardLocked;

  const keypadWidth = Math.min(width, 500);
  const keySize = Math.min((keypadWidth - 88) / 4, (height * 0.52 - 32) / 5);
  const keyTouchWidth = keypadWidth / 4;

  const preview = useMemo(() => {
    if (!expression || justEvaluated) return null;

    const result = evaluateExpression(expression);
    return result === null ? null : formatResult(result);
  }, [expression, justEvaluated]);

  useEffect(() => stopContinuousDelete, []);

  useEffect(() => {
    if (!isKeyboardLocked) return;
    if (deleteDelayRef.current) clearTimeout(deleteDelayRef.current);
    if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
    deleteDelayRef.current = null;
    deleteIntervalRef.current = null;
  }, [isKeyboardLocked]);

  function clearExpression() {
    setExpression('');
    setCursorIndex(0);
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
    setCursorIndex(formattedResult.length);
    setJustEvaluated(true);
  }

  function updateExpression(key: string) {
    const startsNewCalculation = justEvaluated && (/^\d$/.test(key) || key === ',' || key === '()');
    const baseExpression = startsNewCalculation ? '' : expression;
    const insertionIndex = startsNewCalculation ? 0 : Math.min(cursorIndex, baseExpression.length);
    const prefix = baseExpression.slice(0, insertionIndex);
    const suffix = baseExpression.slice(insertionIndex);
    let updatedPrefix = prefix;

    if (/^\d$/.test(key)) updatedPrefix = appendDigit(prefix, key);
    else if (key === ',') updatedPrefix = appendDecimal(prefix);
    else if (key === '()') updatedPrefix = toggleParenthesis(prefix);
    else if (key === '+/−') updatedPrefix = toggleSign(prefix);
    else if (key === '%') {
      updatedPrefix = prefix && /[\d)]$/.test(prefix) ? `${prefix}%` : prefix;
    } else updatedPrefix = appendOperator(prefix, key);

    setExpression(updatedPrefix + suffix);
    setCursorIndex(updatedPrefix.length);
    setJustEvaluated(false);
  }

  function deleteBeforeCursor() {
    const currentExpression = expressionRef.current;
    const currentCursorIndex = cursorIndexRef.current;
    if (isKeyboardLockedRef.current || !currentExpression || currentCursorIndex === 0) return;

    const prefix = currentExpression.slice(0, currentCursorIndex);
    const suffix = currentExpression.slice(currentCursorIndex);
    const updatedPrefix = backspace(prefix);
    const updatedExpression = updatedPrefix + suffix;

    expressionRef.current = updatedExpression;
    cursorIndexRef.current = updatedPrefix.length;
    triggerKeyHaptic();
    setExpression(updatedExpression);
    setCursorIndex(cursorIndexRef.current);
    setJustEvaluated(false);

    if (cursorIndexRef.current === 0) stopContinuousDelete();
  }

  function startContinuousDelete() {
    stopContinuousDelete();
    deleteBeforeCursor();
    if (cursorIndexRef.current === 0) return;

    deleteDelayRef.current = setTimeout(() => {
      deleteBeforeCursor();
      if (cursorIndexRef.current === 0) return;
      deleteIntervalRef.current = setInterval(deleteBeforeCursor, 80);
    }, 420);
  }

  function stopContinuousDelete() {
    if (deleteDelayRef.current) clearTimeout(deleteDelayRef.current);
    if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
    deleteDelayRef.current = null;
    deleteIntervalRef.current = null;
  }

  function pressKey(key: string) {
    triggerKeyHaptic();
    if (isKeyboardLocked) return;

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
    triggerKeyHaptic();
    if (isKeyboardLocked) return;

    if (key === 'π') {
      const prefix = expression.slice(0, cursorIndex);
      const suffix = expression.slice(cursorIndex);
      const multiplication = prefix && /[\d)%]$/.test(prefix) ? '×' : '';
      const updatedPrefix = `${prefix}${multiplication}${Math.PI.toString().replace('.', ',')}`;
      setExpression(updatedPrefix + suffix);
      setCursorIndex(updatedPrefix.length);
    } else {
      const value = evaluateExpression(expression);
      if (value === null) return;

      const result = calculateScientificValue(key, value);
      if (Number.isFinite(result)) {
        const formattedResult = formatResult(result);
        setExpression(formattedResult);
        setCursorIndex(formattedResult.length);
      }
    }

    setJustEvaluated(false);
    setActiveTool(null);
  }

  function selectHistoryItem(result: string) {
    setExpression(result);
    setCursorIndex(result.length);
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
      action: deleteBeforeCursor,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <View style={styles.screen}>
        <View style={styles.display}>
          <ExpressionEditor
            expression={expression}
            cursorIndex={cursorIndex}
            availableWidth={Math.max(width - 68, 1)}
            onChangeCursor={(index) => {
              setCursorIndex(index);
              setJustEvaluated(false);
            }}
          />

          {preview && (
            <Text style={styles.preview} numberOfLines={1}>
              = {preview}
            </Text>
          )}

          {isKeyboardLocked && (
            <Text accessibilityRole="alert" style={styles.lockedMessage}>
              Teclado bloqueado
            </Text>
          )}
        </View>

        <View style={[styles.toolbar, { maxWidth: keypadWidth }]}>
          {toolbarItems.map(({ icon, label, action }, itemIndex) => {
            const isBackspace = icon === 'backspace';
            const disabled = isKeyboardLocked || (isBackspace && expression.length === 0);
            const iconOffset = [18, 6, -6, 8][itemIndex];

            return (
              <Pressable
                key={icon}
                style={styles.toolbarButton}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={
                  isBackspace
                    ? undefined
                    : () => {
                        triggerKeyHaptic();
                        action();
                      }
                }
                onPressIn={isBackspace ? startContinuousDelete : undefined}
                onPressOut={isBackspace ? stopContinuousDelete : undefined}
              >
                <View style={{ transform: [{ translateX: iconOffset }] }}>
                  <ToolbarIcon
                    name={icon}
                    color={
                      icon === 'backspace' ? (disabled ? '#315b25' : colors.green) : colors.muted
                    }
                  />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { maxWidth: keypadWidth - 40 }]} />

        <View style={[styles.keypad, { width: keypadWidth }]}>
          {calculatorRows.map((row, rowIndex) => (
            <View
              key={row.join('-')}
              style={[
                styles.keyRow,
                {
                  height:
                    keySize +
                    (rowIndex === 0 ? 24 : rowIndex === calculatorRows.length - 1 ? 14 : 8),
                },
              ]}
            >
              {row.map((key, columnIndex) => (
                <CalculatorKey
                  key={key}
                  label={key}
                  size={keySize}
                  touchWidth={keyTouchWidth}
                  faceOffsetX={15 - columnIndex * 10}
                  faceOffsetY={rowIndex === 0 ? 8 : rowIndex === calculatorRows.length - 1 ? -7 : 0}
                  disabled={isKeyboardLocked}
                  onPress={() => pressKey(key)}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <ToolSheet
        activeTool={activeTool}
        history={history}
        isKeyboardLocked={isKeyboardLocked}
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
  touchWidth,
  faceOffsetX,
  faceOffsetY,
  disabled,
  onPress,
}: {
  label: string;
  size: number;
  touchWidth: number;
  faceOffsetX: number;
  faceOffsetY: number;
  disabled: boolean;
  onPress: () => void;
}) {
  const textColor = label === 'C' ? colors.red : colors.white;
  const fontSize = size * (label === 'C' ? 0.43 : 0.47);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.key,
        { width: touchWidth, height: '100%' },
        disabled && styles.disabledKey,
        pressed && { opacity: disabled ? 0.35 : 0.78 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label === '()' ? 'Parênteses' : label}
      accessibilityState={{ disabled }}
      onPress={onPress}
    >
      <View
        style={[
          styles.keyFace,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ translateX: faceOffsetX }, { translateY: faceOffsetY }],
          },
        ]}
      >
        <KeyArtwork label={label} size={size} />
        {!hasDrawnGlyph(label) && (
          <Text allowFontScaling={false} style={[styles.keyText, { color: textColor, fontSize }]}>
            {label}
          </Text>
        )}
      </View>
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
