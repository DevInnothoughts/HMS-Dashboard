import React from "react";
import { Route } from "react-router-dom";
import Add_Enquiry from "../pages/Reports/Add_Enquiry.jsx";
import EnquiryList from "../pages/Reports/Enquiry_List";
import ReceiptList from "../pages/Reports/ReceiptList";
import Payment_list from "../pages/Reports/Payment_list";
import FDE_details_list from "../pages/Reports/fde_details_list";

export const ReportRoutes = (
  <>
    <Route path="/reports/enquiry" element={<EnquiryList />} />
    <Route path="/reports/enquiry/add" element={<Add_Enquiry />} />
    <Route path="/reports/payment" element={<Payment_list />} />
    <Route path="/reports/receipts" element={<ReceiptList />} />
    <Route path="/reports/fde" element={<FDE_details_list />} />
  </>
);
