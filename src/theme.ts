export const colors = {
  black: '#000000',
  divider: '#282828',
  white: '#f0f0f2',
  muted: '#929296',
  green: '#79d43f',
  equal: '#369900',
  red: '#fb6969',
  caret: '#a2d9d9',
} as const;

export const calculatorRows = [
  ['C', '()', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['+/−', '0', ',', '='],
] as const;
