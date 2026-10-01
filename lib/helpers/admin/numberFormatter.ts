export function formatKpiNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0";

  if (num < 1000000) {
    // Under 10 Lakhs: show exact number with Indian comma formatting (e.g. 1,00,000)
    return num.toLocaleString("en-IN");
  } else if (num < 1000000000) {
    // 10 Lakhs to 1 Billion: show in Millions (e.g. 1.2M)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else {
    // 1 Billion and above: show in Billions (e.g. 1.5B)
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
}
