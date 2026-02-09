import React from "react";
import { Route } from "react-router-dom";
import SearchBy from "../pages/IPD/SearchBy";
import ManageAdmission from "../pages/IPD/ManageAdmission";
import IPDFormsContainer from "../pages/IPD/IPDFormsContainer";
import IpdDashboard from "../pages/Dashboard/IpdDashboard";

export const IpdRoutes = (
    <>
        <Route path="/ipd-dashboard" element={<IpdDashboard />} />
        <Route path="/search-by" element={<SearchBy />} />
        <Route path="/manage-admission" element={<ManageAdmission />} />
        <Route path="/surgery/forms" element={<IPDFormsContainer />} />
    </>
)
