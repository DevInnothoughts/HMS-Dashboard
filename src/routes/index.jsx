import React from "react";
import { Routes } from "react-router-dom";
import { AuthRoutes } from "./AuthRoutes";
import { DashboardRoutes } from "./DashboardRoutes";
// import { DoctorRoutes } from "./DoctorRoutes";
import { PatientRoutes } from "./PatientRoutes";
import { ReceptionistRoutes } from "./ReceptionistRoutes";
import { ReportRoutes } from "./ReportsRoutes";
// import { SettingsRoutes } from "./SettingsRoutes";
import { UtilityRoutes } from "./UtilityRoutes";
import { IpdRoutes } from "./IpdRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {ReportRoutes}
      {AuthRoutes}
      {DashboardRoutes}
      {/* {DoctorRoutes} */}
      {IpdRoutes}
      {PatientRoutes}
      {ReceptionistRoutes}
      {/* {SettingsRoutes} */}
      {UtilityRoutes}
    </Routes>
  );
}
