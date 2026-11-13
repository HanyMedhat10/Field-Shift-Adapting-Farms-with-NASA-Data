export type CountryCode = "EG" | "US";

export const EGP_PER_FEDDAN_TO_USD_PER_ACRE_DIVISOR = 48;

export function convertProfitByCountry(
  amountEgp: number,
  country: CountryCode
): number {
  if (country === "US") {
    return Math.round(amountEgp / EGP_PER_FEDDAN_TO_USD_PER_ACRE_DIVISOR);
  }
  return Math.round(amountEgp);
}

export function formatProfitWithUnit(
  amountEgp: number,
  country: CountryCode,
  isAr: boolean
): string {
  const val = convertProfitByCountry(amountEgp, country).toLocaleString(
    "en-US"
  );
  if (country === "US") {
    return `$${val} USD / Acre`;
  }
  return isAr ? `${val} ج.م / فدان` : `${val} EGP / Feddan`;
}

export function formatProfitShort(
  amountEgp: number,
  country: CountryCode,
  isAr: boolean
): string {
  const val = convertProfitByCountry(amountEgp, country).toLocaleString(
    "en-US"
  );
  if (country === "US") {
    return `$${val} USD`;
  }
  return isAr ? `${val} ج.م` : `${val} EGP`;
}

