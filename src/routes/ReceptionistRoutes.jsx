import React from "react";
import { Route } from "react-router-dom";
<<<<<<< HEAD
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
=======
import AddAppointment from "../pages/Receptionist/Add_appointment";
import EditAppointment from "../pages/Receptionist/Edit_appointment";
import AppointmentList from "../pages/Receptionist/Appointment_list";
import AddReceptionist from "../pages/Receptionist/Add_receptionist";
import ReceptionistList from "../pages/Receptionist/Receptionist_list";

export const ReceptionistRoutes = (
  <>
    <Route path="/appointments" element={<AppointmentList />} />
    <Route path="/appointment/add" element={<AddAppointment />} />
    <Route path="/appointment/edit/:id" element={<EditAppointment />} />
    <Route path="/receptionists" element={<ReceptionistList />} />
    <Route path="/receptionist/add" element={<AddReceptionist />} />
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
  </>
);
