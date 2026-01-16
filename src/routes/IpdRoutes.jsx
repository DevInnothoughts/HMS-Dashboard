import React from "react";
import { Route } from "react-router-dom";
import SearchBy from "../pages/IPD/SearchBy";
import ManageAdmission from "../pages/IPD/ManageAdmission";
import Surgery from "../pages/IPD/Surgery";
import IPDFormsContainer from "../pages/IPD/IPDFormsContainer";

export const IpdRoutes = (
    <>
        <Route path="/search-by" element={<SearchBy />} />
        <Route path="/manage-admission" element={<ManageAdmission />} />
        <Route path="/surgery" element={<Surgery />} />
        <Route path="/surgery/forms" element={<IPDFormsContainer />} />
    </> 
)