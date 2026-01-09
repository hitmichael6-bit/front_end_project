import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CURRENCIES } from "../services/currencyService";

/**
 * BarChartView component - Displays yearly cost data as a bar chart visualization
 * @param {Object} props - Component props
 * @param {Function} props.onGetYearlyData - Callback to fetch yearly cost data by year and currency
 * @returns {JSX.Element} Bar chart with year/currency selectors showing monthly cost breakdown
 */
const BarChartView = ({ onGetYearlyData }) => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [currency, setCurrency] = useState("USD");
  const [data, setData] = useState([]);
  const [hasRequested, setHasRequested] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  /**
   * Fetches and sets yearly cost data based on selected year and currency
   */
  const handleGetData = async () => {
    try {
      setHasRequested(true);
      const chartData = await onGetYearlyData(year, currency);
      setData(chartData);
    } catch (err) {
      console.error("Failed to get yearly data:", err);
    }
  };

  const hasAnyData = data.some((item) => Number(item.total) > 0);

  return (
    // Main container paper with elevation shadow and centered layout
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 3 }}>
      {/* Chart title */}
      <Typography variant="h5" gutterBottom>
        Yearly Costs (Bar Chart)
      </Typography>

      {/* Filter controls section - Year and Currency selectors with Show Chart button */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* Year selector dropdown */}
        <TextField
          select
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        {/* Currency selector dropdown */}
        <TextField
          select
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          sx={{ minWidth: 100 }}
        >
          {CURRENCIES.map((curr) => (
            <MenuItem key={curr} value={curr}>
              {curr}
            </MenuItem>
          ))}
        </TextField>

        {/* Button to fetch and display chart data */}
        <Button
          variant="contained"
          onClick={handleGetData}
          sx={{ minWidth: 120 }}
        >
          Show Chart
        </Button>
      </Box>

      {/* Display message when no data exists for the selected period */}
      {hasRequested && data.length > 0 && !hasAnyData && (
        <Typography color="text.secondary" align="center">
          No data for selected period
        </Typography>
      )}

      {/* Display bar chart when data is available */}
      {data.length > 0 && hasAnyData && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            {/* Grid lines for chart readability */}
            <CartesianGrid strokeDasharray="3 3" />
            {/* X-axis showing months */}
            <XAxis dataKey="month" />
            {/* Y-axis showing cost values */}
            <YAxis />
            {/* Tooltip for hovering over bars */}
            <Tooltip />
            {/* Legend explaining the chart data */}
            <Legend />
            {/* Bar representation of monthly totals */}
            <Bar dataKey="total" fill="#8884d8" name={`Total (${currency})`} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default BarChartView;
