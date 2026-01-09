// Import React and useState hook for managing component state
import React, { useState } from "react";
// Import Material-UI components for form, table, and layout
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
// Import currency constants from the currency service
import { CURRENCIES } from "../services/currencyService";

/**
 * MonthlyReport component - Displays detailed monthly cost report in tabular format
 * @param {Object} props - Component props
 * @param {Function} props.onGetReport - Callback to fetch monthly report data by year, month, and currency
 * @returns {JSX.Element} Monthly report table with cost details and total summary
 */
const MonthlyReport = ({ onGetReport }) => {
  // Get the current year and month for default values
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // State for managing selected year filter
  const [year, setYear] = useState(currentYear);
  // State for managing selected month filter
  const [month, setMonth] = useState(currentMonth);
  // State for managing selected currency for conversion
  const [currency, setCurrency] = useState("USD");
  // State for storing the fetched report data
  const [report, setReport] = useState(null);
  // State to track if user has requested a report
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
   * Fetches and sets monthly report data based on selected year, month, and currency
   */
  const handleGetReport = async () => {
    try {
      // Mark that a report has been requested
      setHasRequested(true);
      // Fetch report data from parent component callback
      const reportData = await onGetReport(year, month, currency);
      // Store the fetched report in state
      setReport(reportData);
    } catch (err) {
      // Log any errors that occur during report fetching
      console.error("Failed to get report:", err);
    }
  };

  // Check if report was requested but contains no cost data
  const hasNoData = hasRequested && report && report.costs.length === 0;

  return (
    // Main container paper with elevation shadow and centered layout
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 3 }}>
      {/* Report title */}
      <Typography variant="h5" gutterBottom>
        Monthly Report
      </Typography>

      {/* Filter controls section - Year, Month, Currency selectors and Get Report button */}
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
          {/* Map through available currencies to create menu items */}
          {CURRENCIES.map((curr) => (
            <MenuItem key={curr} value={curr}>
              {curr}
            </MenuItem>
          ))}
        </TextField>

        {/* Button to fetch the report based on selected filters */}
        <Button
          variant="contained"
          onClick={handleGetReport}
          sx={{ minWidth: 120 }}
        >
          Get Report
        </Button>
      </Box>

      {/* Display message when no data is available for the selected period */}
      {hasNoData && (
        <Typography color="text.secondary" align="center">
          No data for selected period
        </Typography>
      )}

      {/* Display report table when data is available */}
      {report && report.costs.length > 0 && (
        <Box>
          {/* Table displaying all cost entries */}
          <TableContainer>
            <Table>
              {/* Table header with column names */}
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              {/* Table body with cost data rows */}
              <TableBody>
                {/* Map through cost items to create table rows */}
                {report.costs.map((cost, index) => (
                  <TableRow key={index}>
                    <TableCell>{cost.Date.day}</TableCell>
                    <TableCell>{cost.category}</TableCell>
                    <TableCell>{cost.description}</TableCell>
                    <TableCell>{cost.sum.toFixed(2)}</TableCell>
                    <TableCell>{cost.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total sum section displayed at the bottom right */}
          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Typography variant="h6">
              Total: {report.total.total.toFixed(2)} {report.total.currency}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

// Export MonthlyReport component as default export
export default MonthlyReport;
