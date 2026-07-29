import React from "react";
import { Route } from "react-router-dom";
import DoctorOpdPatientList from "../pages/Doctor/DoctorOpdPatientList";
import DoctorIpdPatientList from "../pages/Doctor/DoctorIpdPatientList";
import OpdPatientMedicalRecords from "../pages/Doctor/OpdPatientMedicalRecords";
import IpdPatientMedicalRecords from "../pages/Doctor/IpdPatientMedicalRecords";
import DoctorCallingCalendar from "../pages/Doctor/DoctorCallingCalendar";
import PendingSurgeryReport from "../pages/Doctor/DoctorReports/PendingSurgeryReport";

export const DoctorRoutes = (
  <>
    <Route path="/doctor-opd-patient-list" element={<DoctorOpdPatientList />} />
    <Route path="/doctor-ipd-patient-list" element={<DoctorIpdPatientList />} />
    <Route path="/personal-details-card" element={<OpdPatientMedicalRecords />} />
    <Route path="/ipd-patient-records" element={<IpdPatientMedicalRecords />} />
    <Route path="/doctor-calling-calendar" element={<DoctorCallingCalendar />} />
    <Route path="/doctor-pending-surgery-report" element={<PendingSurgeryReport />} />
  </>
);
