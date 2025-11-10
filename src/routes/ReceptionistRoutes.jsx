import React from "react";
import { Route } from "react-router-dom";
import Appointment_list from "../pages/Receptionist/Appointment_list";
import Add_appointment from "../pages/Receptionist/Add_appointment";
import Edit_appointment from "../pages/Receptionist/Edit_appointment";
import Receptionist_list from "../pages/Receptionist/Receptionist_list";
import Add_receptionist from "../pages/Receptionist/Add_receptionist";

export const ReceptionistRoutes = (
  <>
    <Route path="/appointments" element={<Appointment_list />} />
    <Route path="/appointment/add" element={<Add_appointment />} />
    <Route path="/appointment/edit/:id" element={<Edit_appointment />} />
    <Route path="/receptionists" element={<Receptionist_list />} />
    <Route path="/receptionist/add" element={<Add_receptionist />} />
  </>
);
