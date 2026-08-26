import React from "react";
import { Route } from "react-router-dom";
import DoctorOpdPatientList from "../pages/Doctor/DoctorOpdPatientList";
import DoctorIpdPatientList from "../pages/Doctor/DoctorIpdPatientList";
import OpdPatientMedicalRecords from "../pages/Doctor/OpdPatientMedicalRecords";
import IpdPatientMedicalRecords from "../pages/Doctor/IpdPatientMedicalRecords";
import DoctorCallingCalendar from "../pages/Doctor/DoctorCallingCalendar";
import PendingSurgeryReport from "../pages/Doctor/DoctorReports/PendingSurgeryReport";
import DiagnosisReport from "../pages/Doctor/DoctorReports/DiagnosisReport";
import SxConversionReport from "../pages/Doctor/DoctorReports/SxConversionReport";
import FollowUpComplianceReport from "../pages/Doctor/DoctorReports/FollowUpComplianceReport";
import DoctorPerformanceReport from "../pages/Doctor/DoctorReports/DoctorPerformanceReport";
import PatientFeedbackReport from "../pages/Doctor/DoctorReports/PatientFeedbackReport";
import DiagnosisCardPrintPreview from "../pages/Doctor/DiagnosisCardPrintPreview";

export const DoctorRoutes = (
  <>
    <Route path="/doctor-opd-patient-list" element={<DoctorOpdPatientList />} />
    <Route path="/doctor-ipd-patient-list" element={<DoctorIpdPatientList />} />
    <Route path="/personal-details-card" element={<OpdPatientMedicalRecords />} />
    <Route path="/ipd-patient-records" element={<IpdPatientMedicalRecords />} />
    <Route path="/doctor-calling-calendar" element={<DoctorCallingCalendar />} />
    <Route path="/diagnosis-report" element={<DiagnosisReport />} />
    <Route path="/doctor-performance-report" element={<DoctorPerformanceReport />} />
    <Route path="/follow-up-compliance-report" element={<FollowUpComplianceReport />} />
    <Route path="/patient-feedback-report" element={<PatientFeedbackReport />} />
    <Route path="/sx-conversion-report" element={<SxConversionReport />} />
    <Route path="/doctor-pending-surgery-report" element={<PendingSurgeryReport />} />
    <Route path="/diagnosis-card-preview" element={<DiagnosisCardPrintPreview />} />
  </>
);
