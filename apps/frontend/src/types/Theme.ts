export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export const isTheme = (s: unknown): s is Theme => {
  return Object.values(Theme).some((e) => e === s)
}
