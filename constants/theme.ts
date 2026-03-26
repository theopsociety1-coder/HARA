import { Platform } from 'react-native';

export const theme = {
  bg: "#0D0B0A",
  surface: "#161412",
  card: "#1E1A17",
  border: "#2A2420",
  accent: "#E8452C",
  accentSoft: "#FF6B4A",
  gold: "#D4A853",
  cream: "#F5ECD7",
  muted: "#7A6A5E",
  text: "#F0E6D3",
  textSub: "#9A8878",
  green: "#4A9E6B",
};

export const Colors = {
  light: {
    text: theme.text,
    background: theme.bg,
    tint: theme.accent,
    icon: theme.muted,
    tabIconDefault: theme.muted,
    tabIconSelected: theme.accent,
  },
  dark: {
    text: theme.text,
    background: theme.bg,
    tint: theme.accent,
    icon: theme.muted,
    tabIconDefault: theme.muted,
    tabIconSelected: theme.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    serif: 'serif',
    rounded: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Menlo',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "system-ui, 'Segoe UI', sans-serif",
    mono: "Menlo, Monaco, Consolas, monospace",
  },
});
