import React from "react";
import { Route } from "react-router-dom";
import OpdPatientList from "../pages/Reception/OpdPatientList";
import IvrEnquiryList from "../pages/Reception/IvrEnquiryList";
import ChatbotEnquiryList from "../pages/Reception/ChatbotEnquiryList";
import WebEnquiryList from "../pages/Reception/WebEnquiryList";
import EnquiryList from "../pages/Reception/EnquiryList";
import AddEnquiry from "../pages/Reception/AddEnquiry";
import UnattendedEnquiryList from "../pages/Reception/UnattendedEnquiryList";
import CallingCalendar from "../pages/Reception/CallingCalendar";
import OpdAppointmentList from "../pages/Reception/OpdAppointmentList";
import AddOpdAppointment from "../pages/Reception/AddOpdAppointment";
import OpdReceiptList from "../pages/Reception/OpdReceiptList";
import AddLabReceipt from "../pages/Reception/AddLabReceipt";
import DailyClosing from "../pages/Reception/DailyClosing";
import DailyExpense from "../pages/Reception/DailyExpense";
import HospitalCertificates from "../pages/Reception/HospitalCertificates";

// Reports from ReceptionReports
import DailyOPDReport from "../pages/Reception/ReceptionReports/DailyOPDReport.jsx";
import BirthdayAlert from "../pages/Reception/ReceptionReports/BirthdayAlert.jsx";
import AppointmentConversion from "../pages/Reception/ReceptionReports/AppointmentConversion.jsx";
import EnquiryConversion from "../pages/Reception/ReceptionReports/EnquiryConversion.jsx";
import EnquiryData from "../pages/Reception/ReceptionReports/EnquiryData.jsx";
import OPDReceiptsReport from "../pages/Reception/ReceptionReports/OPDReceiptsReport.jsx";
import BillingReports from "../pages/Reception/ReceptionReports/BillingReports.jsx";
import ReferenceReport from "../pages/Reception/ReceptionReports/ReferenceReport.jsx";
import ConditionWiseReport from "../pages/Reception/ReceptionReports/ConditionWiseReport.jsx";
import CashDepositReport from "../pages/Reception/ReceptionReports/CashDepositReport.jsx";
import OPDCollectionReports from "../pages/Reception/ReceptionReports/OPDCollectionReports.jsx";
import PharmacyCollectionReport from "../pages/Reception/ReceptionReports/PharmacyCollectionReport.jsx";
import SxConversionReport from "../pages/Reception/ReceptionReports/SxConversionReport.jsx";
import OPDIPDCollection from "../pages/Reception/ReceptionReports/OPDIPDCollection.jsx";
import OPDIPDCollGraph from "../pages/Reception/ReceptionReports/OPDIPDCollGraph.jsx";
import DailyExpenseReport from "../pages/Reception/ReceptionReports/DailyExpenseReport.jsx";
import LostLeadReport from "../pages/Reception/ReceptionReports/LostLeadReport.jsx";

// Navbar for leads
import RecpEnquiriesNavBar from "../components/Navbar/RecpEnquiriesNavBar";

export const ReceptionRoutes = (
  <>
    <Route path="/opd-patient-list" element={<OpdPatientList />} />
    <Route path="/ivr-enquiry-list" element={<IvrEnquiryList />} />
    <Route path="/recp-enquiries-navbar" element={<RecpEnquiriesNavBar />} />
    <Route path="/chatbot-enquiry-list" element={<ChatbotEnquiryList />} />
    <Route path="/web-enquiry-list" element={<WebEnquiryList />} />
    <Route path="/unattended-enquiry-list" element={<UnattendedEnquiryList />} />
    <Route path="/opd-appointment-list" element={<OpdAppointmentList />} />
    <Route path="/add-opd-appointment" element={<AddOpdAppointment />} />
    <Route path="/opd-receipt-list" element={<OpdReceiptList />} />
    <Route path="/add-lab-receipt" element={<AddLabReceipt />} />
    <Route path="/daily-closing" element={<DailyClosing />} />
    <Route path="/daily-expense" element={<DailyExpense />} />
    <Route path="/hospital-certificates" element={<HospitalCertificates />} />
    <Route path="/enquiry-list" element={<EnquiryList />} />
    <Route path="/add-enquiry" element={<AddEnquiry />} />
    <Route path="/calling-calendar" element={<CallingCalendar />} />
    <Route path="/sx-conversion-report" element={<SxConversionReport />} />
    <Route path="/opd-ipd-collection" element={<OPDIPDCollection />} />
    <Route path="/opd-ipd-coll-graph" element={<OPDIPDCollGraph />} />
    <Route path="/daily-opd-report" element={<DailyOPDReport />} />
    <Route path="/birthday-alert" element={<BirthdayAlert />} />
    <Route path="/appointment-conversion" element={<AppointmentConversion />} />
    <Route path="/enquiry-conversion" element={<EnquiryConversion />} />
    <Route path="/enquiry-data" element={<EnquiryData />} />
    <Route path="/opd-receipts-report" element={<OPDReceiptsReport />} />
    <Route path="/billing-reports" element={<BillingReports />} />
    <Route path="/opd-collection-reports" element={<OPDCollectionReports />} />
    <Route path="/pharmacy-collection-report" element={<PharmacyCollectionReport />} />
    <Route path="/reference-report" element={<ReferenceReport />} />
    <Route path="/condition-wise-report" element={<ConditionWiseReport />} />
    <Route path="/cash-deposit-report" element={<CashDepositReport />} />
    <Route path="/daily-expense-report" element={<DailyExpenseReport />} />
    <Route path="/lost-lead-report" element={<LostLeadReport />} />
  </>
);
