import React from "react";
import { Route } from "react-router-dom";
import Invoice from "../pages/Utility/Invoice";
import InvoiceList from "../pages/Utility/Invoice_list";
import AddInvoice from "../pages/Utility/Add_invoice";
import AddPayment from "../pages/Utility/Add_payment";
import Faq from "../pages/Utility/Faq";
import EventManagement from "../pages/Utility/Event_management";
import ErrorPage from "../pages/Utility/Errorpage";

export const UtilityRoutes = (
  <>
    <Route path="/invoice" element={<Invoice />} />
    <Route path="/invoices" element={<InvoiceList />} />
    <Route path="/invoice/add" element={<AddInvoice />} />
    <Route path="/payment/add" element={<AddPayment />} />
    <Route path="/faq" element={<Faq />} />
    <Route path="/events" element={<EventManagement />} />
    <Route path="*" element={<ErrorPage />} />
  </>
);
