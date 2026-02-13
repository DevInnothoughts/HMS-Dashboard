import React from "react";
import { Route } from "react-router-dom";
import Add_Enquiry from "../pages/Reports/Add_Enquiry.jsx";
import EnquiryList from "../pages/Reports/Enquiry_List";
import ReceiptList from "../pages/Reports/ReceiptList";
// import Payment_list from "../pages/Reports/Payment_list";
// import FDE_details_list from "../pages/Reports/fde_details_list";
import DailyOPDReport from "../pages/Reports/Manage Reports/DailyOPDReport.jsx";
import BirthdayAlert from "../pages/Reports/Manage Reports/BirthdayAlert.jsx";
import AppointmentConversion from "../pages/Reports/Manage Reports/AppointmentConversion.jsx";
import EnquiryConversion from "../pages/Reports/Manage Reports/EnquiryConversion.jsx";
import EnquiryData from "../pages/Reports/Manage Reports/EnquiryData.jsx";
import OPDReceiptsReport from "../pages/Reports/Manage Reports/OPDReceiptsReport.jsx";
import BillingReports from "../pages/Reports/Manage Reports/BillingReports.jsx";
import IPDCollectionReport from "../pages/Reports/Manage Reports/IPDCollectionReport.jsx";
import ReferenceReport from "../pages/Reports/Manage Reports/ReferenceReport.jsx";
import ConditionWiseReport from "../pages/Reports/Manage Reports/ConditionWiseReport.jsx";

export const ReportRoutes = (
  <>
    <Route path="/reports/enquiry" element={<EnquiryList />} />
    <Route path="/reports/enquiry/add" element={<Add_Enquiry />} />
    {/* <Route path="/reports/payment" element={<Payment_list />} /> */}
    <Route path="/reports/receipts" element={<ReceiptList />} />
    {/* <Route path="/reports/fde" element={<FDE_details_list />} /> */}
    <Route path="/dailyOPDReport" element={<DailyOPDReport />} />
    <Route path="/BirthdayAlert" element={<BirthdayAlert />} />
    <Route path="/appointmentConversion" element={<AppointmentConversion />} />
    <Route path="/enquiryConversation" element={<EnquiryConversion />} />
    <Route path="/enquiryData" element={<EnquiryData />} />
    <Route path="/oPDReceiptsReport" element={<OPDReceiptsReport />} />
    <Route path="/BillingReport" element={<BillingReports />} />
    <Route path="/IPDCollectionReport" element={<IPDCollectionReport />} />
    <Route path="/referenceReport" element={<ReferenceReport />} />
    <Route path="/conditionWiseReport" element={<ConditionWiseReport />} />
  </>
);
