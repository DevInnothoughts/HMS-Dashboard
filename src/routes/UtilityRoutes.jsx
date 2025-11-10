import React from "react";
import { Route } from "react-router-dom";
import Invoice from "../pages/Utility/Invoice";
import InvoiceList from "../pages/Utility/Invoice_list";
import AddInvoice from "../pages/Utility/Add_invoice";
<<<<<<< HEAD
import Faq from "../pages/Utility/Faq";
import ErrorPage from "../pages/Utility/Errorpage";
import Add_payment from "../pages/Utility/Add_payment";
import Event_management from "../pages/Utility/Event_management";
import Call_logs from "../pages/Utility/Call_logs";
=======
import AddPayment from "../pages/Utility/Add_payment";
import Faq from "../pages/Utility/Faq";
import EventManagement from "../pages/Utility/Event_management";
import ErrorPage from "../pages/Utility/Errorpage";
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)

export const UtilityRoutes = (
  <>
    <Route path="/invoice" element={<Invoice />} />
    <Route path="/invoices" element={<InvoiceList />} />
    <Route path="/invoice/add" element={<AddInvoice />} />
<<<<<<< HEAD
    <Route path="/payment/add" element={<Add_payment />} />
    <Route path="/faq" element={<Faq />} />
    <Route path="/events" element={<Event_management />} />
    <Route path="/call-logs" element={<Call_logs />} />
=======
    <Route path="/payment/add" element={<AddPayment />} />
    <Route path="/faq" element={<Faq />} />
    <Route path="/events" element={<EventManagement />} />
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
    <Route path="*" element={<ErrorPage />} />
  </>
);
