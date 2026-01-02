import React, { useState } from "react";
import PageBreadcrumb from "../../componets/PageBreadcrumb";
import { Row, Col, Card, Container, Form, Button } from "react-bootstrap";
import SimpleBar from "simplebar-react";
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import styles

const BASE_URL = "http://localhost:5100/api";

const styles = {
  themebodyWrap: {
    background: "linear-gradient(to right, #e0f7fa, #80deea)",
    fontFamily: "'Poppins', Arial, sans-serif",
    minHeight: "100vh",
    padding: "85px",
    marginTop: "20px",
    marginLeft: "200px",
  },
  card: {
    borderRadius: "12px",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
    borderColor: "#00bcd4",
    background: "white",
    border: "1px solid #00bcd4",
    marginTop: "20px",
    marginLeft: "200px",
    width: "1000px",
  },
  cardHeader: {
    fontWeight: "bold",
    backgroundColor: "#e3f2fd",
    borderBottom: "2px solid #0288d1",
    padding: "1rem",
    background: "linear-gradient(to right, #00acc1, #007c91)",
    color: "white",
    fontSize: "16px",
  },
  cardBody: {
    padding: "30px",
    backgroundColor: "white",
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: "20px",
    padding: "20px 0",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "300px",
  },
  label: {
    color: "#006064",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    height: "40px",
    padding: "8px 12px",
    border: "2px solid #E0F7FA",
    borderRadius: "8px",
    backgroundColor: "#F8FDFE",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#0D47A1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 30px",
    height: "40px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    minWidth: "120px",
  },
  statsSection: {
    backgroundColor: "#F8FDFE",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "30px",
  },
  statsHeader: {
    color: "#666",
    fontSize: "18px",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    textAlign: "center",
  },
  statItem: {
    flex: 1,
    padding: "15px",
  },
  statLabel: {
    color: "#333",
    fontSize: "16px",
    marginBottom: "10px",
  },
  statValue: {
    color: "#666",
    fontSize: "20px",
  },
};

const EnquiryData = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      name: "Sr.No",
      selector: (row) => row.srNo || "",
      sortable: true,
      width: "80px",
    },
    {
      name: "Date",
      selector: (row) => {
        if (row.date) {
          const date = new Date(row.date);
          return date.toLocaleDateString("en-GB");
        }
        return "";
      },
      sortable: true,
      width: "120px",
    },
    {
      name: "Patient Name",
      selector: (row) => row.patient_name || "",
      sortable: true,
      wrap: true,
    },
    {
      name: "Patient Phone",
      selector: (row) => row.patient_phone || "",
      sortable: true,
      width: "150px",
    },
    {
      name: "Enquiry Type",
      selector: (row) => row.enquirytype || "",
      sortable: true,
      wrap: true,
    },
    {
      name: "Location",
      selector: (row) => row.patient_location || "",
      sortable: true,
      wrap: true,
    },
    {
      name: "Reference",
      selector: (row) => row.reference || "",
      sortable: true,
      width: "150px",
    },
    {
      name: "FDE Name",
      selector: (row) => row.FDE_Name || "",
      sortable: true,
      width: "150px",
    },
    {
      name: "Note",
      selector: (row) => row.note || "",
      sortable: true,
      wrap: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#ffffff",
      },
    },
    rows: {
      style: {
        minHeight: "50px",
        "&:nth-child(odd)": {
          backgroundColor: "#f8f9fa",
        },
      },
    },
    headRow: {
      style: {
        backgroundColor: "#e9ecef",
        fontWeight: "bold",
      },
    },
  };

  const handleFind = async (e) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      alert("Please Enter all fields details..");
      return;
    }

    try {
      const formatDateForBackend = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formattedFromDate = formatDateForBackend(fromDate);
      const formattedToDate = formatDateForBackend(toDate);

      const response = await fetch(
        `${BASE_URL}/V1/enquiry/listEnquiry?from=${formattedFromDate}&to=${formattedToDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${errorData.message || "Unknown error"}`
        );
      }

      const responseData = await response.json();

      // Extract the data array from the response
      const data = responseData.data || [];

      // Format the data for display
      const formattedData = data.map((item, index) => ({
        ...item,
        srNo: index + 1, // Add sequential numbering
        date: item.date ? new Date(item.date).toLocaleDateString("en-GB") : "",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString("en-GB")
          : "",
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toLocaleString("en-GB")
          : "",
      }));

      setTableData(formattedData);

      if (formattedData.length === 0) {
        alert("No records found for the selected date range");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Failed to fetch data: ${error.message}`);
      setTableData([]);
    }
  };

  const filteredData = tableData.filter((item) => {
    const searchStr = searchText.toLowerCase();
    return (
      (item.patient_name &&
        item.patient_name.toLowerCase().includes(searchStr)) ||
      (item.patient_phone &&
        item.patient_phone.toString().includes(searchStr)) ||
      (item.enquirytype &&
        item.enquirytype.toLowerCase().includes(searchStr)) ||
      (item.patient_location &&
        item.patient_location.toLowerCase().includes(searchStr)) ||
      (item.FDE_Name && item.FDE_Name.toLowerCase().includes(searchStr)) ||
      (item.note && item.note.toLowerCase().includes(searchStr))
    );
  });

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "enquiry_report" + fileExtension);
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        padding: "20px",
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        fontFamily: "'Poppins', Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <PageBreadcrumb pagename="Enquiry Data Report" />
      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <Row>
            <Col md={12}>
              <Card
                style={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                  borderColor: "#00bcd4",
                  background: "white",
                  border: "4px solid #00bcd4",
                }}
              >
                <Card.Header
                  className="text-center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "22px",
                    background: "#00acc1",
                    color: "white",
                  }}
                >
                  <h4>Enquiry Data Report</h4>
                </Card.Header>
                <Card.Body style={styles.cardBody}>
                  <Form onSubmit={handleFind} className="mb-4">
                    <Row className="align-items-end">
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <b>From Date</b>
                          </Form.Label>
                          <DatePicker
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select From Date"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <b>To Date</b>
                          </Form.Label>
                          <DatePicker
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            placeholderText="Select To Date"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <button
                            className="btn btn-primary"
                            type="submit"
                            style={{
                              marginTop: "30px",
                              height: "55px",
                              width: "50%",
                              backgroundColor: "#00acc1",
                              borderColor: "#00bcd4",
                              color: "white",
                              cursor: "pointer",
                              borderRadius: "8px",
                              transition: "0.3s all",
                              fontWeight: "bold",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = "#007c91";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = "#00acc1";
                            }}
                          >
                            Find
                          </button>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginRight: "10px" }}>Show</span>
                          <select
                            style={{
                              padding: "5px",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                          </select>
                          <span style={{ marginLeft: "10px" }}>entries</span>
                        </div>
                        <div>
                          <button
                            onClick={exportToExcel}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Excel
                          </button>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              width: "200px",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Form>
                  <DataTable
                    columns={columns}
                    data={filteredData}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                    highlightOnHover
                    striped
                    responsive
                    customStyles={customStyles}
                    noDataComponent={
                      <div style={{ padding: "24px" }}>
                        No records found. Please select date range and click
                        Find to view data.
                      </div>
                    }
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </SimpleBar>
    </div>
  );
};

export default EnquiryData;
