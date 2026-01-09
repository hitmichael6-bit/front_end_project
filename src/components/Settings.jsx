// Import React and hooks for state and lifecycle management
import React, { useState, useEffect } from "react";
// Import Material-UI components for form and layout
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
// Import currency service functions for managing exchange rate URL
import {
  getExchangeRateUrl,
  setExchangeRateUrl,
} from "../services/currencyService";

/**
 * Settings component - Manages application settings including exchange rate URL configuration
 * @returns {JSX.Element} Settings form for configuring exchange rate API endpoint
 */
const Settings = () => {
  // State for managing the exchange rate URL input
  const [url, setUrl] = useState("");
  // State for storing the fetched exchange rates
  const [rates, setRates] = useState(null);
  // State for displaying success messages
  const [success, setSuccess] = useState(false);
  // State for displaying error messages
  const [error, setError] = useState("");

  /**
   * Lifecycle hook - Loads saved exchange rate URL and fetches current rates on component mount
   */
  useEffect(() => {
    // Retrieve the saved URL from local storage
    const savedUrl = getExchangeRateUrl();
    // Set the URL in the input field
    setUrl(savedUrl);
    // Fetch and display the current exchange rates
    fetchRates(savedUrl);
  }, []);

  /**
   * Fetches exchange rates from the provided URL
   * @param {string} ratesUrl - URL endpoint for exchange rate API
   */
  const fetchRates = async (ratesUrl) => {
    try {
      // Clear any previous error messages
      setError("");
      // Fetch exchange rates from the API
      const response = await fetch(ratesUrl);
      // Parse the JSON response
      const data = await response.json();
      // Store the rates in state for display
      setRates(data);
    } catch {
      // Clear rates if fetch fails
      setRates(null);
      // Display error message to user
      setError("Failed to load exchange rates");
    }
  };

  /**
   * Saves the exchange rate URL to local storage and fetches updated rates
   */
  const handleSave = () => {
    // Persist the URL to local storage
    setExchangeRateUrl(url);
    // Fetch the latest rates from the new URL
    fetchRates(url);
    // Display success message
    setSuccess(true);
    // Auto-hide success message after 3 seconds
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
          {/* Show the exchange rate for US Dollar */}
          <Typography>USD: {rates.USD}</Typography>
          {/* Show the exchange rate for Israeli Shekel */}
          <Typography>ILS: {rates.ILS}</Typography>
          {/* Show the exchange rate for British Pound */}
          <Typography>GBP: {rates.GBP}</Typography>
          {/* Show the exchange rate for Euro */}
          <Typography>EURO: {rates.EURO}</Typography>
        </Box>
      )}
    </Paper>
  );
};

// Export Settings component as default export
export default Settings;
