import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import NavBarA from "../componets/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FilterMatchMode } from "primereact/api";
import "../styles/styles.css"; // Add this import at the top
const BASE_URL = "http://194.195.117.79:5000/api";

export default function EnquiryList() {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  // Fetch enquiries data
  const fetchEnquiriesData = async (withFilters = false) => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/enquiry/listEnquiry`);
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

      if (withFilters && fromDate && toDate) {
        const params = {
          from: fromDate.split("-").reverse().join("/"),
          to: toDate.split("-").reverse().join("/"),
        };
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      } else {
        // Default filter for current date
        const params = {
          from: today.split("-").reverse().join("/"),
          to: today.split("-").reverse().join("/"),
        };
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        const result = Array.isArray(data.data) ? data.data : [];
        setEnquiries(result);
        setFilteredEnquiries(result); // Initialize filtered data
      } else {
        console.error(
          "Error fetching enquiries:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load default data on component mount
  useEffect(() => {
    fetchEnquiriesData(); // Fetch data for current date by default
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filteredData = enquiries.filter((enquiry) =>
      Object.values(enquiry).some(
        (field) =>
          typeof field === "string" && field.toLowerCase().includes(value)
      )
    );

    setFilteredEnquiries(filteredData); // Update filtered data
  };

  // DatePicker for From Date
  // const handleFromDateChange = (date) => {
  //   if (date) {
  //     const formattedDate = date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
  //     console.log("Selected From Date:", formattedDate); // Debugging log
  //     setFromDate(formattedDate);
  //     // Optionally, reset toDate if it's before fromDate
  //     if (toDate && new Date(formattedDate) > new Date(toDate)) {
  //       setToDate(null); // Reset toDate if it's before fromDate
  //     }
  //   }
  // };

  // DatePicker for To Date
  // const handleToDateChange = (date) => {
  //   if (date) {
  //     const formattedDate = date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
  //     console.log("Selected To Date:", formattedDate); // Debugging log
  //     setToDate(formattedDate);
  //   }
  // };

  const renderHeader = () => (
    <div
      style={{
        border: "2px solid #4dd0e1",
        textAlign: "center",
        borderRadius: "12px",
        padding: "15px",
        backgroundColor: "#e0f7fa",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Global Search Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <Form.Group
            style={{
              display: "flex",
              alignItems: "center",
              margin: 0,
            }}
          >
            <InputGroup>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={(e) =>
                  setFilters1({
                    global: {
                      value: e.target.value,
                      matchMode: FilterMatchMode.CONTAINS,
                    },
                  })
                }
                placeholder="Global Search"
                style={{
                  borderRadius: "8px",
                  border: "2px solid #4dd0e1",
                  padding: "8px 12px",
                  width: "250px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
              />
            </InputGroup>
          </Form.Group>
        </div>

        {/* Date Picker Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            border: "2px solid #4dd0e1",
            borderRadius: "12px",
            padding: "15px",
            backgroundColor: "#f5fcfd",
          }}
        >
          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
              }}
            >
              From Date
            </div>
            <DatePicker
              selected={fromDate ? new Date(fromDate + "T00:00:00") : null}
              onChange={(date) => {
                if (date) {
                  // Adjust for timezone offset
                  const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  );
                  const formattedDate = localDate.toISOString().split("T")[0];
                  setFromDate(formattedDate);
                  console.log("From Date Selected:", formattedDate);
                } else {
                  setFromDate(null);
                }
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select from date"
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
            />
          </div>

          <div
            style={{
              margin: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#00838f",
                marginBottom: "5px",
              }}
            >
              To Date
            </div>
            <DatePicker
              selected={toDate ? new Date(toDate + "T00:00:00") : null}
              onChange={(date) => {
                if (date) {
                  // Adjust for timezone offset
                  const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  );
                  const formattedDate = localDate.toISOString().split("T")[0];
                  setToDate(formattedDate);
                  console.log("To Date Selected:", formattedDate);
                } else {
                  setToDate(null);
                }
              }}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate ? new Date(fromDate + "T00:00:00") : null}
              customInput={
                <Form.Control
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #4dd0e1",
                    padding: "8px 12px",
                    width: "160px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                />
              }
            />
          </div>

          <Button
            variant="primary"
            onClick={() => fetchEnquiriesData(true)}
            style={{
              backgroundColor: "#00bcd4",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "20px",
              ":hover": {
                backgroundColor: "#00acc1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              },
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );

  const header = renderHeader();

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <NavBarA pagename="Enquiry List" />
      <div className="theme-body">
        <Container fluid>
          <Row>
            <Col>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Body>
                  {loading ? (
                    <div
                      className="d-flex justify-content-center py-5"
                      style={{ color: "#00bcd4" }}
                    >
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={filteredEnquiries} // Use filtered data
                      paginator
                      rows={10}
                      header={header}
                      globalFilter={filters1.global.value} // Add this line to apply global filter
                      globalFilterFields={[
                        "date",
                        "patient_name",
                        "patient_phone",
                        "patient_location",
                        "FDE_Name",
                      ]}
                      responsiveLayout="scroll"
                      className="p-datatable-customers"
                      rowClassName={(rowData, { rowIndex }) => ({
                        style: {
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white", // Alternating colors
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2"; // Hover effect
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white"; // Revert on mouse out
                        },
                      })}
                      style={{
                        border: "1px solid #4dd0e1",
                        marginTop: "20px",
                        width: "100%",
                        background: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Column
                        field="srNo"
                        header="Sr. No"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="date"
                        header="Date"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patient_name"
                        header="Patient Name"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patient_phone"
                        header="Contact No"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patient_location"
                        header="Address"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="enquirytype"
                        header="Enquiry Type"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="FDE_Name"
                        header="FDE Name"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                    </DataTable>
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
