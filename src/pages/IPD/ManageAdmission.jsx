import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { decodeJwt } from "../../utils/decode-jwt";

const BASE_URL = "http://localhost:5100/api";

export default function ManageAdmission() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLocation, setCurrentLocation] = useState("default");

  // 1. Initialize Location from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.jobLocation) {
        setCurrentLocation(payload.jobLocation);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // 2. Fetch Logic
  // const fetchVerifiedPatients = useCallback(async () => {
  //     if (currentLocation === "default") return;

  //     setLoading(true);
  //     try {
  //         const response = await fetch(`${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}`, {
  //             method: "GET",
  //             headers: {
  //                 "Content-Type": "application/json",
  //                 "Authorization": `Bearer ${localStorage.getItem("token")}`
  //             }
  //         });

  //         if (response.ok) {
  //             const result = await response.json();
  //             console.log(result);
  //             // Map API data to your component's expected structure
  //             const formattedData = result.map(p => ({
  //                 uhid: p.uid,
  //                 name: p.name,
  //                 contact: p.patient_phone,
  //                 age: p.age,
  //                 gender: p.sex,
  //                 verifiedDate: formatDate(p.created_at),
  //                 admissionNo: (p.admission_no === 0 || p.admission_no === "0") ? null : p.admission_no,
  //                 patient_id: p.patient_id,
  //                 global_id: p.global_id
  //             }));
  //             console.log(formattedData);
  //             setPatients(formattedData);
  //         } else {
  //             console.error("Failed to fetch verified patients");
  //         }
  //     } catch (error) {
  //         console.error("Error fetching data:", error);
  //     } finally {
  //         setLoading(false);
  //     }
  // }, [currentLocation]);

  const fetchVerifiedPatients = useCallback(async () => {
    if (currentLocation === "default") return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/V1/ipd/admin/listVerifiedPatients?location=${currentLocation}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();

        // 1. Sort the raw data by date (Descending: Newest first)
        const sortedData = result.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        // 2. Map the sorted data to your formatted structure
        const formattedData = sortedData.map((p) => ({
          uhid: p.uid,
          name: p.name,
          contact: p.patient_phone,
          age: p.age,
          gender: p.sex,
          verifiedDate: formatDate(p.created_at), // Using the formatter from previous step
          admissionNo:
            p.admission_no === 0 || p.admission_no === "0"
              ? null
              : p.admission_no,
          patient_id: p.patient_id,
          global_id: p.global_id,
        }));

        setPatients(formattedData);
      } else {
        console.error("Failed to fetch verified patients");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchVerifiedPatients();
  }, [fetchVerifiedPatients]);

  // 3. Search Filtering
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uhid.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirm = (uhid) => {
    Swal.fire({
      title: "Confirm Admission?",
      text: "This will move the patient to the surgery list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#15ab56ff",
      cancelButtonColor: "#dc1818ff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Call backend to update status and generate Admission No
          const response = await fetch(
            `${BASE_URL}/V1/ipd/admin/confirmAdmissionEntry`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uhid, location: currentLocation }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            console.log(data);
            Swal.fire(
              "Confirmed!",
              `Admission No: ${data.admissionNo} generated.`,
              "success",
            );
            fetchVerifiedPatients(); // Refresh the list
          }
        } catch (error) {
          Swal.fire("Error", "Could not confirm admission", "error");
        }
      }
    });
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "15px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Manage Admission" />

      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "15px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
                  border: "none",
                  background: "white",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#67c5cfff",
                    padding: "12px 15px",
                    borderBottom: "2px solid #1a5b61ff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <FeatherIcon
                      icon="users"
                      size="18"
                      style={{ color: "#1a5b61ff", marginRight: "10px" }}
                    />
                    <h4
                      className="m-0"
                      style={{
                        color: "#1a5b61ff",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                      }}
                    >
                      Verified Patients Queue
                    </h4>
                  </div>
                  <div style={{ width: "350px" }}>
                    <InputGroup size="sm">
                      <InputGroup.Text
                        style={{
                          backgroundColor: "#fff",
                          borderRight: "none",
                          borderRadius: "8px 0 0 8px",
                        }}
                      >
                        <FeatherIcon
                          icon="search"
                          size={14}
                          className="text-muted"
                        />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search by name or UHID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      />
                    </InputGroup>
                  </div>
                </div>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                      <p className="mt-2 text-muted">Loading queue...</p>
                    </div>
                  ) : (
                    <Table responsive hover className="mb-0">
                      <thead
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderBottom: "2px solid #e9ecef",
                        }}
                      >
                        <tr>
                          <th className="py-3 px-4 border-0 uppercase fw-bold">
                            Verified Date
                          </th>
                          <th className="py-3 px-4 border-0 uppercase fw-bold">
                            UHID
                          </th>
                          <th className="py-3 px-4 border-0 uppercase fw-bold">
                            Patient Name
                          </th>
                          <th className="py-3 px-4 border-0 uppercase fw-bold">
                            Age/Gender
                          </th>
                          <th className="py-3 px-4 border-0 uppercase fw-bold">
                            Contact
                          </th>
                          <th className="py-3 px-4 border-0 text-center uppercase fw-bold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map((patient, index) => (
                            <tr
                              key={index}
                              style={{
                                verticalAlign: "middle",
                                fontSize: "0.9rem",
                              }}
                            >
                              <td className="py-3 px-4">
                                {patient.verifiedDate || "N/A"}
                              </td>
                              <td
                                className="py-3 px-4 fw-bold"
                                style={{ color: "#178aaeff" }}
                              >
                                {patient.uhid}
                              </td>
                              <td className="py-3 px-4">{patient.name}</td>
                              <td className="py-3 px-4">
                                {patient.age} / {patient.gender}
                              </td>
                              <td className="py-3 px-4">{patient.contact}</td>
                              <td className="py-3 px-4">
                                <div className="d-flex justify-content-center gap-2">
                                  {patient.admissionNo ? (
                                    <Badge
                                      bg="success"
                                      style={{
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <FeatherIcon
                                        icon="check-circle"
                                        size={14}
                                        className="me-2"
                                      />
                                      {patient.admissionNo}
                                    </Badge>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        style={{
                                          borderRadius: "6px",
                                          fontWeight: "600",
                                          margin: "3px",
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() =>
                                          handleConfirm(patient.uhid)
                                        }
                                        style={{
                                          borderRadius: "6px",
                                          fontWeight: "600",
                                        }}
                                      >
                                        Confirm Admission
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-5 text-muted"
                            >
                              <FeatherIcon
                                icon="info"
                                size={40}
                                className="mb-3 opacity-20"
                              />
                              <p className="m-0">No verified patients found.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
