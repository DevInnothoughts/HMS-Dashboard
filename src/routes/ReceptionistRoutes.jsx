import React from "react";
import { Route } from "react-router-dom";
import Appointment_list from "../pages/Receptionist/Appointment_list";
import Add_appointment from "../pages/Receptionist/Add_appointment";
import Edit_appointment from "../pages/Receptionist/Edit_appointment";
import Receptionist_list from "../pages/Receptionist/Receptionist_list";
import Add_receptionist from "../pages/Receptionist/Add_receptionist";
import SearchBy from "../pages/IPD/SearchBy";
import ManageAdmission from "../pages/IPD/ManageAdmission";
import Surgery from "../pages/IPD/Surgery";
import IPDFormsContainer from "../pages/IPD/IPDFormsContainer";

export const ReceptionistRoutes = (
  <>
    <Route path="/appointments" element={<Appointment_list />} />
    <Route path="/appointment/add" element={<Add_appointment />} />
    <Route path="/appointment/edit/:id" element={<Edit_appointment />} />
    <Route path="/receptionists" element={<Receptionist_list />} />
    <Route path="/receptionist/add" element={<Add_receptionist />} />
    <Route path="/search-by" element={<SearchBy />} />
    <Route path="/manage-admission" element={<ManageAdmission />} />
    <Route path="/surgery" element={<Surgery />} />
    <Route path="/surgery/forms/:admissionNo" element={<IPDFormsContainer />} />
  </>
);
