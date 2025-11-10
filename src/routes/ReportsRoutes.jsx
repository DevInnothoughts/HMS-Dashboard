import React from "react";
import { Route } from "react-router-dom";
<<<<<<< HEAD
import Add_Enquiry from "../pages/Reports/Add_Enquiry";
import EnquiryList from "../pages/Reports/Enquiry_List";
import ReceiptList from "../pages/Reports/ReceiptList";
import Payment_list from "../pages/Reports/Payment_list";
import FDE_details_list from "../pages/Reports/fde_details_list";
=======
import EnquiryList from "../pages/Reports/Enquiry_List";
import PaymentList from "../pages/Reports/Payment_list";
import ReceiptList from "../pages/Reports/ReceiptList";
import FDEList from "../pages/Reports/fde_details_list";
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)

export const ReportRoutes = (
  <>
    <Route path="/reports/enquiry" element={<EnquiryList />} />
<<<<<<< HEAD
    <Route path="/reports/enquiry/add" element={Add_Enquiry} />
    <Route path="/reports/payment" element={<Payment_list />} />
    <Route path="/reports/receipts" element={<ReceiptList />} />
    <Route path="/reports/fde" element={<FDE_details_list />} />
=======
    <Route path="/reports/payment" element={<PaymentList />} />
    <Route path="/reports/receipts" element={<ReceiptList />} />
    <Route path="/reports/fde" element={<FDEList />} />
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
  </>
);
