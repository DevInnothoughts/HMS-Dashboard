import React from "react";
import { Route } from "react-router-dom";
import IpdPatientList from "../pages/Ipd/IpdPatientList";
import AddAdmission from "../pages/Ipd/AddAdmission";
import IpdAdmissionList from "../pages/Ipd/IpdAdmissionList";
import IpdBillList from "../pages/Ipd/IpdBillList";
import AddIpdBill from "../pages/Ipd/AddIpdBill";
import IpdCollection from "../pages/Ipd/IpdCollection";
import AddBedAllotment from "../pages/Ipd/AddBedAllotment";
import BedAllotmentList from "../pages/Ipd/BedAllotmentList";

export const IpdRoutes = (
  <>
    <Route path="/ipd-patient-list" element={<IpdPatientList />} />
    <Route path="/ipd-admission-list" element={<IpdAdmissionList />} />
    <Route path="/add-admission" element={<AddAdmission />} />
    <Route path="/ipd-bill-list" element={<IpdBillList />} />
    <Route path="/add-ipd-bill" element={<AddIpdBill />} />
    <Route path="/ipd-collection" element={<IpdCollection />} />
    <Route path="/bed-allotment-list" element={<BedAllotmentList />} />
    <Route path="/add-bed-allotment" element={<AddBedAllotment />} />
  </>
);
