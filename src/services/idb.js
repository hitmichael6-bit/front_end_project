/**
 * idb.js - ES6 Module version for React
 * IndexedDB wrapper library for the Cost Manager application.
 * Responsible for all data access and persistence logic.
 */

import { getExchangeRateUrl } from "./currencyService";

// Holds the active IndexedDB instance after opening the database
let dbInstance = null;

/**
 * Opens (or creates) the IndexedDB database.
 * Returns an object exposing the main data-access functions.
 */
export const openCostsDB = (databaseName, databaseVersion) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve({
        addCost,
        getReport,
        getCostsByCategory,
        getYearlyReport,
      });
    };

    // Creates object stores and indexes on first run or version upgrade
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("costs")) {
        const objectStore = db.createObjectStore("costs", {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("category", "category", { unique: false });
        objectStore.createIndex("dateAdded", "dateAdded", { unique: false });
        objectStore.createIndex("year_month", ["year", "month"], {
          unique: false,
        });
        objectStore.createIndex("year", "year", { unique: false });
      }
    };
  });
};

/**
 * Adds a new cost item to the database.
 * Automatically attaches the current date information.
 */
export const addCost = (cost) => {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    const now = new Date();
    const costItem = {
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description,
      dateAdded: now,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    const transaction = dbInstance.transaction(["costs"], "readwrite");
    const objectStore = transaction.objectStore("costs");
    const request = objectStore.add(costItem);

    request.onsuccess = () => {
      resolve({
        sum: costItem.sum,
        currency: costItem.currency,
        category: costItem.category,
        description: costItem.description,
      });
    };

    request.onerror = () => {
      reject(new Error("Failed to add cost item"));
    };
  });
};

/**
 * Returns a detailed monthly report for a given year, month, and currency.
 * The report includes individual cost items and a total sum.
 */
export const getReport = async (year, month, currency) => {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    const index = objectStore.index("year_month");
    const request = index.getAll([year, month]);

    request.onsuccess = async (event) => {
      const costs = event.target.result;

      try {
        const rates = await fetchExchangeRates();

        const convertedCosts = costs.map((cost) => ({
          sum: cost.sum,
          currency: cost.currency,
          category: cost.category,
          description: cost.description,
          Date: { day: cost.day },
        }));

        const total = convertedCosts.reduce((acc, cost) => {
          return (
            acc + convertCurrency(cost.sum, cost.currency, currency, rates)
          );
        }, 0);

        resolve({
          year,
          month,
          costs: convertedCosts,
          total: {
            currency,
            total,
          },
        });
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get report"));
    };
  });
};

/**
 * Returns aggregated cost totals per category for a given month and year.
 * Used as input data for the pie chart.
 */
export const getCostsByCategory = async (year, month, currency) => {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    const index = objectStore.index("year_month");
    const request = index.getAll([year, month]);

    request.onsuccess = async (event) => {
      const costs = event.target.result;

      try {
        const rates = await fetchExchangeRates();
        const categoryTotals = {};

        costs.forEach((cost) => {
          const convertedAmount = convertCurrency(
            cost.sum,
            cost.currency,
            currency,
            rates
          );

          if (categoryTotals[cost.category]) {
            categoryTotals[cost.category] += convertedAmount;
          } else {
            categoryTotals[cost.category] = convertedAmount;
          }
        });

        const chartData = Object.keys(categoryTotals).map((category) => ({
          name: category,
          value: categoryTotals[category],
        }));

        resolve(chartData);
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get costs by category"));
    };
  });
};

/**
 * Returns total costs per month for a given year and currency.
 * Used as input data for the yearly bar chart.
 */
export const getYearlyReport = async (year, currency) => {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    const index = objectStore.index("year");
    const request = index.getAll(year);

    request.onsuccess = async (event) => {
      const costs = event.target.result;

      try {
        const rates = await fetchExchangeRates();
        const monthlyTotals = Array(12).fill(0);

        costs.forEach((cost) => {
          const convertedAmount = convertCurrency(
            cost.sum,
            cost.currency,
            currency,
            rates
          );
          monthlyTotals[cost.month - 1] += convertedAmount;
        });

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const chartData = monthlyTotals.map((total, index) => ({
          month: monthNames[index],
          total: total,
        }));

        resolve(chartData);
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => {
      reject(new Error("Failed to get yearly report"));
    };
  });
};

/**
 * Fetches exchange rates from the configured URL.
 * Falls back to predefined static rates if the request fails.
 */
const fetchExchangeRates = async () => {
  const url = getExchangeRateUrl();

  try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error("Failed to fetch exchange rates");
    }

    return await response.json();
  } catch {
    return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
  }
};

/**
 * Converts a monetary amount from one currency to another
 * using USD as an intermediate reference.
 */
const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const amountInUSD = amount / rates[fromCurrency];
  return amountInUSD * rates[toCurrency];
};
