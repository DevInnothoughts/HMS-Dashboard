import React from "react";
import { Route } from "react-router-dom";
<<<<<<< HEAD
import Add_company_details from "../pages/Settings/Add_company_details";
import Company_details_list from "../pages/Settings/Company_details_list";
import Add_lab_test from "../pages/Settings/Add_lab_test";
import Lab_test_list from "../pages/Settings/Lab_test_list";
import All_Hospitals from "../pages/Settings/All_Locations";
import Add_locations from "../pages/Settings/Add_Locations";
import Add_fde_details from "../pages/Settings/Add_fde_details";

export const SettingsRoutes = (
  <>
    <Route path="/settings/company/add" element={<Add_company_details />} />
    <Route path="/settings/company/list" element={<Company_details_list />} />
    <Route path="/settings/lab/add" element={<Add_lab_test />} />
    <Route path="/settings/lab/list" element={<Lab_test_list />} />
    <Route path="/settings/locations" element={<All_Hospitals />} />
    <Route path="/settings/location/add" element={<Add_locations />} />
    <Route path="/settings/fde/add" element={<Add_fde_details />} />
=======
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
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
  </>
);
