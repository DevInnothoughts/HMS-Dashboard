import React from "react";
import { Route } from "react-router-dom";
import DoctorOpdDashboard from "../pages/doctor/DoctorOpdDashboard";
import DoctorIpdDashboard from "../pages/doctor/DoctorIpdDashboard";
import DoctorPatientList from "../pages/doctor/DoctorPatientList";
import DoctorPatientDetails from "../pages/doctor/DoctorPatientDetails";

export const DoctorRoutes = (
  <>
    <Route path="/doctor-opd-dashboard" element={<DoctorOpdDashboard />} />
    <Route path="/doctor-ipd-dashboard" element={<DoctorIpdDashboard />} />
    <Route path="/doctor-patients" element={<DoctorPatientList />} />
    <Route path="/doctor-patient-details" element={<DoctorPatientDetails />} />
  </>
);
