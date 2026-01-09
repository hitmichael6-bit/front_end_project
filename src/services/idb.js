/**
 * idb.js - ES6 Module version for React
 * IndexedDB wrapper library for the Cost Manager application.
 * Responsible for all data access and persistence logic.
 */

// Import function to get the exchange rate API URL
import { getExchangeRateUrl } from "./currencyService";

// Holds the active IndexedDB instance after opening the database
let dbInstance = null;

/**
 * Opens (or creates) the IndexedDB database.
 * Returns an object exposing the main data-access functions.
 */
export const openCostsDB = (databaseName, databaseVersion) => {
  return new Promise((resolve, reject) => {
    // Attempt to open the IndexedDB database with specified name and version
    const request = indexedDB.open(databaseName, databaseVersion);

    // Handle database open errors
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    // Handle successful database opening
    request.onsuccess = (event) => {
      // Store the database instance for future operations
      dbInstance = event.target.result;
      // Return an object with all database operation functions
      resolve({
        addCost,
        getReport,
        getCostsByCategory,
        getYearlyReport,
      });
    };

    // Creates object stores and indexes on first run or version upgrade
    request.onupgradeneeded = (event) => {
      // Get the database instance from the event
      const db = event.target.result;

      // Check if the "costs" object store already exists
      if (!db.objectStoreNames.contains("costs")) {
        // Create the "costs" object store with auto-incrementing ID
        const objectStore = db.createObjectStore("costs", {
          keyPath: "id",
          autoIncrement: true,
        });

        // Create index for searching by category
        objectStore.createIndex("category", "category", { unique: false });
        // Create index for searching by date added
        objectStore.createIndex("dateAdded", "dateAdded", { unique: false });
        // Create composite index for year and month queries
        objectStore.createIndex("year_month", ["year", "month"], {
          unique: false,
        });
        // Create index for yearly queries
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
    // Check if database is initialized before attempting operation
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    // Get current date and time for timestamp
    const now = new Date();
    // Create cost item object with date information
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

    // Create a read-write transaction for the "costs" object store
    const transaction = dbInstance.transaction(["costs"], "readwrite");
    // Get the object store from the transaction
    const objectStore = transaction.objectStore("costs");
    // Add the cost item to the database
    const request = objectStore.add(costItem);

    // Handle successful addition
    request.onsuccess = () => {
      // Return the added cost item data
      resolve({
        sum: costItem.sum,
        currency: costItem.currency,
        category: costItem.category,
        description: costItem.description,
      });
    };

    // Handle addition errors
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
    // Verify database is initialized
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    // Create a read-only transaction for the "costs" object store
    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    // Use year_month composite index for efficient querying
    const index = objectStore.index("year_month");
    // Get all costs for the specified year and month
    const request = index.getAll([year, month]);

    // Handle successful data retrieval
    request.onsuccess = async (event) => {
      // Extract costs from the result
      const costs = event.target.result;

      try {
        // Fetch current exchange rates for currency conversion
        const rates = await fetchExchangeRates();

        // Map costs to a simpler format for display
        const convertedCosts = costs.map((cost) => ({
          sum: cost.sum,
          currency: cost.currency,
          category: cost.category,
          description: cost.description,
          Date: { day: cost.day },
        }));

        // Calculate total by converting all costs to the target currency
        const total = convertedCosts.reduce((acc, cost) => {
          return (
            acc + convertCurrency(cost.sum, cost.currency, currency, rates)
          );
        }, 0);

        // Return the complete report with costs and total
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
        // Handle errors during currency conversion or data processing
        reject(error);
      }
    };

    // Handle query errors
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
    // Verify database is initialized
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    // Create a read-only transaction for the "costs" object store
    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    // Use year_month composite index for efficient querying
    const index = objectStore.index("year_month");
    // Get all costs for the specified year and month
    const request = index.getAll([year, month]);

    // Handle successful data retrieval
    request.onsuccess = async (event) => {
      // Extract costs from the result
      const costs = event.target.result;

      try {
        // Fetch current exchange rates for currency conversion
        const rates = await fetchExchangeRates();
        // Object to accumulate totals per category
        const categoryTotals = {};

        // Iterate through all costs to aggregate by category
        costs.forEach((cost) => {
          // Convert cost amount to target currency
          const convertedAmount = convertCurrency(
            cost.sum,
            cost.currency,
            currency,
            rates
          );

          // Add to existing category total or create new category entry
          if (categoryTotals[cost.category]) {
            categoryTotals[cost.category] += convertedAmount;
          } else {
            categoryTotals[cost.category] = convertedAmount;
          }
        });

        // Convert the category totals object to an array for the chart
        const chartData = Object.keys(categoryTotals).map((category) => ({
          name: category,
          value: categoryTotals[category],
        }));

        // Return the chart data array
        resolve(chartData);
      } catch (error) {
        // Handle errors during currency conversion or data processing
        reject(error);
      }
    };

    // Handle query errors
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
    // Verify database is initialized
    if (!dbInstance) {
      reject(new Error("Database not opened"));
      return;
    }

    // Create a read-only transaction for the "costs" object store
    const transaction = dbInstance.transaction(["costs"], "readonly");
    const objectStore = transaction.objectStore("costs");
    // Use year index for efficient querying
    const index = objectStore.index("year");
    // Get all costs for the specified year
    const request = index.getAll(year);

    // Handle successful data retrieval
    request.onsuccess = async (event) => {
      // Extract costs from the result
      const costs = event.target.result;

      try {
        // Fetch current exchange rates for currency conversion
        const rates = await fetchExchangeRates();
        // Initialize array with 12 zeros (one for each month)
        const monthlyTotals = Array(12).fill(0);

        // Iterate through all costs to aggregate by month
        costs.forEach((cost) => {
          // Convert cost amount to target currency
          const convertedAmount = convertCurrency(
            cost.sum,
            cost.currency,
            currency,
            rates
          );
          // Add to the appropriate month (month - 1 because array is 0-indexed)
          monthlyTotals[cost.month - 1] += convertedAmount;
        });

        // Array of abbreviated month names for chart labels
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

        // Convert monthly totals array to chart data format
        const chartData = monthlyTotals.map((total, index) => ({
          month: monthNames[index],
          total: total,
        }));

        // Return the chart data array
        resolve(chartData);
      } catch (error) {
        // Handle errors during currency conversion or data processing
        reject(error);
      }
    };

    // Handle query errors
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
  // Get the configured exchange rate URL from settings
  const url = getExchangeRateUrl();

  try {
    // Attempt to fetch exchange rates from the URL
    const response = await fetch(url);

    // Check if response status is OK (200)
    if (response.status !== 200) {
      throw new Error("Failed to fetch exchange rates");
    }

    // Parse and return the JSON response
    return await response.json();
  } catch {
    // Return fallback exchange rates if fetch fails
    return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
  }
};

/**
 * Converts a monetary amount from one currency to another
 * using USD as an intermediate reference.
 */
const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first (USD is the base currency)
  const amountInUSD = amount / rates[fromCurrency];
  // Convert from USD to target currency
  return amountInUSD * rates[toCurrency];
};
