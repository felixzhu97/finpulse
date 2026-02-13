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
