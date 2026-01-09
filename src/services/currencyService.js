/**
 * Currency service for managing exchange rates
 * Provides a centralized place for supported currencies
 * and for storing / retrieving the exchange rate API URL.
 */

// List of supported currency symbols (as required by the project)
export const CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

// Default public URL for fetching exchange rates (fallback)
export const DEFAULT_EXCHANGE_RATE_URL =
  "https://hitmichael6-bit.github.io/FrontEndCosts/rates.json";

/**
 * Returns the exchange rate URL to be used by the application.
 * If the user configured a custom URL in Settings, it is returned.
 * Otherwise, the default public URL is used.
 */
export const getExchangeRateUrl = () => {
  return localStorage.getItem("exchangeRateUrl") || DEFAULT_EXCHANGE_RATE_URL;
};

/**
 * Saves a custom exchange rate URL provided by the user.
 * The value is persisted in localStorage and used by idb.js.
 */
export const setExchangeRateUrl = (url) => {
  localStorage.setItem("exchangeRateUrl", url);
};
