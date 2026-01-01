import React from "react";
import { Route } from "react-router-dom";
import All_patient from "../pages/Patient/All_patient";
import Add_Patient from "../pages/Patient/Add_patient";
import Edit_patient from "../pages/Patient/Edit_patient";

export const PatientRoutes = (
  <>
    <Route path="/patients" element={<All_patient />} />
    <Route path="/patient/add" element={<Add_Patient />} />
    <Route path="/patient/edit/:id" element={<Edit_patient />} />
  </>
);
