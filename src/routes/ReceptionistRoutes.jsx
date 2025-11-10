import React from "react";
import { Route } from "react-router-dom";
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
  </>
);
