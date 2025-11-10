import React from "react";
import { Route } from "react-router-dom";
import AddCompany from "../pages/Settings/Add_company_details";
import AddLabTest from "../pages/Settings/Add_lab_test";
import CompanyDetailsList from "../pages/Settings/Company_details_list";
import LabTestList from "../pages/Settings/Lab_test_list";
import AddLocation from "../pages/Settings/Add_Locations";
import AllLocations from "../pages/Settings/All_Locations";
import AddFDEDetails from "../pages/Settings/Add_fde_details";

export const SettingsRoutes = (
  <>
    <Route path="/settings/company/add" element={<AddCompany />} />
    <Route path="/settings/company/list" element={<CompanyDetailsList />} />
    <Route path="/settings/lab/add" element={<AddLabTest />} />
    <Route path="/settings/lab/list" element={<LabTestList />} />
    <Route path="/settings/locations" element={<AllLocations />} />
    <Route path="/settings/location/add" element={<AddLocation />} />
    <Route path="/settings/fde/add" element={<AddFDEDetails />} />
  </>
);
