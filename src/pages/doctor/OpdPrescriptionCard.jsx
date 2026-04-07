import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Table, Dropdown } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";

const BASE_URL = "http://194.195.117.79:5100/api";

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
  assistanceDoctors = [],
  location = "default"
}) => {
  const [testAdviceOptions, setTestAdviceOptions] = useState([]);
  const [preopInvestOptions, setPreopInvestOptions] = useState([]);
  const [filteredAssistanceDoctors, setFilteredAssistanceDoctors] = useState([]);

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
          const res = await fetch(`${BASE_URL}/V1/doctor/prescriptionAdviceDropdown?location=${location}&testadvice=${adviceCategory}`);
          const result = await res.json();
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
          const res = await fetch(`${BASE_URL}/V1/doctor/prescriptionAdviceDropdown?location=${location}&testadvice=PREOP`);
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

      // Fetch filtered Assistance Doctors
      if (deptId) {
        try {
          const res = await fetch(`${BASE_URL}/V1/doctor/assistanceDoctorDropdown?location=${location}&departmentId=${deptId}`);
          const result = await res.json();
          if (result.statusCode === 200) {
            setFilteredAssistanceDoctors(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching filtered assistance doctors:", error);
        }
      } else {
        setFilteredAssistanceDoctors(assistanceDoctors);
      }
    };

    fetchDynamicData();
  }, [prescriptionData.prescription_type, location, assistanceDoctors]);

  const timeSlots = ["Before Breakfast", "After Breakfast", "Before Lunch", "After Lunch", "Before Dinner", "After Dinner", "After Evening Snacks", "LA"];

  return (
    <div className="animate__animated animate__fadeIn">
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
      <div className="p-3 bg-white rounded shadow-sm border mb-3" style={{ borderLeft: "5px solid #0097a7" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#00838f", textTransform: "uppercase", letterSpacing: "1px", fontSize: "14px" }}>
            <FeatherIcon icon="file-text" size="18" className="me-2 text-info" />Outpatient Prescription (OPD)
          </h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={onNewPrescription}
              style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}
            >
              <FeatherIcon icon="plus" size="14" className="me-1" /> NEW RECORD
            </Button>
            <Dropdown onSelect={onSelectPrescription}>
              <Dropdown.Toggle
                variant="info"
                id="previous-pres-dropdown"
                size="sm"
                style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: "white" }}
              >
                <FeatherIcon icon="calendar" size="14" className="me-1" /> PREVIOUS DATES
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ fontSize: "12px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                {previousPrescriptionList.length > 0 ? (
                  previousPrescriptionList.map((pr) => (
                    <Dropdown.Item key={pr.id} eventKey={pr.id}>
                      {pr.date} {pr.id === selectedPrescriptionId && <FeatherIcon icon="check" size="12" className="ms-2 text-success" />}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No previous records</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <Row>
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Prescription Type <span className="text-danger">*</span></Form.Label>
            <Form.Select value={prescriptionData.prescription_type} onChange={(e) => handlePrescriptionChange("prescription_type", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Prescription Type</option>
              <option value="Proctology">Proctology</option>
              <option value="Urology">Urology</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Date of Prescription</Form.Label>
            <Form.Control type="date" value={prescriptionData.creation_timestamp} onChange={(e) => handlePrescriptionChange("creation_timestamp", e.target.value)} style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Assistance Doctor</Form.Label>
            <Form.Select
              value={prescriptionData.prescription_type === "Urology" ? prescriptionData.udoctor_id : prescriptionData.doctor_id}
              onChange={(e) => handlePrescriptionChange(prescriptionData.prescription_type === "Urology" ? "udoctor_id" : "doctor_id", e.target.value)}
              style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}
            >
              <option value="">Select Doctor</option>
              {filteredAssistanceDoctors.map((doc) => (
                <option key={doc.doctor_id} value={doc.doctor_id}>
                  {doc.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={prescriptionData.prescription_type === "Urology" ? 3 : 3} className="mb-20">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Test Advice</Form.Label>
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-info"
                id="test-advice-dropdown"
                className="w-100 text-start d-flex justify-content-between align-items-center"
                style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", backgroundColor: "white", color: "#333" }}
              >
                Select Tests...
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-200 shadow-sm border-0" style={{ maxHeight: "300px", overflowY: "auto", padding: "10px", borderRadius: "12px" }}>
                {testAdviceOptions.length > 0 ? (
                  testAdviceOptions.map((t) => {
                    const isChecked = (prescriptionData.prescription_type === "Urology" ? prescriptionData.uroadvice : prescriptionData.surgical_advice)?.includes(t.padvice_desc);
                    return (
                      <div
                        key={t.padvice_id}
                        className="px-2 py-1 mb-1 rounded hover-bg-light"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`test-advice-${t.padvice_id}`}
                          label={<span style={{ fontSize: "12px", cursor: "pointer" }}>{t.padvice_desc}</span>}
                          checked={isChecked}
                          onChange={() => handlePrescriptionCheckboxChange(prescriptionData.prescription_type === "Urology" ? "uroadvice" : "surgical_advice", t.padvice_desc)}
                          className="custom-checkbox"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted text-center p-2" style={{ fontSize: "11px" }}>No options available</div>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <div className="mt-2 d-flex flex-wrap gap-1">
              {(prescriptionData.prescription_type === "Urology" ? prescriptionData.uroadvice : prescriptionData.surgical_advice)?.map((item, idx) => (
                <span key={idx} className="badge bg-info text-white d-flex align-items-center" style={{ fontSize: "10px", borderRadius: "20px", padding: "4px 10px", fontWeight: "600" }}>
                  {item}
                  <FeatherIcon
                    icon="x"
                    size="12"
                    className="ms-2 cursor-pointer hover-text-danger"
                    onClick={() => handlePrescriptionCheckboxChange(prescriptionData.prescription_type === "Urology" ? "uroadvice" : "surgical_advice", item)}
                  />
                </span>
              ))}
            </div>
          </Col>
          {prescriptionData.prescription_type === "Urology" && (
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>PREOP Investigation</Form.Label>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="preop-invest-dropdown"
                  className="w-100 text-start d-flex justify-content-between align-items-center"
                  style={{ borderRadius: "10px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px", backgroundColor: "white", color: "#333" }}
                >
                  Select PREOP...
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100 shadow-sm border-0" style={{ maxHeight: "300px", overflowY: "auto", padding: "10px", borderRadius: "12px" }}>
                  {preopInvestOptions.length > 0 ? (
                    preopInvestOptions.map((t) => {
                      const isChecked = prescriptionData.preopinvestigation?.includes(t.padvice_desc);
                      return (
                        <div
                          key={t.padvice_id}
                          className="px-2 py-1 mb-1 rounded hover-bg-light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Form.Check
                            type="checkbox"
                            id={`preop-invest-${t.padvice_id}`}
                            label={<span style={{ fontSize: "12px", cursor: "pointer" }}>{t.padvice_desc}</span>}
                            checked={isChecked}
                            onChange={() => handlePrescriptionCheckboxChange("preopinvestigation", t.padvice_desc)}
                            className="custom-checkbox"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted text-center p-2" style={{ fontSize: "11px" }}>No options available</div>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <div className="mt-2 d-flex flex-wrap gap-1">
                {prescriptionData.preopinvestigation?.map((item, idx) => (
                  <span key={idx} className="badge bg-secondary text-white d-flex align-items-center" style={{ fontSize: "10px", borderRadius: "20px", padding: "4px 10px", fontWeight: "600" }}>
                    {item}
                    <FeatherIcon
                      icon="x"
                      size="12"
                      className="ms-2 cursor-pointer hover-text-danger"
                      onClick={() => handlePrescriptionCheckboxChange("preopinvestigation", item)}
                    />
                  </span>
                ))}
              </div>
            </Col>
          )}
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Known Allergies</Form.Label>
            <Form.Control as="textarea" rows={2} value={prescriptionData.allergy} onChange={(e) => handlePrescriptionChange("allergy", e.target.value)} placeholder="e.g. Penicillin, Sulfa..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Diagnosis</Form.Label>
            {prescriptionData.prescription_type === "Urology" ? (
              <Form.Control as="textarea" rows={2} value={prescriptionData.urodiagnosis} onChange={(e) => handlePrescriptionChange("urodiagnosis", e.target.value)} placeholder="Urology diagnosis..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            ) : (
              <Form.Control as="textarea" rows={2} value={prescriptionData.diagnosis} onChange={(e) => handlePrescriptionChange("diagnosis", e.target.value)} placeholder="Core diagnosis for this visit..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
            )}
          </Col>
          {prescriptionData.prescription_type !== "Urology" && (
            <Col md={3} className="mb-3">
              <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Advice sx</Form.Label>
              <Form.Control as="textarea" rows={2} value={prescriptionData.advicesx} onChange={(e) => handlePrescriptionChange("advicesx", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", fontSize: "12px" }} />
            </Col>
          )}
          <Col md={3} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Admission Note</Form.Label>
            <Form.Control as="textarea" rows={2} value={prescriptionData.admmisionnote} onChange={(e) => handlePrescriptionChange("admmisionnote", e.target.value)} style={{ borderRadius: "8px", border: "2px solid #b2ebf2", fontSize: "12px" }} />
          </Col>
        </Row>

        {/* Urology Specific Fields */}
        {prescriptionData.prescription_type === "Urology" && (
          <>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Chief Complaints (C/O)</Form.Label>
                <Form.Control as="textarea" rows={2} value={prescriptionData.medicalchiefcomplaints} onChange={(e) => handlePrescriptionChange("medicalchiefcomplaints", e.target.value)} placeholder="Enter chief complaints..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Known Case Of</Form.Label>
                <Form.Control as="textarea" rows={2} value={prescriptionData.medicalhistory} onChange={(e) => handlePrescriptionChange("medicalhistory", e.target.value)} placeholder="Medical history..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Past Surgical History (S/P)</Form.Label>
                <Form.Control as="textarea" rows={2} value={prescriptionData.medicalpasthistory} onChange={(e) => handlePrescriptionChange("medicalpasthistory", e.target.value)} placeholder="Past surgeries..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Investigation</Form.Label>
                <Form.Control as="textarea" rows={2} value={prescriptionData.investigation} onChange={(e) => handlePrescriptionChange("investigation", e.target.value)} placeholder="Previous investigations..." style={{ borderRadius: "8px", border: "2px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
              </Col>
            </Row>
          </>
        )}
        <Row>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Next Appointment <span className="text-danger">*</span></Form.Label>
            <Form.Select value={prescriptionData.patient_type} onChange={(e) => handlePrescriptionChange("patient_type", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }}>
              <option value="">Select Appointment Type</option>
              <option value="Follow">Follow Up Patient</option>
              <option value="Postoperative">Post Operative Patient</option>
              <option value="surgery_patient">Surgery Patient</option>
              <option value="nofollowupappointment">No Followup Appointment</option>
            </Form.Select>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Label className="fw-bold" style={{ fontSize: "11px" }}>Next Appointment Date</Form.Label>
            <Form.Control type="date" value={prescriptionData["next-appo-date"]} onChange={(e) => handlePrescriptionChange("next-appo-date", e.target.value)} style={{ borderRadius: "10px", border: "1px solid #b2ebf2", padding: "6px 12px", fontSize: "12px" }} />
          </Col>
        </Row>

        <hr className="my-4" style={{ opacity: "0.1" }} />

        <h6 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#005979ff", fontSize: "14px" }}>
          <FeatherIcon icon="plus-circle" size="16" className="me-2 text-success" /> Meditative Advice & Pharmacy Orders
        </h6>


        <Row className="align-items-end g-2">
          <Col md={3}>
            <Form.Label className="fw-bold text-muted" style={{ fontSize: "11px" }}>Advice Medicine</Form.Label>
            <Form.Control type="text" value={currentMedicine.name} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))} placeholder="Start typing name..." style={{ borderRadius: "8px", border: "2px solid #e0f2f1", padding: "6px", fontSize: "12px" }} />
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold text-muted" style={{ fontSize: "11px" }}>Qty</Form.Label>
            <Form.Select value={currentMedicine.qty} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, qty: e.target.value }))} style={{ borderRadius: "8px", border: "2px solid #e0f2f1", padding: "6px", fontSize: "12px" }}>
              <option value="">Qty</option>
              {[...Array(60)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-wrap gap-1 justify-content-between mb-1">
              {timeSlots.map(slot => (
                <div key={slot} className="d-flex flex-column align-items-center" style={{ minWidth: "45px" }}>
                  <Form.Check
                    type="checkbox"
                    id={`inline-slot-${slot}`}
                    checked={currentMedicine.times?.includes(slot)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(currentMedicine.times || []), slot]
                        : (currentMedicine.times || []).filter(t => t !== slot);
                      setCurrentMedicine(prev => ({ ...prev, times: updated }));
                    }}
                    className="m-0 p-0"
                  />
                  <label htmlFor={`inline-slot-${slot}`} className="text-center m-0 mt-1" style={{ fontSize: "9px", lineHeight: "1", cursor: "pointer", fontWeight: "600", color: "#555", whiteSpace: "pre-wrap" }}>
                    {slot.split(" ").join("\n")}
                  </label>
                </div>
              ))}
            </div>
          </Col>
          <Col md={1}>
            <Form.Label className="fw-bold text-muted" style={{ fontSize: "11px" }}>Days</Form.Label>
            <Form.Select value={currentMedicine.days} onChange={(e) => setCurrentMedicine(prev => ({ ...prev, days: e.target.value }))} style={{ borderRadius: "8px", border: "2px solid #e0f2f1", padding: "6px", fontSize: "12px" }}>
              <option value="">Day</option>
              {["1", "2", "3", "5", "7", "10", "15", "30", "45", "60", "90", "120", "SOS"].map(d => <option key={d} value={d}>{d}</option>)}
            </Form.Select>
          </Col>
          <Col md={1}>
            <Button onClick={handleAddMedicine} className="w-100 py-1 btn-info shadow-sm" style={{ borderRadius: "8px" }}>
              <FeatherIcon icon="plus" size="18" />
            </Button>
          </Col>
        </Row>

        {prescriptionData.medicines?.length > 0 && (
          <div className="mt-4 rounded overflow-hidden border">
            <Table responsive hover className="mb-0">
              <thead style={{ backgroundColor: "#f1fcfd", borderBottom: "2px solid #b2ebf2" }}>
                <tr>
                  <th className="py-2 px-3 border-0" style={{ fontSize: "12px" }}>Medicine Name</th>
                  <th className="py-2 px-3 border-0" style={{ fontSize: "12px" }}>Qty</th>
                  <th className="py-2 px-3 border-0" style={{ fontSize: "12px" }}>Dosage Intervals</th>
                  <th className="py-2 px-3 border-0" style={{ fontSize: "12px" }}>Duration</th>
                  <th className="py-2 px-3 border-0 text-center" style={{ fontSize: "12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.medicines.map((m, idx) => (
                  <tr key={idx} className="align-middle">
                    <td className="py-2 px-3 fw-bold" style={{ fontSize: "12px" }}>{m.name}</td>
                    <td className="py-2 px-3 fw-bold"><span className="px-2 py-1" style={{ fontSize: "11px" }}>{m.qty} Units</span></td>
                    <td className="py-2 px-3 fw-bold">
                      <div className="d-flex flex-wrap gap-1 ">
                        {m.times?.map(t => <span key={t} className="py-1 px-2" style={{ fontSize: "11px" }}>{t}</span>)}
                      </div>
                    </td>
                    <td className="py-2 px-3 fw-semibold fw-bold" style={{ fontSize: "11px" }}>{m.days} Days</td>
                    <td className="py-2 px-3 text-center">
                      <Button variant="outline-danger" size="lg" className="p-5" onClick={() => handleRemoveMedicine(idx)}>
                        <FeatherIcon icon="trash" size="14" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

      </div>

      <div className="text-center mb-5 pb-5">
        <Button
          onClick={onSavePrescription}
          style={{ backgroundColor: "#00796b", borderColor: "#00796b", padding: "10px 40px", borderRadius: "50px", fontWeight: "800", fontSize: "13px", boxShadow: "0 10px 30px rgba(0, 121, 107, 0.3)", textTransform: "uppercase", letterSpacing: "1px" }}
        >
          <FeatherIcon icon="save" size="18" className="me-2" />SAVE PRESCRIPTION DATA
        </Button>
      </div>
    </div>
  );
};

export default OpdPrescriptionCard;
