import React from "react";
import { Route } from "react-router-dom";
// import Invoice from "../pages/Utility/Invoice";
import InvoiceList from "../pages/Utility/Invoice_list";
import AddInvoice from "../pages/Utility/Add_invoice";
import BedAllotment from "../pages/BedAllotment";
import AddBedAllotment from "../pages/AddBedAllotment";
// import Faq from "../pages/Utility/Faq";
import ErrorPage from "../pages/Utility/Errorpage";
import Call_logs from "../pages/Utility/Call_logs";
import IpdPaymentData from "../pages/Utility/IpdPaymentData";
import DailyClosing from "../pages/DailyClosing";

export const UtilityRoutes = (
  <>
    {/* <Route path="/invoice" element={<Invoice />} /> */}
    <Route path="/invoices" element={<InvoiceList />} />
    <Route path="/invoice/add" element={<AddInvoice />} />
    <Route path="/bed-allotment" element={<BedAllotment />} />
    <Route path="/bed-allotment/add" element={<AddBedAllotment />} />
    <Route path="/daily-closing" element={<DailyClosing />} />
    <Route path="/invoices/payment-data" element={<IpdPaymentData />} />
    {/* <Route path="/payment/add" element={<Add_payment />} /> */}
    {/* <Route path="/faq" element={<Faq />} /> */}
    {/* <Route path="/events" element={<Event_management />} /> */}
    <Route path="/call-logs" element={<Call_logs />} />
    <Route path="*" element={<ErrorPage />} />
  </>
);
