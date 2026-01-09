/**
 * idb.js - Vanilla JavaScript version
 * IndexedDB wrapper library for the Cost Manager application.
 * Exposes a global window.idb object with a Promise-based API.
 */

(function () {
  "use strict";

  // Holds the active IndexedDB instance after opening the database
  let dbInstance = null;

  /**
   * Opens (or creates) the IndexedDB database.
   * Returns an object exposing the main data-access functions.
   */
  const openCostsDB = function (databaseName, databaseVersion) {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open(databaseName, databaseVersion);

      request.onerror = function () {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = function (event) {
        dbInstance = event.target.result;

        const dbWrapper = {
          addCost: addCost,
          getReport: getReport,
        };

        resolve(dbWrapper);
      };

      // Creates object store and indexes on first run or version upgrade
      request.onupgradeneeded = function (event) {
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
        }
      };
    });
  };

  /**
   * Adds a new cost item to the database.
   * Automatically attaches the current date information.
   */
  const addCost = function (cost) {
    return new Promise(function (resolve, reject) {
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

      request.onsuccess = function () {
        resolve({
          sum: costItem.sum,
          currency: costItem.currency,
          category: costItem.category,
          description: costItem.description,
        });
      };

      request.onerror = function () {
        reject(new Error("Failed to add cost item"));
      };
    });
  };

  /**
   * Returns a detailed monthly report for a given year, month, and currency.
   * Includes individual cost items and a calculated total.
   */
  const getReport = function (year, month, currency) {
    return new Promise(function (resolve, reject) {
      if (!dbInstance) {
        reject(new Error("Database not opened"));
        return;
      }

      const transaction = dbInstance.transaction(["costs"], "readonly");
      const objectStore = transaction.objectStore("costs");
      const index = objectStore.index("year_month");
      const request = index.getAll([year, month]);

      request.onsuccess = function (event) {
        const costs = event.target.result;

        fetchExchangeRates()
          .then(function (rates) {
            const convertedCosts = costs.map(function (cost) {
              return {
                sum: cost.sum,
                currency: cost.currency,
                category: cost.category,
                description: cost.description,
                Date: { day: cost.day },
              };
            });

            const total = convertedCosts.reduce(function (acc, cost) {
              return (
                acc + convertCurrency(cost.sum, cost.currency, currency, rates)
              );
            }, 0);

            resolve({
              year: year,
              month: month,
              costs: convertedCosts,
              total: {
                currency: currency,
                total: total,
              },
            });
          })
          .catch(function (error) {
            reject(error);
          });
      };

      request.onerror = function () {
        reject(new Error("Failed to get report"));
      };
    });
  };

  /**
   * Fetches exchange rates from the configured URL.
   * Falls back to static rates if the request fails.
   */
  const fetchExchangeRates = function () {
    const url =
      localStorage.getItem("exchangeRateUrl") ||
      "https://your-exchange-rate-url.com/rates.json";

    return fetch(url)
      .then(function (response) {
        if (response.status !== 200) {
          throw new Error("Failed to fetch exchange rates");
        }
        return response.json();
      })
      .catch(function () {
        return { USD: 1, GBP: 0.6, EURO: 0.7, ILS: 3.4 };
      });
  };

  /**
   * Converts a monetary amount from one currency to another
   * using USD as an intermediate reference.
   */
  const convertCurrency = function (amount, fromCurrency, toCurrency, rates) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const amountInUSD = amount / rates[fromCurrency];
    return amountInUSD * rates[toCurrency];
  };

  // Expose the public API on the global window object
  window.idb = {
    openCostsDB: openCostsDB,
  };
})();
