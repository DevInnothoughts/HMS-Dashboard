import React from "react";
import { Route } from "react-router-dom";
import EnquiryList from "../pages/Reports/Enquiry_List";
import PaymentList from "../pages/Reports/Payment_list";
import ReceiptList from "../pages/Reports/ReceiptList";
import FDEList from "../pages/Reports/fde_details_list";

export const ReportRoutes = (
  <>
    <Route path="/reports/enquiry" element={<EnquiryList />} />
    <Route path="/reports/payment" element={<PaymentList />} />
    <Route path="/reports/receipts" element={<ReceiptList />} />
    <Route path="/reports/fde" element={<FDEList />} />
  </>
);
