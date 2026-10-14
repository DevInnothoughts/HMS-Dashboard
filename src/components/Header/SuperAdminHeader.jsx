import React, { useState, useEffect } from "react";
import "font-awesome/css/font-awesome.min.css";

export default function SuperAdminHeader() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  return (
    <>
      <header
        className="codex-header"
        style={{
          minHeight: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "10px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          className="flex-between"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="header-left d-flex align-items-center"></div>

          <div className="header-right">
            <ul className="nav-iconlist" style={{ marginBottom: 0 }}>
              <li
                className="nav-profile"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  className="location-badge"
                  style={{
                    marginRight: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 14px",
                    background: "rgba(26, 110, 124, 0.14)",
                    border: "1px solid #2a96d087",
                    borderRadius: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <i
                    className="fa fa-map-marker"
                    style={{ color: "#2a96d0ff", fontSize: "14px" }}
                  ></i>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "12px",
                      color: "#2a96d0ff",
                    }}
                  >
                    All Branches
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}
