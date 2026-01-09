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

const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [db, setDb] = useState(null);

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

  const handleAddCost = async (cost) => {
    if (db) {
      await db.addCost(cost);
    }
  };

  const handleGetReport = async (year, month, currency) => {
    if (db) {
      return await db.getReport(year, month, currency);
    }
    return null;
  };

  const handleGetCategoryData = async (year, month, currency) => {
    if (db) {
      return await getCostsByCategory(year, month, currency);
    }
    return [];
  };

  const handleGetYearlyData = async (year, currency) => {
    if (db) {
      return await getYearlyReport(year, currency);
    }
    return [];
  };

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
