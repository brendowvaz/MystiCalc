export type CalculatorTool = 'history' | 'converter' | 'scientific' | null;

export type HistoryItem = {
  expression: string;
  result: string;
};
