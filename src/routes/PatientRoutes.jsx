import React from "react";
import { Route } from "react-router-dom";
import AddPatient from "../pages/Patient/Add_patient";
import AllPatient from "../pages/Patient/All_patient";
import EditPatient from "../pages/Patient/Edit_patient";

export const PatientRoutes = (
  <>
    <Route path="/patients" element={<AllPatient />} />
    <Route path="/patient/add" element={<AddPatient />} />
    <Route path="/patient/edit/:id" element={<EditPatient />} />
  </>
);
