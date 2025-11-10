import React from "react";
import { Route } from "react-router-dom";
<<<<<<< HEAD
import All_doctor from "../pages/Doctor/All_doctor";
import DoctorSchedule from "../pages/Doctor/Doctor_schedule";
import Add_doctor from "../pages/Doctor/Add_doctor";
import Edit_doctor from "../pages/Doctor/Edit_doctor";

export const DoctorRoutes = (
  <>
    <Route path="/doctors" element={<All_doctor />} />
    <Route path="/doctor/add" element={<Add_doctor/>} />
    <Route path="/doctor/edit/:id" element={<Edit_doctor />} />
    <Route path="/doctor/schedule" element={<DoctorSchedule/>} />
=======
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
>>>>>>> df2a95c (UPDATED FILE STRUCTURE)
  </>
);
