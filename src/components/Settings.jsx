import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import {
  getExchangeRateUrl,
  setExchangeRateUrl,
} from "../services/currencyService";

const Settings = () => {
  const [url, setUrl] = useState("");
  const [rates, setRates] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUrl = getExchangeRateUrl();
    setUrl(savedUrl);
    fetchRates(savedUrl);
  }, []);

  const fetchRates = async (ratesUrl) => {
    try {
      setError("");
      const response = await fetch(ratesUrl);
      const data = await response.json();
      setRates(data);
    } catch {
      setRates(null);
      setError("Failed to load exchange rates");
    }
  };

  const handleSave = () => {
    setExchangeRateUrl(url);
    fetchRates(url);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Exchange Rate URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        margin="normal"
        helperText="Enter the URL for fetching exchange rates (JSON format)"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Save Settings
      </Button>

      {rates && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Current Exchange Rates</Typography>
          <Typography>USD: {rates.USD}</Typography>
          <Typography>ILS: {rates.ILS}</Typography>
          <Typography>GBP: {rates.GBP}</Typography>
          <Typography>EURO: {rates.EURO}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default Settings;
