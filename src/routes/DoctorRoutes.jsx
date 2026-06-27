import React from "react";
import { Route } from "react-router-dom";
import DoctorOpdPatientList from "../pages/Doctor/DoctorOpdPatientList";
import OpdPatientMedicalRecords from "../pages/Doctor/OpdPatientMedicalRecords";
import DoctorCallingCalendar from "../pages/Doctor/DoctorCallingCalendar";

export const DoctorRoutes = (
  <>
    <Route path="/doctor-opd-patient-list" element={<DoctorOpdPatientList />} />
    <Route path="/personal-details-card" element={<OpdPatientMedicalRecords />} />
    <Route path="/doctor-calling-calendar" element={<DoctorCallingCalendar />} />
  </>
);
