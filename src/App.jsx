/* eslint-disable no-unused-vars */
// App.js - Updated

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/index.jsx";
import Loader from "./components/Loader.jsx"; // Import Loader
import AppLayout from "./components/AppLayout.jsx"; // Import the new layout component (Adjust path as needed)
import 'react-big-calendar/lib/css/react-big-calendar.css';

function App() {
  return (
    <>
      {/* Loader Start */}
      <Loader />
      {/* Loader End */}

      <Router basename="/hms">
        {/* Wrap all routes within AppLayout */}
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </Router>
    </>
  );
}

export default App;