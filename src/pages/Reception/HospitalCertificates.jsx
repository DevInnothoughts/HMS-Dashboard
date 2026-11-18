import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Container,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";
import { decodeJwt } from "../Utility/decode-jwt";
import moment from "moment";
import Swal from "sweetalert2";

const BASE_URL = "http://194.195.117.79:5100/api";
const UPLOAD_BASE_URL = "http://194.195.117.79:5100/uploads";

const HospitalCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [newCertName, setNewCertName] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [newCertFile, setNewCertFile] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("default");
  const [loading, setLoading] = useState(false);

  // Preview Modal States
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [previewType, setPreviewType] = useState("");

  // Local file preview state (avoid memory leak with URL.createObjectURL)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!newCertFile) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(newCertFile);
    setFilePreviewUrl(objectUrl);

    // Free memory when component unmounts or newCertFile changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [newCertFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setNewCertFile(file);
  };

  const certificateOptions = [
    "Bio Medical Certificate",
    "Drug License",
    "Fire NOC",
    "Franchise Certificate",
    "Hospital License",
    "ISO Certificate",
    "NABH Certificate",
    "Pollution Control Certificate",
    "Rent Agreement",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const fetchCertificates = async () => {
    if (currentLocation === "default") return;
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/certificates?location=${currentLocation}`,
      );
      const data = await response.json();
      if (response.ok && data.data) {
        setCertificates(data.data);
      } else {
        console.error("Failed to fetch certificates:", data.message);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation !== "default") {
      fetchCertificates();
    }
  }, [currentLocation]);

  const isFileRequired =
    newCertName !== "Franchise Certificate" &&
    newCertName !== "FranchiseCertificate";

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCertName || !newExpiryDate || (isFileRequired && !newCertFile)) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: isFileRequired
          ? "Please fill all fields and upload a certificate file."
          : "Please select certificate name and expiry date.",
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    // Double check on frontend to prevent submit of already loaded certificate
    if (isAlreadySubmitted(newCertName)) {
      Swal.fire({
        icon: "warning",
        title: "Already Submitted",
        text: `Certificate "${newCertName}" is already submitted.`,
        confirmButtonColor: "#00acc1",
      });
      return;
    }

    const formData = new FormData();
    formData.append("certificate_name", newCertName);
    formData.append("certificate_expiry", newExpiryDate);
    if (newCertFile) {
      formData.append("certificate_file", newCertFile);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/V1/certificates?location=${currentLocation}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await response.json();
      if (response.ok && data.statusCode === 201) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Certificate added successfully!",
          confirmButtonColor: "#00acc1",
        });
        setNewCertName("");
        setNewExpiryDate("");
        setNewCertFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchCertificates();
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: data.message || "Failed to add certificate.",
          confirmButtonColor: "#00acc1",
        });
      }
    } catch (error) {
      console.error("Error adding certificate:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error adding certificate.",
        confirmButtonColor: "#00acc1",
      });
    }
  };

  const getFileUrl = (dbPath) => {
    if (!dbPath) return "";
    if (dbPath.startsWith("http://") || dbPath.startsWith("https://"))
      return dbPath;
    try {
      const url = new URL(BASE_URL);
      return `${url.origin}${dbPath}`;
    } catch (e) {
      return `http://194.195.117.79:5100${dbPath}`;
    }
  };

  const getStatus = (expiryDate) => {
    if (!expiryDate) return "Active";
    const expiry = moment(expiryDate).startOf("day");
    const today = moment().startOf("day");
    const tomorrow = moment().startOf("day").add(1, "day");
    const sixMonthsFromNow = moment().startOf("day").add(6, "months");

    if (expiry.isBefore(today)) {
      return "Expired";
    } else if (expiry.isSame(today)) {
      return "Expiring today";
    } else if (expiry.isSame(tomorrow)) {
      return "Expiring tomorrow";
    } else if (expiry.isSameOrBefore(sixMonthsFromNow)) {
      return "Expires soon";
    } else {
      return "Active";
    }
  };

  const isAlreadySubmitted = (name) => {
    return certificates.some(
      (c) =>
        c.certificate_name === name &&
        getStatus(c.certificate_expiry) !== "Expired",
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex justify-content-center">
        {rowData.certificate_path ? (
          <Button
            variant="outline-info"
            size="sm"
            style={{
              borderRadius: "10px",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "6px 8px",
            }}
            title="Preview Certificate"
            onClick={() => {
              const url = getFileUrl(rowData.certificate_path);
              if (url) {
                setPreviewUrl(url);
                setPreviewName(rowData.certificate_name);
                setPreviewType(
                  url.toLowerCase().split("?")[0].endsWith(".pdf")
                    ? "pdf"
                    : "image",
                );
                setShowPreview(true);
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Not Found",
                  text: "No file path found.",
                  confirmButtonColor: "#00acc1",
                });
              }
            }}
          >
            <i className="fa fa-eye"></i>
          </Button>
        ) : (
          <span
            style={{
              color: "#78909c",
              fontSize: "12px",
              fontStyle: "italic",
            }}
          >
            No file
          </span>
        )}
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    const status = getStatus(rowData.certificate_expiry);
    let badgeStyle = {
      padding: "4px 8px",
      borderRadius: "12px",
      fontWeight: "bold",
      fontSize: "12px",
    };

    if (status === "Active") {
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#e8f5e9",
        color: "#2e7d32",
      };
    } else if (status === "Expires soon") {
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#fff3e0",
        color: "#e65100",
      };
    } else {
      // "Expired", "Expiring today", "Expiring tomorrow" all use danger red styling
      badgeStyle = {
        ...badgeStyle,
        backgroundColor: "#ffebee",
        color: "#c62828",
      };
    }

    return <span style={badgeStyle}>{status}</span>;
  };

  const filteredCertificates = certificates.filter((cert) => {
    if (!selectedStatus) return true;
    return getStatus(cert.certificate_expiry) === selectedStatus;
  });

  const statusHeader = (
    <select
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      style={{
        fontSize: "12px",
        fontWeight: "bold",
        border: "1px solid  rgba(58, 137, 148, 1)",
        backgroundColor: "transparent",
        color: "black",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value="">Status (All)</option>
      <option value="Active">Active</option>
      <option value="Expires soon">Expires soon</option>
      <option value="Expiring tomorrow">Expiring tomorrow</option>
      <option value="Expiring today">Expiring today</option>
      <option value="Expired">Expired</option>
    </select>
  );

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "10px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Hospital Certificates" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              {/* Add Certificate Card */}
              <Card
                className="mb-4"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                  marginTop: "10px",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    borderBottom: "2px solid #0288d1",
                    padding: "0.6rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-plus-circle me-2"></i>Add Certificate
                  </h4>
                </Card.Header>
                <Card.Body style={{ padding: "6px" }}>
                  <form onSubmit={handleAddSubmit}>
                    <div className="table-responsive add-cert-table-responsive">
                      <table
                        className="table text-center add-cert-table"
                        style={{ marginBottom: 0 }}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: "30%" }}>Certificate Name</th>
                            <th style={{ width: "25%" }}>Expiry Date</th>
                            <th style={{ width: "30%" }}>
                              Certificate File
                              {!isFileRequired && newCertName && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "normal",
                                    color: "#004d40",
                                    marginLeft: "5px",
                                  }}
                                >
                                  (Optional)
                                </span>
                              )}
                            </th>
                            <th style={{ width: "15%" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <Form.Select
                                required
                                value={newCertName}
                                onChange={(e) => setNewCertName(e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                }}
                              >
                                <option value="">--Select Certificate--</option>
                                {certificateOptions
                                  .filter((opt) => !isAlreadySubmitted(opt))
                                  .sort((a, b) => a.localeCompare(b))
                                  .map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                              </Form.Select>
                            </td>
                            <td style={{ verticalAlign: "middle" }}>
                              <Form.Control
                                type="date"
                                required
                                min={new Date().toISOString().split("T")[0]}
                                value={newExpiryDate}
                                onChange={(e) =>
                                  setNewExpiryDate(e.target.value)
                                }
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                }}
                              />
                            </td>
                            <td style={{ verticalAlign: "middle" }}>
                              <Form.Control
                                type="file"
                                required={isFileRequired}
                                accept="image/*,application/pdf"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{
                                  fontSize: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #4dd0e1",
                                }}
                              />
                              {newCertFile && filePreviewUrl && (
                                <div
                                  style={{
                                    marginTop: "8px",
                                    padding: "6px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f0fdfa",
                                    border: "1px dashed #00acc1",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  {newCertFile.type === "application/pdf" ||
                                    newCertFile.name
                                      .toLowerCase()
                                      .endsWith(".pdf") ? (
                                    <div
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "6px",
                                        backgroundColor: "#ffebee",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#c62828",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        boxShadow:
                                          "0px 2px 4px rgba(0,0,0,0.1)",
                                      }}
                                    >
                                      <i className="fa fa-file-pdf-o"></i>
                                    </div>
                                  ) : (
                                    <img
                                      src={filePreviewUrl}
                                      alt="Selected preview"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        objectFit: "cover",
                                        borderRadius: "6px",
                                        boxShadow:
                                          "0px 2px 4px rgba(0,0,0,0.1)",
                                        border: "1px solid #e0e0e0",
                                      }}
                                    />
                                  )}
                                  <div
                                    style={{
                                      flex: 1,
                                      textAlign: "left",
                                      minWidth: 0,
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: "#37474f",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {newCertFile.name}
                                    </div>
                                    <Button
                                      variant="link"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPreviewUrl(filePreviewUrl);
                                        setPreviewName(newCertFile.name);
                                        setPreviewType(
                                          newCertFile.type ===
                                            "application/pdf" ||
                                            newCertFile.name
                                              .toLowerCase()
                                              .endsWith(".pdf")
                                            ? "pdf"
                                            : "image",
                                        );
                                        setShowPreview(true);
                                      }}
                                      style={{
                                        color: "#00acc1",
                                        fontWeight: "bold",
                                        textDecoration: "underline",
                                        padding: 0,
                                        fontSize: "10px",
                                        border: "none",
                                        background: "none",
                                        lineHeight: 1,
                                        marginTop: "2px",
                                      }}
                                    >
                                      <i className="fa fa-eye me-1"></i> Click
                                      to preview
                                    </Button>
                                  </div>
                                  <Button
                                    variant="link"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setNewCertFile(null);
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }
                                    }}
                                    style={{
                                      color: "#d32f2f",
                                      padding: "4px",
                                      fontSize: "15px",
                                      border: "none",
                                      background: "none",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      marginLeft: "auto",
                                    }}
                                    title="Remove selected file"
                                  >
                                    <i className="fa fa-times-circle"></i>
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td style={{ verticalAlign: "middle" }}>
                              <Button
                                type="submit"
                                variant="success"
                                style={{
                                  width: "100%",
                                  color: "white",
                                  borderRadius: "8px",
                                  fontWeight: "bold",
                                  fontSize: "13px",
                                  padding: "5px 12px",
                                }}
                              >
                                <i className="fa fa-upload me-1"></i>Upload
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </form>
                </Card.Body>
              </Card>

              {/* Certificates List Card */}
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "1px solid #00bcd4",
                  marginTop: "20px",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    borderBottom: "2px solid #0288d1",
                    padding: "0.6rem",
                    background: "linear-gradient(to right, #00acc1, #007c91)",
                    color: "white",
                    fontSize: "16px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>
                    <i className="fa fa-certificate me-2"></i>Hospital
                    Certificates
                  </h4>
                </Card.Header>
                <Card.Body style={{ padding: "5px" }}>
                  <DataTable
                    value={filteredCertificates}
                    paginator
                    rows={10}
                    loading={loading}
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                    emptyMessage="No certificates found."
                    className="p-datatable-sm custom-datatable"
                    style={{ fontSize: "12px" }}
                    rowHover
                    stripedRows
                    responsiveLayout="scroll"
                  >
                    <Column
                      header="Sr No"
                      body={(rowData, { rowIndex }) => rowIndex + 1}
                      style={{ width: "20%", textAlign: "center" }}
                    />
                    <Column
                      field="certificate_name"
                      header="Certificate Name"
                      style={{
                        width: "20%",
                        fontWeight: "600",
                        color: "#006064",
                        textAlign: "left",
                      }}
                    />
                    <Column
                      field="certificate_expiry"
                      header="Expiry Date"
                      body={(rowData) =>
                        rowData.certificate_expiry
                          ? moment(rowData.certificate_expiry).format(
                            "DD-MM-YYYY",
                          )
                          : "-"
                      }
                      style={{ width: "20%", textAlign: "center" }}
                    />
                    <Column
                      header={statusHeader}
                      body={statusBodyTemplate}
                      style={{ width: "20%", textAlign: "center" }}
                    />
                    <Column
                      header="Action"
                      body={actionBodyTemplate}
                      style={{ width: "20%", textAlign: "center" }}
                    />
                  </DataTable>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>

      {/* Document Preview Modal Popup */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{ background: "#e0f7fa", borderBottom: "2px solid #00bcd4" }}
        >
          <Modal.Title
            style={{ color: "#006064", fontWeight: "bold", fontSize: "16px" }}
          >
            <i className="fa fa-file-pdf-o me-2"></i> {previewName} Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            textAlign: "center",
            backgroundColor: "#f5fcfd",
            padding: "15px",
          }}
        >
          {previewType === "pdf" ? (
            <iframe
              src={`${previewUrl}#toolbar=0`}
              title={previewName}
              width="100%"
              height="550px"
              style={{ border: "none", borderRadius: "8px" }}
            />
          ) : (
            <img
              src={previewUrl}
              alt={previewName}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                maxWidth: "100%",
                maxHeight: "550px",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .custom-datatable .p-datatable-header {
          background: #e0f7fa;
          border: 1px solid #4dd0e1;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          padding: 10px;
        }
        .custom-datatable .p-datatable-thead > tr > th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px !important;
          padding: 10px 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
          font-weight: 600 !important;
          vertical-align: middle !important;
        }
        .custom-datatable .p-datatable-thead > tr > th * {
          color: black !important;
          justify-content: center !important;
        }
        .custom-datatable .p-datatable-tbody > tr > td {
          font-size: 12px !important;
          padding: 8px !important;
          border: 1px solid #90caf9 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .custom-datatable .p-paginator {
          background: #f8fdfe;
          border: 1px solid #4dd0e1;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          padding: 5px;
        }
        .add-cert-table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          border: 1px solid #90caf9 !important;
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
          overflow: hidden;
          width: 100%;
        }
        .add-cert-table th {
          background-color: #b2ebf2 !important;
          color: black !important;
          font-size: 12px !important;
          padding: 10px 8px !important;
          border-bottom: 1px solid #90caf9 !important;
          border-right: 1px solid #90caf9 !important;
          text-align: center !important;
          font-weight: 600 !important;
          vertical-align: middle !important;
        }
        .add-cert-table td {
          font-size: 12px !important;
          padding: 8px !important;
          border-bottom: 1px solid #90caf9 !important;
          border-right: 1px solid #90caf9 !important;
          text-align: center !important;
          vertical-align: middle !important;
        }
        .add-cert-table th:last-child,
        .add-cert-table td:last-child {
          border-right: none !important;
        }
        .add-cert-table tr:last-child td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

export default HospitalCertificates;
