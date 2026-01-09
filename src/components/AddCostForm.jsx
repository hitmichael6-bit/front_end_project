import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { CURRENCIES } from "../services/currencyService";

/**
 * AddCostForm component - Provides a form interface for adding new cost entries
 * @param {Object} props - Component props
 * @param {Function} props.onCostAdded - Callback function invoked when a cost is successfully added
 * @returns {JSX.Element} Rendered form component with input fields for cost details
 */
const AddCostForm = ({ onCostAdded }) => {
  const [sum, setSum] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Handles form submission - Validates input and adds cost to database
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!sum || parseFloat(sum) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!category.trim()) {
      setError("Please enter a category");
      return;
    }

    try {
      await onCostAdded({
        sum: parseFloat(sum),
        currency,
        category: category.trim(),
        description: description.trim(),
      });

      setSum("");
      setCategory("");
      setDescription("");
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to add cost item");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add New Cost
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Cost added successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={sum}
          onChange={(e) => setSum(e.target.value)}
          margin="normal"
          required
          inputProps={{ step: "0.01", min: "0" }}
        />

        <TextField
          fullWidth
          select
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          margin="normal"
          required
        >
          {CURRENCIES.map((curr) => (
            <MenuItem key={curr} value={curr}>
              {curr}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Add Cost
        </Button>
      </Box>
    </Paper>
  );
};

export default AddCostForm;
