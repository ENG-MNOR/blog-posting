import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';

const readVar = (name: string) => {
  if (typeof window === 'undefined') return '#0F4C81';
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? `rgb(${raw})` : '#0F4C81';
};

export interface ChartTheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  destructive: string;
  muted: string;
  grid: string;
  axis: string;
  categorical: string[];
}

const build = (): ChartTheme => {
  const primary = readVar('--color-primary');
  const secondary = readVar('--color-secondary');
  const accent = readVar('--color-accent');
  const success = readVar('--color-success');
  const warning = readVar('--color-warning');
  const destructive = readVar('--color-destructive');
  return {
    primary,
    secondary,
    accent,
    success,
    warning,
    destructive,
    muted: readVar('--color-muted-foreground'),
    grid: readVar('--color-border'),
    axis: readVar('--color-muted-foreground'),
    categorical: [primary, secondary, accent, success, warning, destructive],
  };
};

/** Recharts needs concrete color strings; presentation attrs can't use var(). */
export const useChartTheme = (): ChartTheme => {
  const theme = useThemeStore((s) => s.theme);
  const [value, setValue] = useState<ChartTheme>(build);
  useEffect(() => {
    // Wait a frame so the .dark class / CSS vars have settled.
    const id = requestAnimationFrame(() => setValue(build()));
    return () => cancelAnimationFrame(id);
  }, [theme]);
  return value;
};
