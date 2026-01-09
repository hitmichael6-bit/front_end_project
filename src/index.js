// Import React library for component creation
import React from "react";
// Import ReactDOM for rendering React components to the DOM
import ReactDOM from "react-dom/client";
// Import the main App component
import App from "./App.jsx";

// Create root element for React 18+ concurrent rendering
const root = ReactDOM.createRoot(document.getElementById("root"));
// Render the App component wrapped in StrictMode for additional checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
