// Import React and useState hook for managing component state
import React, { useState } from "react";
// Import Material-UI components for form and layout
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
} from "@mui/material";
// Import Recharts components for pie chart visualization
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
// Import currency constants from the currency service
import { CURRENCIES } from "../services/currencyService";

/**
 * Color palette for pie chart segments
 */
// Array of hex colors for different pie chart slices
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

/**
 * PieChartView component - Visualizes monthly costs grouped by category using a pie chart
 * @param {Object} props - Component props
 * @param {Function} props.onGetCategoryData - Callback to fetch category-wise cost data by year, month, and currency
 * @returns {JSX.Element} Pie chart displaying cost distribution across categories
 */
const PieChartView = ({ onGetCategoryData }) => {
  // Get the current year and month for default values
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // State for managing selected year filter
  const [year, setYear] = useState(currentYear);
  // State for managing selected month filter
  const [month, setMonth] = useState(currentMonth);
  // State for managing selected currency for conversion
  const [currency, setCurrency] = useState("USD");
  // State for storing the fetched chart data
  const [data, setData] = useState([]);
  // State to track if user has requested chart data
  const [hasRequested, setHasRequested] = useState(false);

  // Generate array of years for the dropdown (current year and 9 previous years)
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  // Array of month objects with value and label for the dropdown
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  /**
   * Fetches and sets category cost data based on selected year, month, and currency
   */
  const handleGetData = async () => {
    try {
      // Mark that chart data has been requested
      setHasRequested(true);
      // Fetch category data from parent component callback
      const chartData = await onGetCategoryData(year, month, currency);
      // Store the fetched data in state for chart rendering
      setData(chartData);
    } catch (err) {
      // Log any errors that occur during data fetching
      console.error("Failed to get chart data:", err);
    }
  };

  return (
    // Main container paper with elevation shadow and centered layout
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 3 }}>
      {/* Chart title */}
      <Typography variant="h5" gutterBottom>
        Costs by Category (Pie Chart)
      </Typography>

      {/* Filter controls section - Year, Month, Currency selectors and Show Chart button */}
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

        {/* Month selector dropdown */}
        <TextField
          select
          label="Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          {months.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
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
      {hasRequested && data.length === 0 && (
        <Typography color="text.secondary" align="center">
          No data for selected period
        </Typography>
      )}
      {/* Display pie chart when data is available */}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            {/* Pie chart component showing category distribution */}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value.toFixed(2)}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {/* Map data entries to colored pie slices */}
              {/* Each slice gets a color from the COLORS array */}
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            {/* Tooltip for hovering over pie slices */}
            <Tooltip />
            {/* Legend showing category names and colors */}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// Export PieChartView component as default export
export default PieChartView;
