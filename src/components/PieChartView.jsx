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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CURRENCIES } from "../services/currencyService";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const PieChartView = ({ onGetCategoryData }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [currency, setCurrency] = useState("USD");
  const [data, setData] = useState([]);
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

  const handleGetData = async () => {
    try {
      setHasRequested(true);
      const chartData = await onGetCategoryData(year, month, currency);
      setData(chartData);
    } catch (err) {
      console.error("Failed to get chart data:", err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 900, mx: "auto", mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Costs by Category (Pie Chart)
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
          onClick={handleGetData}
          sx={{ minWidth: 120 }}
        >
          Show Chart
        </Button>
      </Box>
      {hasRequested && data.length === 0 && (
        <Typography color="text.secondary" align="center">
          No data for selected period
        </Typography>
      )}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
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
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default PieChartView;
