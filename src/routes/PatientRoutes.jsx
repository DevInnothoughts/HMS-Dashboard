import React from "react";
import { Route } from "react-router-dom";
<<<<<<< HEAD
import All_patient from "../pages/Patient/All_patient";
import Add_Patient from "../pages/Patient/Add_patient";
import Edit_patient from "../pages/Patient/Edit_patient";

export const PatientRoutes = (
  <>
    <Route path="/patients" element={<All_patient />} />
    <Route path="/patient/add" element={<Add_Patient />} />
    <Route path="/patient/edit/:id" element={<Edit_patient />} />
=======
import AddPatient from "../pages/Patient/Add_patient";
import AllPatient from "../pages/Patient/All_patient";
import EditPatient from "../pages/Patient/Edit_patient";

export const PatientRoutes = (
  <>
    <Route path="/patients" element={<AllPatient />} />
    <Route path="/patient/add" element={<AddPatient />} />
    <Route path="/patient/edit/:id" element={<EditPatient />} />
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
  </>
);
