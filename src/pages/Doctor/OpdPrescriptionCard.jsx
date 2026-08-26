import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Table,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const BASE_URL = "http://194.195.117.79:5100/api";

const todayLocal = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

const OpdPrescriptionCard = ({
  prescriptionData,
  currentMedicine,
  handlePrescriptionChange,
  handlePrescriptionCheckboxChange,
  handleAddMedicine,
  handleRemoveMedicine,
  setCurrentMedicine,
  previousPrescriptionList = [],
  selectedPrescriptionId = null,
  onSelectPrescription,
  onNewPrescription,
  onSavePrescription,
  onPrintPrescription,
  isEditing = false,
  onEditPrescription,
  assistanceDoctors = [],
  location = "default",
  removedMedicines = [],
  loading = false,
  validationErrors = {},
}) => {
  const [testAdviceOptions, setTestAdviceOptions] = useState([]);
  const [preopInvestOptions, setPreopInvestOptions] = useState([]);
  const [filteredAssistanceDoctors, setFilteredAssistanceDoctors] = useState(
    [],
  );
  const [medicineSearchResults, setMedicineSearchResults] = useState([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [editingMedicineIndex, setEditingMedicineIndex] = useState(null);
  const isViewingSaved = !!selectedPrescriptionId;
  const isReadOnly = isViewingSaved && !isEditing;
  const lockStyle = { display: "contents" };

  const [hideAAC, setHideAAC] = useState(false);

  useEffect(() => {
    if (!location || location === "default") return;
    const checkAacVisibility = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/V1/doctor/check-aac-visibility?location=${location}`,
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.hideAAC !== undefined) {
            setHideAAC(json.data.hideAAC);
          }
        }
      } catch (err) {
        console.error("Error checking AAC visibility:", err);
      }
    };
    checkAacVisibility();
  }, [location]);

  useEffect(() => {
    const fetchDynamicData = async () => {
      if (!prescriptionData.prescription_type) {
        setTestAdviceOptions([]);
        setPreopInvestOptions([]);
        setFilteredAssistanceDoctors(assistanceDoctors);
        return;
      }

      const type = prescriptionData.prescription_type.toLowerCase();
      let deptId = null;
      let adviceCategory = null;

      if (type === "urology") {
        deptId = 6;
        adviceCategory = "urology";
      } else if (type === "proctology" || type === "other") {
        deptId = 5;
        adviceCategory = "proctology";
      }

      // Fetch Test Advice
      if (adviceCategory) {
        try {
          const res = await fetch(
            `${BASE_URL}/V1/doctor/prescriptionAdviceDropdown?location=${location}&testadvice=${adviceCategory}`,
          );
          const result = await res.json();
          console.log("Fetched api url:", `${BASE_URL}/V1/doctor/prescriptionAdviceDropdown?location=${location}&testadvice=${adviceCategory}`);
          console.log("Fetched test advice:", result);
          if (result.statusCode === 200) {
            setTestAdviceOptions(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching test advice:", error);
        }
      } else {
        setTestAdviceOptions([]);
      }

      // Fetch PREOP Investigations (only for Urology)
      if (type === "urology") {
        try {
          const res = await fetch(
            `${BASE_URL}/V1/doctor/prescriptionAdviceDropdown?location=${location}&testadvice=PREOP`,
          );
          const result = await res.json();
          if (result.statusCode === 200) {
            setPreopInvestOptions(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching PREOP investigations:", error);
        }
      } else {
        setPreopInvestOptions([]);
      }

      if (deptId) {
        try {
          const res = await fetch(
            `${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${location}&departmentId=${deptId}`,
          );
          const result = await res.json();
          if (result.statusCode === 200) {
            setFilteredAssistanceDoctors(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching filtered assistant doctors:", error);
        }
      } else {
        setFilteredAssistanceDoctors(assistanceDoctors);
      }
    };

    fetchDynamicData();
  }, [prescriptionData.prescription_type, location, assistanceDoctors]);

  const timeSlots = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner",
    "After Evening Snacks",
    "LA",
  ];

  return (
    <div
      className="animate__animated animate__fadeIn"
      onInput={(e) => {
        console.log("Typing:", e.target.value);
      }}
    >
      <style>{`
        .form-check-input {
          border: 1px solid black !important;
        }
        .hover-bg-light:hover {
          background-color: #f1fcfd;
          transition: background-color 0.2s;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .custom-checkbox input:checked {
          background-color: #00bcd4;
          border-color: #00bcd4;
        }
      `}</style>
      <div
        className="p-3 bg-white rounded shadow-sm border mb-3"
        style={{ borderLeft: "5px solid #0097a7" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5
            className="fw-bold mb-0"
            style={{
              color: "#00838f",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "14px",
            }}
          >
            <FeatherIcon
              icon="file-text"
              size="18"
              className="me-2 text-info"
            />
            Outpatient Prescription (OPD)
          </h5>
          <div className="d-flex gap-2">
            {selectedPrescriptionId && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onPrintPrescription}
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="printer" size="14" className="me-1" /> PRINT
              </Button>
            )}
            {isViewingSaved && !isEditing && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={onEditPrescription}
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="edit-2" size="14" className="me-1" /> EDIT
              </Button>
            )}
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewPrescription}
              style={{
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                padding: "7px 10px",
              }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectPrescription}>
              <Dropdown.Toggle
                variant="outline-info"
                id="previous-pres-dropdown"
                size="sm"
                style={{
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "white",
                  padding: "7px 10px",
                }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" />{" "}
                PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu
                style={{
                  fontSize: "12px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {previousPrescriptionList.length > 0 ? (
                  previousPrescriptionList.map((pr) => (
                    <Dropdown.Item key={pr.id} eventKey={pr.id}>
                      {pr.date}{" "}
                      {pr.id === selectedPrescriptionId && (
                        <FeatherIcon
                          icon="check"
                          size="12"
                          className="ms-2 text-success"
                        />
                      )}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {isViewingSaved && !isEditing && (
          <div
            className="d-flex align-items-center mb-3 px-3 py-5 rounded"
            style={{
              backgroundColor: "#f1fcfd",
              border: "1px solid #b2ebf2",
              color: "#00838f",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            <FeatherIcon icon="lock" size="14" className="me-2" />
            This is a saved prescription (read only). Click EDIT to modify it,
            or NEW RECORD to add another.
          </div>
        )}

        <fieldset disabled={isReadOnly} style={lockStyle}>
          <Row>
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Prescription Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                disabled={prescriptionData.no_medicines_prescribed}
                value={prescriptionData.prescription_type || ""}
                onChange={(e) =>
                  handlePrescriptionChange("prescription_type", e.target.value)
                }
                isInvalid={!!validationErrors.prescription_type}
                style={{
                  borderRadius: "10px",
                  border: validationErrors.prescription_type ? "2px solid #dc3545" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Prescription Type</option>
                <option value="Proctology">Proctology</option>
                <option value="Urology">Urology</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Date of Prescription <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                max={new Date().toISOString().split("T")[0]}
                disabled={prescriptionData.no_medicines_prescribed || isEditing}
                value={prescriptionData.creation_timestamp}
                onChange={(e) =>
                  handlePrescriptionChange("creation_timestamp", e.target.value)
                }
                isInvalid={!!validationErrors.creation_timestamp}
                style={{
                  borderRadius: "10px",
                  border: validationErrors.creation_timestamp ? "2px solid #dc3545" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                  backgroundColor: isEditing ? "#e9ecef" : "white",
                }}
                onKeyDown={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onWheel={(e) => e.target.blur()}
              />
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Assistant Doctor <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                disabled={prescriptionData.no_medicines_prescribed}
                value={
                  (prescriptionData.prescription_type === "Urology"
                    ? prescriptionData.udoctor_id
                    : prescriptionData.doctor_id) || ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (prescriptionData.prescription_type === "Urology") {
                    handlePrescriptionChange("udoctor_id", val);
                    handlePrescriptionChange("doctor_id", "");
                  } else {
                    handlePrescriptionChange("doctor_id", val);
                    handlePrescriptionChange("udoctor_id", "");
                  }
                  const selectedDoc = filteredAssistanceDoctors.find(
                    (d) => String(d.doctor_id) === String(val),
                  );
                  if (selectedDoc) {
                    handlePrescriptionChange(
                      "assistant_doctor_name",
                      selectedDoc.name,
                    );
                    handlePrescriptionChange(
                      "assistant_doctor_phone",
                      selectedDoc.phone || "",
                    );
                  } else {
                    handlePrescriptionChange("assistant_doctor_name", "");
                    handlePrescriptionChange("assistant_doctor_phone", "");
                  }
                }}
                isInvalid={
                  prescriptionData.prescription_type === "Urology"
                    ? !!validationErrors.udoctor_id
                    : !!validationErrors.doctor_id
                }
                style={{
                  borderRadius: "10px",
                  border: (prescriptionData.prescription_type === "Urology" ? validationErrors.udoctor_id : validationErrors.doctor_id)
                    ? "2px solid #dc3545"
                    : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Assistant Doctor</option>
                {filteredAssistanceDoctors.map((doc) => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col
              md={prescriptionData.prescription_type === "Urology" ? 3 : 3}
              className="mb-20"
            >
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Test Advice
              </Form.Label>
              <Dropdown>
                <Dropdown.Toggle
                  disabled={prescriptionData.no_medicines_prescribed}
                  variant="outline-info"
                  id="test-advice-dropdown"
                  className="text-start d-flex justify-content-between align-items-center"
                  style={{
                    borderRadius: "10px",
                    width: "100%",
                    border: "2px solid #b2ebf2",
                    padding: "10px 12px",
                    fontSize: "12px",
                    backgroundColor: "white",
                    color: "#333",
                  }}
                >
                  Select Tests...
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="shadow-sm border-0"
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    padding: "10px",
                    width: "100%",
                    borderRadius: "12px",
                  }}
                >
                  {testAdviceOptions.length > 0 ? (
                    testAdviceOptions.map((t) => {
                      const isChecked = (
                        prescriptionData.prescription_type === "Urology"
                          ? prescriptionData.uroadvice
                          : prescriptionData.surgical_advice
                      )?.includes(t.padvice_desc);
                      return (
                        <div
                          key={t.padvice_id}
                          className="px-2 py-1 mb-1 rounded hover-bg-light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Form.Check
                            type="checkbox"
                            id={`test-advice-${t.padvice_id}`}
                            label={
                              <span
                                style={{ fontSize: "12px", cursor: "pointer" }}
                              >
                                {t.padvice_desc}
                              </span>
                            }
                            checked={isChecked}
                            onChange={() =>
                              handlePrescriptionCheckboxChange(
                                prescriptionData.prescription_type === "Urology"
                                  ? "uroadvice"
                                  : "surgical_advice",
                                t.padvice_desc,
                              )
                            }
                            className="custom-checkbox"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div
                      className="text-muted text-center p-2"
                      style={{ fontSize: "11px" }}
                    >
                      No options available
                    </div>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <div className="mt-2 d-flex flex-wrap gap-1">
                {(prescriptionData.prescription_type === "Urology"
                  ? prescriptionData.uroadvice
                  : prescriptionData.surgical_advice
                )?.map((item, idx) => (
                  <span
                    key={idx}
                    className="badge bg-info text-white d-flex align-items-center"
                    style={{
                      fontSize: "10px",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      fontWeight: "600",
                    }}
                  >
                    {item}
                    {!isReadOnly && (
                      <FeatherIcon
                        icon="x"
                        size="12"
                        className="ms-2 cursor-pointer hover-text-danger"
                        onClick={() =>
                          handlePrescriptionCheckboxChange(
                            prescriptionData.prescription_type === "Urology"
                              ? "uroadvice"
                              : "surgical_advice",
                            item,
                          )
                        }
                      />
                    )}
                  </span>
                ))}
              </div>
            </Col>

            {prescriptionData.prescription_type === "Urology" && (
              <Col md={3} className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                  PREOP Investigation
                </Form.Label>
                <Dropdown>
                  <Dropdown.Toggle
                    disabled={prescriptionData.no_medicines_prescribed}
                    variant="outline-secondary"
                    id="preop-invest-dropdown"
                    className="text-start d-flex justify-content-between align-items-center"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "10px 12px",
                      fontSize: "12px",
                      backgroundColor: "white",
                      color: "#333",
                    }}
                  >
                    Select PREOP...
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="shadow-sm border-0"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      padding: "10px",
                      borderRadius: "12px",
                      width: "100%"
                    }}
                  >
                    {preopInvestOptions.length > 0 ? (
                      preopInvestOptions.map((t) => {
                        const isChecked =
                          prescriptionData.preopinvestigation?.includes(
                            t.padvice_desc,
                          );
                        return (
                          <div
                            key={t.padvice_id}
                            className="px-2 py-1 mb-1 rounded hover-bg-light"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Form.Check
                              type="checkbox"
                              id={`preop-invest-${t.padvice_id}`}
                              label={
                                <span
                                  style={{
                                    fontSize: "12px",
                                    cursor: "pointer",
                                  }}
                                >
                                  {t.padvice_desc}
                                </span>
                              }
                              checked={isChecked}
                              onChange={() =>
                                handlePrescriptionCheckboxChange(
                                  "preopinvestigation",
                                  t.padvice_desc,
                                )
                              }
                              className="custom-checkbox"
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div
                        className="text-muted text-center p-2"
                        style={{ fontSize: "11px" }}
                      >
                        No options available
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
                <div className="mt-2 d-flex flex-wrap gap-1">
                  {prescriptionData.preopinvestigation?.map((item, idx) => (
                    <span
                      key={idx}
                      className="badge bg-secondary text-white d-flex align-items-center"
                      style={{
                        fontSize: "10px",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        fontWeight: "600",
                      }}
                    >
                      {item}
                      {!isReadOnly && (
                        <FeatherIcon
                          icon="x"
                          size="12"
                          className="ms-2 cursor-pointer hover-text-danger"
                          onClick={() =>
                            handlePrescriptionCheckboxChange(
                              "preopinvestigation",
                              item,
                            )
                          }
                        />
                      )}
                    </span>
                  ))}
                </div>
              </Col>
            )}

            <Col md={3} className="mb-15">
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Allergy
              </Form.Label>
              <Form.Control
                as="textarea"
                disabled={prescriptionData.no_medicines_prescribed}
                rows={2}
                value={prescriptionData.allergy}
                onChange={(e) =>
                  handlePrescriptionChange("allergy", e.target.value)
                }
                placeholder="e.g. Penicillin, Sulfa..."
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>

            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Provisional Diagnosis
              </Form.Label>
              {prescriptionData.prescription_type === "Urology" ? (
                <Form.Control
                  as="textarea"
                  disabled={prescriptionData.no_medicines_prescribed}
                  rows={2}
                  value={prescriptionData.urodiagnosis}
                  onChange={(e) =>
                    handlePrescriptionChange("urodiagnosis", e.target.value)
                  }
                  placeholder="Urology diagnosis..."
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              ) : (
                <Form.Control
                  as="textarea"
                  disabled={prescriptionData.no_medicines_prescribed}
                  rows={2}
                  value={prescriptionData.diagnosis}
                  onChange={(e) =>
                    handlePrescriptionChange("diagnosis", e.target.value)
                  }
                  placeholder="Core diagnosis for this visit..."
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #b2ebf2",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                />
              )}
            </Col>

            {prescriptionData.prescription_type === "Urology" && (
              <>
                <Col md={3} className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                    Chief Complaints (C/O)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    disabled={prescriptionData.no_medicines_prescribed}
                    rows={2}
                    value={prescriptionData.medicalchiefcomplaints}
                    onChange={(e) =>
                      handlePrescriptionChange(
                        "medicalchiefcomplaints",
                        e.target.value,
                      )
                    }
                    placeholder="Enter chief complaints..."
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
                <Col md={3} className="mb-15">
                  <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                    Known Case Of
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    disabled={prescriptionData.no_medicines_prescribed}
                    rows={2}
                    value={prescriptionData.medicalhistory}
                    onChange={(e) =>
                      handlePrescriptionChange("medicalhistory", e.target.value)
                    }
                    placeholder="Medical history..."
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                    Past Surgical History (S/P)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    disabled={prescriptionData.no_medicines_prescribed}
                    rows={2}
                    value={prescriptionData.medicalpasthistory}
                    onChange={(e) =>
                      handlePrescriptionChange(
                        "medicalpasthistory",
                        e.target.value,
                      )
                    }
                    placeholder="Past surgeries..."
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
                <Col md={3} className="mb-3">
                  <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                    Investigation
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    disabled={prescriptionData.no_medicines_prescribed}
                    rows={2}
                    value={prescriptionData.investigation}
                    onChange={(e) =>
                      handlePrescriptionChange("investigation", e.target.value)
                    }
                    placeholder="Previous investigations..."
                    style={{
                      borderRadius: "10px",
                      border: "2px solid #b2ebf2",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  />
                </Col>
              </>
            )}

            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Next Appointment Type <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                disabled={prescriptionData.no_medicines_prescribed}
                value={prescriptionData.patient_type || ""}
                onChange={(e) =>
                  handlePrescriptionChange("patient_type", e.target.value)
                }
                isInvalid={!!validationErrors.patient_type}
                style={{
                  borderRadius: "10px",
                  border: validationErrors.patient_type ? "2px solid #dc3545" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Select Appointment Type</option>
                <option value="Follow">Follow Up Patient</option>
                <option value="Postoperative">Post Operative Patient</option>
                <option value="surgery_patient">Surgery Patient</option>
                <option value="nofollowupappointment">
                  No Followup Appointment
                </option>
              </Form.Select>
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>
                Next Appointment Date <span className="text-danger">*</span>
                {prescriptionData.patient_type &&
                  prescriptionData.patient_type !== "nofollowupappointment" &&
                  prescriptionData.patient_type !== "surgery_patient" && (
                    <span className="text-danger"> *</span>
                  )}
              </Form.Label>
              <Form.Control
                type="date"
                min={todayLocal}
                value={prescriptionData["next-appo-date"] || ""}
                onChange={(e) =>
                  handlePrescriptionChange("next-appo-date", e.target.value)
                }
                disabled={
                  prescriptionData.no_medicines_prescribed ||
                  prescriptionData.patient_type === "surgery_patient" ||
                  prescriptionData.patient_type === "nofollowupappointment"
                }
                isInvalid={!!validationErrors["next-appo-date"]}
                style={{
                  borderRadius: "10px",
                  border: validationErrors["next-appo-date"] ? "2px solid #dc3545" : "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                  backgroundColor:
                    prescriptionData.patient_type === "surgery_patient" ||
                      prescriptionData.patient_type === "nofollowupappointment"
                      ? "#e9ecef"
                      : "white",
                }}
              />
            </Col>
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Doctor Comment
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                disabled={prescriptionData.no_medicines_prescribed}
                value={prescriptionData.doctor_comment || ""}
                onChange={(e) =>
                  handlePrescriptionChange("doctor_comment", e.target.value)
                }
                placeholder="Doctor comment..."
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
          </Row>

          <hr className="my-4" style={{ opacity: "0.1" }} />

          <div
            className="d-flex justify-content-between align-items-center mb-3 p-2 rounded"
            style={{
              border: validationErrors.medicines ? "2px solid red" : "none",
              backgroundColor: validationErrors.medicines ? "#ffebee" : "transparent"
            }}
          >
            <h6
              className="fw-bold m-0 d-flex align-items-center"
              style={{ color: validationErrors.medicines ? "#d32f2f" : "#005979ff", fontSize: "14px", padding: "5px" }}
            >
              <FeatherIcon
                icon="plus-circle"
                size="16"
                className="me-2 text-success"
              />{" "}
              Meditative Advice & Pharmacy Orders{" "}
              <span className="text-danger">*</span>
              {validationErrors.medicines && (
                <span className="text-danger fw-bold ms-3" style={{ fontSize: "12px" }}>
                  (At least one medicine is required if 'No medicines prescribed' is unchecked)
                </span>
              )}
            </h6>
            <div className="d-flex gap-3">
              {!hideAAC && (
                <div
                  className="rounded px-2 py-1 d-flex align-items-center"
                  style={{ border: "1px solid #00838f" }}
                >
                  <Form.Check
                    type="checkbox"
                    label="AAC"
                    id="aac-checkbox"
                    disabled={prescriptionData.no_medicines_prescribed}
                    checked={
                      prescriptionData.medicines?.some(
                        (m) => m.name === "Anoac H tablet",
                      ) &&
                      prescriptionData.medicines?.some(
                        (m) => m.name === "Anoac Cream",
                      ) &&
                      prescriptionData.medicines?.some(
                        (m) => m.name === "Constac Powder",
                      )
                    }
                    onChange={(e) => {
                      const medsList = prescriptionData.medicines || [];
                      if (e.target.checked) {
                        const aacMeds = [
                          {
                            medicine_id: "UrD5Ww+76xqbQKh+dH7+jw==",
                            name: "Anoac Cream",
                            qty: "1",
                            times: [],
                            days: "15",
                            mrp: "347",
                            is_aac: true,
                          },
                          {
                            medicine_id: "VgqhMj4FIesznTusecgBeg==",
                            name: "Anoac H tablet",
                            qty: "1",
                            times: ["After Lunch", "After Dinner"],
                            days: "15",
                            mrp: "516",
                            is_aac: true,
                          },
                          {
                            medicine_id: "yz3tZfKtlXM5nkB3DLn20Q==",
                            name: "Constac Powder",
                            qty: "1",
                            times: ["After Dinner"],
                            days: "15",
                            mrp: "269",
                            is_aac: true,
                          },
                        ];
                        const medsToAdd = aacMeds.filter(
                          (newMed) =>
                            !medsList.some((m) => m.name === newMed.name),
                        );
                        handlePrescriptionChange("medicines", [
                          ...medsList,
                          ...medsToAdd,
                        ]);
                      } else {
                        const updatedMeds = medsList.filter(
                          (med) =>
                            ![
                              "Anoac H tablet",
                              "Anoac Cream",
                              "Constac Powder",
                            ].includes(med.name),
                        );
                        handlePrescriptionChange("medicines", updatedMeds);
                      }
                    }}
                    className="fw-bold m-0"
                    style={{ color: "#00838f", fontSize: "14px" }}
                  />
                </div>
              )}
            </div>
          </div>

          <Row className="align-items-start g-2">
            <Col
              md={2}
              className="position-relative"
              style={{ zIndex: showMedicineDropdown ? 1050 : 1 }}
            >
              <Form.Label
                className="fw-bold"
                style={{ fontSize: "12px", color: "#34495e" }}
              >
                Prescribed Medicines
              </Form.Label>
              <Form.Control
                type="text"
                value={currentMedicine.name || ""}
                disabled={prescriptionData.no_medicines_prescribed}
                onChange={(e) => {
                  const val = e.target.value;
                  setCurrentMedicine((prev) => ({
                    ...prev,
                    name: val,
                  }));
                  if (val.length >= 2) {
                    fetch(
                      `${BASE_URL}/V1/doctor/search-medicine?location=${location}&keyword=${encodeURIComponent(val)}`,
                    )
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.statusCode === 200) {
                          setMedicineSearchResults(data.data);
                          setShowMedicineDropdown(true);
                        }
                      })
                      .catch(console.error);
                  } else {
                    setShowMedicineDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (
                    currentMedicine.name &&
                    currentMedicine.name.length >= 2 &&
                    medicineSearchResults.length > 0
                  ) {
                    setShowMedicineDropdown(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowMedicineDropdown(false), 200);
                }}
                placeholder="Start typing name..."
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
              {showMedicineDropdown && medicineSearchResults.length > 0 && (
                <div
                  className="bg-white border rounded shadow-sm mt-1"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "100%",
                  }}
                >
                  {medicineSearchResults.map((med) => {
                    const medType = med.medicine_type
                      ? `(${med.medicine_type})`
                      : "";
                    const strength = med.medicine_strength || "";
                    const unit = med.medicine_unit || "";
                    const topText =
                      `${med.name} ${med.qty ? `(${med.qty} qty)` : ""}`
                        .replace(/\s+/g, " ")
                        .trim();

                    let bottomText = "";
                    if (med.content) {
                      bottomText = med.content;
                    } else {
                      bottomText =
                        `${medType} ${strength} ${unit}`
                          .replace(/\s+/g, " ")
                          .trim() || "Local Medicine";
                    }

                    const fullSearchValue = med.content
                      ? `${med.name}`
                      : `${med.name} ${medType} ${strength} ${unit}`
                        .replace(/\s+/g, " ")
                        .trim();
                    return (
                      <div
                        key={med.medicine_id}
                        className="px-3 py-2 cursor-pointer hover-bg-light border-bottom"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCurrentMedicine((prev) => ({
                            ...prev,
                            name: fullSearchValue,
                            medicine_id: med.medicine_id,
                            mrp: med.mrp,
                            available_qty: Number(med.qty) || 0, // ← carry eVital stock onto the picked medicine
                          }));
                          setShowMedicineDropdown(false);
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#333" }}>
                          <strong>{topText}</strong>
                          <br />
                          <small>{bottomText}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Col>
            <Col md={1}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Dosage
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Dosage"
                value={currentMedicine.dosage_frequency || ""}
                disabled={prescriptionData.no_medicines_prescribed}
                onChange={(e) =>
                  setCurrentMedicine((prev) => ({
                    ...prev,
                    dosage_frequency: e.target.value,
                  }))
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={6}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px", marginLeft: "15px" }}>
                Frequency
              </Form.Label>
              <div
                className="mb-1"
                style={{
                  marginLeft: "15px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "10px",
                }}
              >
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="d-flex flex-column align-items-center"
                    style={{ minWidth: "45px" }}
                  >
                    <Form.Check
                      type="checkbox"
                      label={slot}
                      checked={currentMedicine.times?.includes(slot)}
                      disabled={prescriptionData.no_medicines_prescribed}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...(currentMedicine.times || []), slot]
                          : (currentMedicine.times || []).filter(
                            (t) => t !== slot,
                          );
                        setCurrentMedicine((prev) => ({
                          ...prev,
                          times: updated,
                        }));
                      }}
                      className="m-0 p-0"
                      style={{ fontSize: "13px" }}
                    />
                  </div>
                ))}
              </div>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Days
              </Form.Label>
              <Form.Select
                value={currentMedicine.days}
                disabled={prescriptionData.no_medicines_prescribed}
                onChange={(e) =>
                  setCurrentMedicine((prev) => ({
                    ...prev,
                    days: e.target.value,
                  }))
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              >
                <option value="">Day</option>
                {[
                  "1",
                  "2",
                  "3",
                  "5",
                  "7",
                  "10",
                  "15",
                  "30",
                  "45",
                  "60",
                  "90",
                  "120",
                  "SOS",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={1}>
              <Form.Label className="fw-bold" style={{ fontSize: "12px" }}>
                Qty
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="Qty"
                value={currentMedicine.qty}
                disabled={prescriptionData.no_medicines_prescribed}
                onChange={(e) =>
                  setCurrentMedicine((prev) => ({
                    ...prev,
                    qty: e.target.value,
                  }))
                }
                style={{
                  borderRadius: "10px",
                  border: "2px solid #b2ebf2",
                  padding: "6px 12px",
                  fontSize: "12px",
                }}
              />
            </Col>
            <Col md={1}>
              <Button
                onClick={handleAddMedicine}
                className="w-100 py-6 btn-info shadow-sm"
                style={{ borderRadius: "8px", marginTop: "26px" }}
              >
                <FeatherIcon icon="plus" size="18" />
              </Button>
            </Col>
          </Row>

          {(prescriptionData.medicines?.length > 0 ||
            prescriptionData.no_medicines_prescribed) && (
              <div className="mt-4 rounded overflow-hidden border">
                <Table responsive hover className="mb-0">
                  <thead
                    style={{
                      backgroundColor: "#f1fcfd",
                      borderBottom: "2px solid #b2ebf2",
                    }}
                  >
                    <tr>
                      <th
                        className="py-2 px-3 border-0"
                        style={{ fontSize: "14px", width: "20%" }}
                      >
                        Medicine Name
                      </th>
                      <th
                        className="py-2 px-3 border-0"
                        style={{ fontSize: "14px", width: "15%" }}
                      >
                        Dosage
                      </th>
                      <th
                        className="py-2 px-3 border-0"
                        style={{ fontSize: "14px", width: "35%" }}
                      >
                        Frequency
                      </th>
                      <th
                        className="py-2 px-3 border-0 text-center"
                        style={{ fontSize: "14px", width: "10%" }}
                      >
                        Days
                      </th>
                      <th
                        className="py-2 px-3 border-0 text-center"
                        style={{ fontSize: "14px", width: "10%" }}
                      >
                        Qty
                      </th>
                      <th
                        className="py-2 px-3 border-0 text-center"
                        style={{ fontSize: "14px", width: "10%" }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionData.no_medicines_prescribed ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3">
                          <i className="fw-bold">No Medicines Prescribed</i>
                        </td>
                      </tr>
                    ) : (
                      prescriptionData.medicines.map((m, idx) => (
                        <tr key={idx} className="align-middle">
                          <td
                            className="py-2 px-3 fw-bold"
                            style={{ fontSize: "14px" }}
                          >
                            {m.name}
                          </td>
                          <td className="py-2 px-3 fw-bold">
                            {editingMedicineIndex === idx ? (
                              <Form.Control
                                size="sm"
                                value={m.dosage_frequency || ""}
                                onChange={(e) => {
                                  const newMedicines = [
                                    ...prescriptionData.medicines,
                                  ];
                                  newMedicines[idx] = {
                                    ...m,
                                    dosage_frequency: e.target.value,
                                  };
                                  handlePrescriptionChange(
                                    "medicines",
                                    newMedicines,
                                  );
                                }}
                                style={{
                                  borderRadius: "10px",
                                  border: "2px solid #b2ebf2",
                                  fontSize: "12px",
                                }}
                              />
                            ) : (
                              m.dosage_frequency || ""
                            )}
                          </td>
                          <td className="py-2 px-3 fw-bold">
                            {editingMedicineIndex === idx ? (
                              <div className="d-flex flex-wrap gap-1">
                                {timeSlots.map((slot) => (
                                  <Form.Check
                                    key={slot}
                                    type="checkbox"
                                    label={slot}
                                    checked={m.times?.includes(slot)}
                                    onChange={(e) => {
                                      const newMedicines = [
                                        ...prescriptionData.medicines,
                                      ];
                                      const updatedTimes = e.target.checked
                                        ? [...(m.times || []), slot]
                                        : (m.times || []).filter(
                                          (t) => t !== slot,
                                        );
                                      newMedicines[idx] = {
                                        ...m,
                                        times: updatedTimes,
                                      };
                                      handlePrescriptionChange(
                                        "medicines",
                                        newMedicines,
                                      );
                                    }}
                                    style={{
                                      fontSize: "13px",
                                      marginRight: "8px",
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="d-flex flex-wrap gap-1">
                                {m.times?.map((t) => (
                                  <span
                                    key={t}
                                    className="py-1 px-2"
                                    style={{
                                      fontSize: "13px",
                                      backgroundColor: "#e0f7fa",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td
                            className="py-2 px-3 fw-semibold fw-bold text-center"
                            style={{ fontSize: "13px" }}
                          >
                            {editingMedicineIndex === idx ? (
                              <Form.Select
                                size="sm"
                                value={m.days}
                                onChange={(e) => {
                                  const newMedicines = [
                                    ...prescriptionData.medicines,
                                  ];
                                  newMedicines[idx] = {
                                    ...m,
                                    days: e.target.value,
                                  };
                                  handlePrescriptionChange(
                                    "medicines",
                                    newMedicines,
                                  );
                                }}
                                style={{
                                  borderRadius: "10px",
                                  border: "2px solid #b2ebf2",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  minWidth: "75px",
                                  margin: "0 auto",
                                }}
                              >
                                <option value="">Day</option>
                                {[
                                  "1",
                                  "2",
                                  "3",
                                  "5",
                                  "7",
                                  "10",
                                  "15",
                                  "30",
                                  "45",
                                  "60",
                                  "90",
                                  "120",
                                  "SOS",
                                ].map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </Form.Select>
                            ) : (
                              `${m.days} Days`
                            )}
                          </td>
                          <td className="py-2 px-3 fw-bold text-center">
                            {editingMedicineIndex === idx ? (
                              <Form.Control
                                type="number"
                                size="sm"
                                value={m.qty}
                                onChange={(e) => {
                                  const newMedicines = [
                                    ...prescriptionData.medicines,
                                  ];
                                  newMedicines[idx] = {
                                    ...m,
                                    qty: e.target.value,
                                  };
                                  handlePrescriptionChange(
                                    "medicines",
                                    newMedicines,
                                  );
                                }}
                                style={{
                                  borderRadius: "10px",
                                  border: "2px solid #b2ebf2",
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  width: "70px",
                                  margin: "0 auto",
                                }}
                              />
                            ) : (
                              <span
                                className="px-2 py-1"
                                style={{ fontSize: "13px" }}
                              >
                                {m.qty} Units
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {m.name !== "Constac Powder" && (
                              <Button
                                variant={
                                  editingMedicineIndex === idx
                                    ? "success"
                                    : "info"
                                }
                                size="sm"
                                className="p-7 px-5 me-2"
                                onClick={() => {
                                  if (editingMedicineIndex === idx) {
                                    setEditingMedicineIndex(null);
                                  } else {
                                    setEditingMedicineIndex(idx);
                                  }
                                }}
                              >
                                <FeatherIcon
                                  icon={
                                    editingMedicineIndex === idx
                                      ? "check"
                                      : "edit-2"
                                  }
                                  size="14"
                                />
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              className="p-7 px-5"
                              onClick={() => handleRemoveMedicine(idx)}
                            >
                              <FeatherIcon icon="trash" size="14" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
        </fieldset>
      </div>

      <div className="text-center mb-5 pb-5">
        {isReadOnly ? (
          <span
            className="d-inline-flex align-items-center"
            style={{ color: "#00796b", fontWeight: 700, fontSize: "13px" }}
          >
            <FeatherIcon icon="lock" size="16" className="me-2" />
            Locked — click EDIT to modify this prescription, or NEW RECORD to
            add another.
          </span>
        ) : (
          <Button
            onClick={onSavePrescription}
            disabled={loading}
            style={{
              backgroundColor: "#00796b",
              borderColor: "#00796b",
              padding: "10px 40px",
              borderRadius: "50px",
              fontWeight: "800",
              fontSize: "13px",
              boxShadow: "0 10px 30px rgba(0, 121, 107, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            <FeatherIcon icon="save" size="18" className="me-2" />
            {loading ? "SAVING..." : (isEditing ? "UPDATE PRESCRIPTION" : "SAVE PRESCRIPTION DATA")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OpdPrescriptionCard;
