import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import IpdFeedbackForm from "../Ipd/IpdFeedbackForm";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://194.195.117.79:5100/api";

const IpdPatientMedicalRecords = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(state?.patient);

  const [activeTab, setActiveTab] = useState("menu");
  const [currentLocation, setCurrentLocation] = useState("default");
  const getActiveLoc = () => patient?.patient_location || currentLocation || "default";
  const [hasFetchedPatient, setHasFetchedPatient] = useState(false);

  const [formData, setFormData] = useState({
    Uid_no: "",
    adm_no: "",
    date: "",
    prefix: "",
    name: "",
    patient_type: 0,
    email: "",
    address: "",
    sex: "",
    phone: "",
    mobile_2: "",
    pincode: "",
    blood_group: "",
    identity: "",
    identityNumber: "",
    birth_date: "",
    age: "",
    occupation: "",
    companyname: "",
    reference_type: "",
    ref: "",
    specific_work: "",
    patient_id: "",
    ref_doctor_name: "",
    ref_doctor_phone: "",
    nationality: "",
    language: "",
  });

  const [ipdFeedback, setIpdFeedback] = useState(null);

  const fetchIPDFeedback = async () => {
    const uidNo = formData.Uid_no || patient?.Uid_no || patient?.uid_no;
    if (!uidNo) return;
    try {
      const response = await fetch(
        `${BASE_URL}/V1/doctor/admission/get-feedback?uidNo=${encodeURIComponent(uidNo)}&location=${getActiveLoc()}`
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setIpdFeedback(result.data);
      } else {
        setIpdFeedback(null);
      }
    } catch (error) {
      console.error("Error fetching IPD Feedback:", error);
    }
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const patientId = state?.patient?.Uid_no || state?.patient?.uid_no || patient?.Uid_no || patient?.uid_no || state?.patient?.patient_id || patient?.patient_id;
      if (!patientId || hasFetchedPatient) return;

      let resolvedLocation = "default";
      const token = localStorage.getItem("token");
      if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
          resolvedLocation = payload.jobLocation;
        }
      }

      try {
        const response = await fetch(
          `${BASE_URL}/V1/patient/getPatient/${encodeURIComponent(patientId)}?location=${resolvedLocation}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (response.ok) {
          const resData = await response.json();
          if (resData.statusCode === 200 && resData.data) {
            setPatient((prev) => ({
              ...prev,
              ...resData.data,
            }));
            setHasFetchedPatient(true);
          }
        }
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchPatientDetails();
  }, [patient?.patient_id, hasFetchedPatient]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }

    if (patient) {
      const rawPrefix = (patient.prefix || patient.Prefix || "").trim();
      const prefixOptions = ["MR", "MRS", "MASTER", "MISS"];
      let finalPrefix = rawPrefix.toUpperCase().replace(/\.$/, "");
      if (finalPrefix === "M/S") finalPrefix = "MISS";

      if (!prefixOptions.includes(finalPrefix)) {
        finalPrefix = "";
      }

      setFormData({
        Uid_no: patient.Uid_no || patient.uid || patient.uid_no || "",
        adm_no: patient.adm_no || patient.admissionNo || patient.admission_no || "",
        date: patient.date || "",
        prefix: finalPrefix,
        name: patient.name || "",
        patient_type: patient.patient_type ? 1 : 0,
        email: patient.email || "",
        address: patient.address || "",
        sex: patient.sex || "",
        phone: patient.phone || "",
        mobile_2: patient.mobile_2 || "",
        pincode: patient.pincode || "",
        blood_group: patient.blood_group || "",
        identity: patient.identity || "",
        identityNumber: patient.identityNumber || "",
        birth_date: patient.birth_date || "",
        age: patient.age || "",
        occupation: patient.occupation || "",
        companyname: patient.companyname || "",
        reference_type: patient.reference_type || "",
        ref: patient.ref || "",
        specific_work: patient.specific_work || "",
        patient_id: patient.patient_id || "",
        ref_doctor_name: patient.ref_doctor_name || "",
        ref_doctor_phone: patient.ref_doctor_phone || "",
        nationality:
          patient.additional_info?.nationality || patient.nationality || "",
        language: patient.additional_info?.language || patient.language || "",
      });

      if (hasFetchedPatient) {
        fetchIPDFeedback();
      }
    }
  }, [patient, formData.patient_id, currentLocation, hasFetchedPatient]);

  const tabs = [
    { id: "ipd-feedback", label: "IPD Feedback Form", icon: "file-text" },
  ];

  const isTabCompleted = (tabId) => {
    switch (tabId) {
      case "ipd-feedback":
        return ipdFeedback !== null;
      default:
        return false;
    }
  };

  if (!patient) {
    return (
      <div
        className="themebody-wrap"
        style={{
          background: "linear-gradient(to right, #e0f7fa, #80deea)",
          minHeight: "100vh",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Card
                className="mt-5 shadow-lg border-0"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="text-center p-5">
                  <FeatherIcon
                    icon="user-x"
                    size="64"
                    className="text-muted mb-4"
                  />
                  <h3
                    className="mb-4"
                    style={{ color: "#00838f", fontWeight: "700" }}
                  >
                    Patient Not Found
                  </h3>
                  <Button
                    variant="info"
                    onClick={() => navigate(-1)}
                    style={{
                      backgroundColor: "#00bcd4",
                      color: "white",
                      borderRadius: "30px",
                    }}
                  >
                    Back to Patient List
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)",
        minHeight: "100vh",
        padding: "10px",
      }}
    >
      <PageBreadcrumb pagename="IPD Patient Medical Records" />
      <div className="theme-body">
        <Container fluid>
          {activeTab === "menu" ? (
            <div className="py-4 px-lg-7 animate__animated animate__fadeIn">
              <Card
                className="border-0 shadow-sm mb-20"
                style={{
                  borderRadius: "12px",
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                <div
                  className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center"
                  style={{ borderLeft: "5px solid #00bcd4" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Button
                      onClick={() => navigate(-1)}
                      className="d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        padding: "0",
                        backgroundColor: "#00bcd4",
                        border: "1px solid #00bcd4",
                        color: "#fff",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0097a7";
                        e.currentTarget.style.transform = "translateX(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#00bcd4";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                      title="Back to Patient List"
                    >
                      <FeatherIcon icon="arrow-left" size="20" />
                    </Button>
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                        IPD Patient Medical Records
                      </h4>
                      {formData.name && (
                        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ fontSize: "13px" }}>
                          <span><strong>Admission No:</strong> {formData.adm_no || "N/A"}</span>
                          <span className="opacity-50">|</span>
                          <span><strong>Patient Name:</strong> {formData.prefix ? `${formData.prefix} ` : ""}{formData.name}</span>
                          <span className="opacity-50">|</span>
                          <span><strong>Contact No:</strong> {formData.phone || "N/A"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 mt-md-0">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#e0f7fa",
                        color: "#00838f",
                        padding: "20px 15px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {tabs.filter((t) => isTabCompleted(t.id)).length} of{" "}
                      {tabs.length} Sections Completed
                    </span>
                  </div>
                </div>
              </Card>

              <Row className="g-10">
                {tabs.map((tab) => {
                  const completed = isTabCompleted(tab.id);
                  return (
                    <Col sm={6} lg={3} key={tab.id} className="d-flex">
                      <Card
                        className="border-0 shadow-sm transition-all"
                        style={{
                          width: "300px",
                          padding: "5px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          border: completed
                            ? "1px solid #10b981"
                            : "1px solid #f1f5f9",
                        }}
                        onClick={() => {
                          setActiveTab(tab.id);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform =
                            "translateY(-4px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 16px rgba(0, 0, 0, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 6px rgba(0, 0, 0, 0.04)";
                        }}
                      >
                        <Card.Body className="p-3 d-flex align-items-center">
                          <div
                            className="d-flex align-items-center justify-content-center rounded me-3"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundColor: completed
                                ? "#f0fdf4"
                                : "#f8fafc",
                              color: completed ? "#10b981" : "#64748b",
                            }}
                          >
                            <FeatherIcon icon={tab.icon} size="22" />
                          </div>
                          <div className="flex-grow-1">
                            <h6
                              className="fw-bold m-0 mb-1"
                              style={{ color: "#334155", fontSize: "14px" }}
                            >
                              {tab.label}
                            </h6>
                            {completed ? (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "#10b981",
                                  fontWeight: "600",
                                }}
                              >
                                Filled & Saved
                              </span>
                            ) : (
                              <span
                                style={{ fontSize: "12px", color: "#94a3b8" }}
                              >
                                No Record
                              </span>
                            )}
                          </div>
                          <div className="ms-2">
                            {completed ? (
                              <FeatherIcon
                                icon="check-circle"
                                size="20"
                                style={{ color: "#10b981" }}
                              />
                            ) : (
                              <FeatherIcon
                                icon="chevron-right"
                                size="20"
                                style={{ color: "#cbd5e1" }}
                              />
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          ) : (
            <Card
              className="shadow-lg border-0 mb-4 animate__animated animate__fadeIn"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <div
                className="p-10 border-bottom d-flex align-items-center justify-content-between position-relative"
                style={{ backgroundColor: "#f8fafd" }}
              >
                <div>
                  <Button
                    className="d-flex align-items-center shadow-sm"
                    style={{
                      borderRadius: "50px",
                      padding: "7px 12px",
                      fontWeight: "700",
                      color: "#ffffff",
                      backgroundColor: "#fff",
                      border: "1px solid #e0e6ed",
                    }}
                    onClick={() => setActiveTab("menu")}
                  >
                    <FeatherIcon icon="arrow-left" size="18" className="me-2" />{" "}
                    Back
                  </Button>
                </div>

                <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#00bcd4",
                      color: "#fff",
                    }}
                  >
                    <FeatherIcon
                      icon={tabs.find((t) => t.id === activeTab)?.icon}
                      size="24"
                    />
                  </div>
                  <div>
                    <h4 className="fw-bold m-0" style={{ color: "#2c3e50" }}>
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </h4>
                    {formData.name && (
                      <div className="d-flex flex-wrap gap-2 align-items-center text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
                        <span><strong>Admission No:</strong> {formData.adm_no || "N/A"}</span>
                        <span className="opacity-50">|</span>
                        <span><strong>Patient:</strong> {formData.prefix ? `${formData.prefix} ` : ""}{formData.name}</span>
                        <span className="opacity-50">|</span>
                        <span><strong>Contact:</strong> {formData.phone || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div></div>
              </div>
              <Card.Body className="p-5" style={{ backgroundColor: "#ffffff" }}>
                {activeTab === "ipd-feedback" && (
                  <IpdFeedbackForm
                    patient={formData}
                    location={getActiveLoc()}
                    BASE_URL={BASE_URL}
                    onSubmitSuccess={fetchIPDFeedback}
                  />
                )}
              </Card.Body>
            </Card>
          )}
        </Container>
      </div>

      <style>{`
        .custom-navbar::-webkit-scrollbar { height: 6px; }
        .custom-navbar::-webkit-scrollbar-thumb { background: #b2ebf2; border-radius: 10px; }
        .animate__animated { animation-duration: 0.5s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate__fadeIn { animation-name: fadeIn; }
      `}</style>
    </div>
  );
};

export default IpdPatientMedicalRecords;
