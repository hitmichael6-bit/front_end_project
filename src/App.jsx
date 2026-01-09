import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import AddCostForm from "./components/AddCostForm";
import MonthlyReport from "./components/MonthlyReport";
import PieChartView from "./components/PieChartView";
import BarChartView from "./components/BarChartView";
import Settings from "./components/Settings";
import {
  openCostsDB,
  addCost,
  getReport,
  getCostsByCategory,
  getYearlyReport,
} from "./services/idb";

/**
 * Material-UI theme configuration with custom color palette
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

/**
 * App component - Main application container managing cost tracking functionality
 * Handles IndexedDB initialization and provides data management callbacks to child components
 * @returns {JSX.Element} Application with tabbed navigation and cost management features
 */
const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [db, setDb] = useState(null);

  /**
   * Lifecycle hook - Initializes IndexedDB connection on component mount
   */
  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await openCostsDB("costsdb", 1);
        setDb(database);
      } catch (error) {
        console.error("Failed to open database:", error);
      }
    };

    initDb();
  }, []);

  /**
   * Adds a new cost entry to the database
   * @param {Object} cost - Cost object containing sum, currency, category, and description
   */
  const handleAddCost = async (cost) => {
    if (db) {
      await db.addCost(cost);
    }
  };

  /**
   * Retrieves monthly cost report from database
   * @param {number} year - Year for the report
   * @param {number} month - Month for the report (1-12)
   * @param {string} currency - Currency code for conversion
   * @returns {Promise<Object|null>} Report data with costs and total, or null if no database
   */
  const handleGetReport = async (year, month, currency) => {
    if (db) {
      return await db.getReport(year, month, currency);
    }
    return null;
  };

  /**
   * Retrieves cost data grouped by category for a specific month
   * @param {number} year - Year for the data
   * @param {number} month - Month for the data (1-12)
   * @param {string} currency - Currency code for conversion
   * @returns {Promise<Array>} Array of category data objects with name and value
   */
  const handleGetCategoryData = async (year, month, currency) => {
    if (db) {
      return await getCostsByCategory(year, month, currency);
    }
    return [];
  };

  /**
   * Retrieves yearly cost data broken down by month
   * @param {number} year - Year for the data
   * @param {string} currency - Currency code for conversion
   * @returns {Promise<Array>} Array of monthly data objects with month name and total
   */
  const handleGetYearlyData = async (year, currency) => {
    if (db) {
      return await getYearlyReport(year, currency);
    }
    return [];
  };

  /**
   * Handles tab navigation changes
   * @param {Event} event - Tab change event
   * @param {number} newValue - Index of the newly selected tab
   */
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cost Manager
            </Typography>
          </Toolbar>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            centered
          >
            <Tab label="Add Cost" />
            <Tab label="Monthly Report" />
            <Tab label="Pie Chart" />
            <Tab label="Bar Chart" />
            <Tab label="Settings" />
          </Tabs>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {currentTab === 0 && <AddCostForm onCostAdded={handleAddCost} />}
          {currentTab === 1 && <MonthlyReport onGetReport={handleGetReport} />}
          {currentTab === 2 && (
            <PieChartView onGetCategoryData={handleGetCategoryData} />
          )}
          {currentTab === 3 && (
            <BarChartView onGetYearlyData={handleGetYearlyData} />
          )}
          {currentTab === 4 && <Settings />}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
