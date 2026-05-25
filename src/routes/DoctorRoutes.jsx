import React from "react";
import { Route } from "react-router-dom";
import DoctorOpdDashboard from "../pages/doctor/DoctorOpdDashboard";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorPatientList from "../pages/doctor/DoctorPatientList";
import PersonalDetailsCard from "../pages/doctor/PersonalDetailsCard";
import DoctorManageAdmission from "../pages/doctor/DoctorManageAdmission";
import DoctorSearchBy from "../pages/doctor/DoctorSearchBy";
import DoctorCallingCalendar from "../pages/doctor/DoctorCallingCalendar";

export const DoctorRoutes = (
  <>
    <Route path="/doctor-opd-dashboard" element={<DoctorOpdDashboard />} />
    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
    <Route path="/doctor-patients" element={<DoctorPatientList />} />
    <Route path="/doctor-patient-details" element={<PersonalDetailsCard />} />
    <Route path="/doctor-manage-admission" element={<DoctorManageAdmission />} />
    <Route path="/doctor-search-by" element={<DoctorSearchBy />} />
    <Route path="/doctor-calling-calendar" element={<DoctorCallingCalendar />} />

  </>
);
