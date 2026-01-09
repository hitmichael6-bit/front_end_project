import React, { useState } from "react";
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
import { CURRENCIES } from "../services/currencyService";

/**
 * MonthlyReport component - Displays detailed monthly cost report in tabular format
 * @param {Object} props - Component props
 * @param {Function} props.onGetReport - Callback to fetch monthly report data by year, month, and currency
 * @returns {JSX.Element} Monthly report table with cost details and total summary
 */
const MonthlyReport = ({ onGetReport }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [currency, setCurrency] = useState("USD");
  const [report, setReport] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
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
      setHasRequested(true);
      const reportData = await onGetReport(year, month, currency);
      setReport(reportData);
    } catch (err) {
      console.error("Failed to get report:", err);
    }
  };

  const hasNoData = hasRequested && report && report.costs.length === 0;

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Monthly Report
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
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

        <Button
          variant="contained"
          onClick={handleGetReport}
          sx={{ minWidth: 120 }}
        >
          Get Report
        </Button>
      </Box>

      {hasNoData && (
        <Typography color="text.secondary" align="center">
          No data for selected period
        </Typography>
      )}

      {report && report.costs.length > 0 && (
        <Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Currency</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
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

export default MonthlyReport;
