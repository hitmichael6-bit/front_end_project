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

/**
 * Settings component - Manages application settings including exchange rate URL configuration
 * @returns {JSX.Element} Settings form for configuring exchange rate API endpoint
 */
const Settings = () => {
  const [url, setUrl] = useState("");
  const [rates, setRates] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /**
   * Lifecycle hook - Loads saved exchange rate URL and fetches current rates on component mount
   */
  useEffect(() => {
    const savedUrl = getExchangeRateUrl();
    setUrl(savedUrl);
    fetchRates(savedUrl);
  }, []);

  /**
   * Fetches exchange rates from the provided URL
   * @param {string} ratesUrl - URL endpoint for exchange rate API
   */
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

  /**
   * Saves the exchange rate URL to local storage and fetches updated rates
   */
  const handleSave = () => {
    setExchangeRateUrl(url);
    fetchRates(url);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    // Main container paper with elevation shadow and centered layout
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 3 }}>
      {/* Settings page title */}
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>

      {/* Success alert message - displayed when settings are saved successfully */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Error alert message - displayed when exchange rates fail to load */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Exchange rate URL input field */}
      <TextField
        fullWidth
        label="Exchange Rate URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        margin="normal"
        helperText="Enter the URL for fetching exchange rates (JSON format)"
      />

      {/* Button to save the exchange rate URL setting */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        Save Settings
      </Button>

      {/* Display current exchange rates if successfully loaded */}
      {rates && (
        <Box sx={{ mt: 3 }}>
          {/* Exchange rates section title */}
          <Typography variant="subtitle1">Current Exchange Rates</Typography>
          {/* Display individual currency rates */}
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
