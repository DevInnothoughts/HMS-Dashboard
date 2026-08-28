import React from "react";
import { Route } from "react-router-dom";
import IpdPatientList from "../pages/Ipd/IpdPatientList";
import AddIpdAdmission from "../pages/Ipd/AddIpdAdmission";
import IpdAdmissionList from "../pages/Ipd/IpdAdmissionList";
import IpdBillList from "../pages/Ipd/IpdBillList";
import CashlessBillSettlement from "../pages/Ipd/CashlessBillSettlement";
import AddIpdBill from "../pages/Ipd/AddIpdBill";
import AggregatorBills from "../pages/Ipd/AggregatorBills";
import IpdCollection from "../pages/Ipd/IpdCollection";
import BedAllotmentList from "../pages/Ipd/BedAllotmentList";
import IPDCollectionReport from "../pages/Ipd/IpdReports/IPDCollectionReport";
import IPDDueReport from "../pages/Ipd/IpdReports/IPDDueReport";
import InsuranceDueReport from "../pages/Ipd/IpdReports/InsuranceDueReport";
import IpdPatientForms from "../pages/Ipd/IpdPatientForms";

export const IpdRoutes = (
  <>
    <Route path="/ipd-patient-list" element={<IpdPatientList />} />
    <Route path="/ipd-admission-list" element={<IpdAdmissionList />} />
    <Route path="/add-ipd-admission" element={<AddIpdAdmission />} />
    <Route path="/ipd-bill-list" element={<IpdBillList />} />
    <Route path="/aggregator-bills" element={<AggregatorBills />} />
    <Route path="/cashless-bill-settlement" element={<CashlessBillSettlement />} />
    <Route path="/add-ipd-bill" element={<AddIpdBill />} />
    <Route path="/ipd-collection" element={<IpdCollection />} />
    <Route path="/bed-allotment-list" element={<BedAllotmentList />} />
    <Route path="/ipd-due-report" element={<IPDDueReport />} />
    <Route path="/insurance-due-report" element={<InsuranceDueReport />} />
    <Route path="/ipd-collection-report" element={<IPDCollectionReport />} />
    <Route path="/ipd-patient-forms" element={<IpdPatientForms />} />
  </>
);
