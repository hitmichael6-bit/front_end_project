// Import React core and hooks for state and lifecycle management
import React, { useState, useEffect } from "react";
// Import Material-UI components for building the user interface
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
// Import custom React components for different app features
import AddCostForm from "./components/AddCostForm";
import MonthlyReport from "./components/MonthlyReport";
import PieChartView from "./components/PieChartView";
import BarChartView from "./components/BarChartView";
import Settings from "./components/Settings";
// Import IndexedDB service functions for database operations
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
  // State to track which tab is currently selected
  const [currentTab, setCurrentTab] = useState(0);
  // State to hold the IndexedDB instance after initialization
  const [db, setDb] = useState(null);

  /**
   * Lifecycle hook - Initializes IndexedDB connection on component mount
   */
  useEffect(() => {
    // Async function to initialize the database connection
    const initDb = async () => {
      try {
        // Open the costs database with version 1
        const database = await openCostsDB("costsdb", 1);
        // Store the database instance in state
        setDb(database);
      } catch (error) {
        // Log any errors that occur during database initialization
        console.error("Failed to open database:", error);
      }
    };

    // Call the initialization function
    initDb();
  }, []);

  /**
   * Adds a new cost entry to the database
   * @param {Object} cost - Cost object containing sum, currency, category, and description
   */
  const handleAddCost = async (cost) => {
    // Check if database is initialized before attempting to add cost
    if (db) {
      // Call the addCost method from the database instance
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
    // Verify database is available before fetching report
    if (db) {
      // Fetch and return the monthly report data
      return await db.getReport(year, month, currency);
    }
    // Return null if database is not initialized
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
    // Ensure database is ready before fetching category data
    if (db) {
      // Fetch costs grouped by category for the pie chart
      return await getCostsByCategory(year, month, currency);
    }
    // Return empty array if database is not available
    return [];
  };

  /**
   * Retrieves yearly cost data broken down by month
   * @param {number} year - Year for the data
   * @param {string} currency - Currency code for conversion
   * @returns {Promise<Array>} Array of monthly data objects with month name and total
   */
  const handleGetYearlyData = async (year, currency) => {
    // Check database availability before fetching yearly data
    if (db) {
      // Fetch monthly totals for the entire year for the bar chart
      return await getYearlyReport(year, currency);
    }
    // Return empty array if database is not initialized
    return [];
  };

  /**
   * Handles tab navigation changes
   * @param {Event} event - Tab change event
   * @param {number} newValue - Index of the newly selected tab
   */
  const handleTabChange = (event, newValue) => {
    // Update current tab state to switch between views
    setCurrentTab(newValue);
  };

  return (
    // Apply Material-UI theme to entire application
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides consistent styling baseline across browsers */}
      <CssBaseline />
      {/* Main container box with flexible growth */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Top navigation bar with fixed position */}
        <AppBar position="static">
          {/* Toolbar containing app title */}
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cost Manager
            </Typography>
          </Toolbar>
          {/* Tab navigation for switching between app sections */}
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

        {/* Main content area with responsive max width */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {/* Conditionally render components based on selected tab */}
          {currentTab === 0 && <AddCostForm onCostAdded={handleAddCost} />}
          {currentTab === 1 && <MonthlyReport onGetReport={handleGetReport} />}
          {/* Render pie chart view with category data handler */}
          {currentTab === 2 && (
            <PieChartView onGetCategoryData={handleGetCategoryData} />
          )}
          {/* Render bar chart view with yearly data handler */}
          {currentTab === 3 && (
            <BarChartView onGetYearlyData={handleGetYearlyData} />
          )}
          {/* Render settings component for configuration */}
          {currentTab === 4 && <Settings />}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

// Export App component as default export
export default App;
