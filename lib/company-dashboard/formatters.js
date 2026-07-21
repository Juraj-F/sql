export function formatColumn(column) {
  return column
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatValue(value, column) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (
    column.includes("date") ||
    column.includes("updated_at")
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
      }).format(date);
    }
  }

  if (
    column.includes("budget") ||
    column.includes("amount") ||
    column.includes("revenue") ||
    column.includes("cost")
  ) {
    const number = Number(value);

    if (!Number.isNaN(number)) {
      return new Intl.NumberFormat("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}