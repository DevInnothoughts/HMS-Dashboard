import React from "react";
import { Route } from "react-router-dom";
import AddDoctor from "../pages/Doctor/Add_doctor";
import AllDoctor from "../pages/Doctor/All_doctor";
import EditDoctor from "../pages/Doctor/Edit_doctor";
import DoctorSchedule from "../pages/Doctor/Doctor_schedule";

export const DoctorRoutes = (
  <>
    <Route path="/doctors" element={<AllDoctor />} />
    <Route path="/doctor/add" element={<AddDoctor />} />
    <Route path="/doctor/edit/:id" element={<EditDoctor />} />
    <Route path="/doctor/schedule" element={<DoctorSchedule />} />
  </>
);
