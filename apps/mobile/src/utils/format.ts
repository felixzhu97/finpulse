export function formatPrice(value: number, decimals = 2): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export function formatSigned(value: number, decimals = 2): string {
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
  if (value > 0) return `+${formatted}`;
  if (value < 0) return formatted;
  return "0";
}

export function formatPercent(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatSignedPercent(value: number, decimals = 2): string {
  const percent = value * 100;
  const formatted = percent.toFixed(decimals);
  if (percent > 0) return `+${formatted}%`;
  if (percent < 0) return `${formatted}%`;
  return "0.00%";
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency + " ";
}

export function formatCompactCurrency(value: number, currency: string): string {
  const sym = getCurrencySymbol(currency);
  if (value >= 1e9) return `${sym}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${sym}${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${sym}${(value / 1e3).toFixed(2)}K`;
  return `${sym}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatCurrency(value: number, currency: string, decimals = 0): string {
  return `${currency} ${value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  })}`;
}

export function formatBalance(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

export function formatScreenDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale ?? undefined, {
    month: "long",
    day: "numeric",
  });
}

export function formatScreenDateLong(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale ?? undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatChartLabel(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale ?? undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatChartTooltipDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale ?? undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
