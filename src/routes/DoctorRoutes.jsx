import React from "react";
import { Route } from "react-router-dom";
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
  </>
);
