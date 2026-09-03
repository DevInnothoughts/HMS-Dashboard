
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/index.jsx";
import Loader from "./components/Loader.jsx";
import AppLayout from "./components/AppLayout.jsx";
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