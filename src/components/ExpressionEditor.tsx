import { Pressable, Text, View } from 'react-native';

import { styles } from '../styles';
import { colors } from '../theme';

const HIGHLIGHTED_OPERATIONS = new Set(['+', '−', '×', '÷', '%']);

export function ExpressionEditor({
  expression,
  cursorIndex,
  availableWidth,
  onChangeCursor,
}: {
  expression: string;
  cursorIndex: number;
  availableWidth: number;
  onChangeCursor: (index: number) => void;
}) {
  const fontSize = getExpressionFontSize(expression.length, availableWidth);

  return (
    <View
      style={styles.expressionLine}
      accessible
      accessibilityLabel={expression || 'Visor vazio'}
      accessibilityHint="Toque em um caractere para posicionar o cursor depois dele"
    >
      <Pressable
        accessible={false}
        style={styles.expressionLeadingSpace}
        onPress={() => onChangeCursor(0)}
      />

      {cursorIndex === 0 && <ExpressionCaret fontSize={fontSize} />}

      {Array.from(expression).map((character, index) => (
        <View key={`${index}-${character}`} style={styles.expressionCharacterGroup}>
          <Pressable
            accessible={false}
            hitSlop={{ top: 12, bottom: 12, left: 3, right: 3 }}
            onPress={() => onChangeCursor(index + 1)}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.expressionCharacter,
                {
                  color: HIGHLIGHTED_OPERATIONS.has(character) ? colors.green : colors.white,
                  fontSize,
                  lineHeight: fontSize * 1.12,
                },
              ]}
            >
              {character}
            </Text>
          </Pressable>
          {cursorIndex === index + 1 && <ExpressionCaret fontSize={fontSize} />}
        </View>
      ))}
    </View>
  );
}

function ExpressionCaret({ fontSize }: { fontSize: number }) {
  return (
    <View style={styles.caretSlot}>
      <View style={[styles.caret, { height: fontSize * 0.96 }]} />
    </View>
  );
}

function getExpressionFontSize(length: number, availableWidth: number) {
  if (length <= 13) return 52;
  return Math.max(25, Math.min(35, availableWidth / (Math.max(length, 1) * 0.58)));
}
