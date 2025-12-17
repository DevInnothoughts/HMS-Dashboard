// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect, useCallback } from "react";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { decodeJwt } from "../../utils/decode-jwt"; // Assuming this utility is functional
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   InputGroup,
//   Button,
//   Spinner,
// } from "react-bootstrap";
// import FeatherIcon from "feather-icons-react";
// import { Link } from "react-router-dom";
// import NavBarA from "../../components/NavbarA";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "../../styles/styles.css";
// import { FilterMatchMode } from "primereact/api";
// import moment from "moment";

// // --- Configuration ---
// const BASE_URL = "http://localhost:5100/api";

// export default function EnquiryList() {
//   // --- Core State ---
//   const [currentLocation, setCurrentLocation] = useState('default'); // State to hold JWT location
//   const [enquiries, setEnquiries] = useState([]);
//   const [filteredEnquiries, setFilteredEnquiries] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // --- Filter State ---
//   const [fromDate, setFromDate] = useState(moment().startOf('day').toDate());
//   const [toDate, setToDate] = useState(moment().endOf('day').toDate());
//   const [filters1, setFilters1] = useState({
//     global: { value: null, matchMode: FilterMatchMode.CONTAINS },
//   });

//   // ------------------------- JWT & Initial Setup -------------------------
//   useEffect(() => {
//     // Fetches and sets location from the token upon component mount
//     const token = localStorage.getItem('token');
//     if (token) {
//         const payload = decodeJwt(token);
//         if (payload && payload.jobLocation) {
//             setCurrentLocation(payload.jobLocation);
//         }
//     }
//   }, []);

//   // ------------------------- API & Data Fetching -------------------------

//   // Helper to format Date objects to DD-MM-YYYY string for API
//   const formatToDDMMYYYY = (date) => {
//     if (!date) return null;
//     return moment(date).format("DD-MM-YYYY");
//   };

//   const fetchEnquiriesData = useCallback(async () => {
//     // 🛑 Block fetch if location hasn't been determined yet
//     if (currentLocation === 'default') {
//         console.warn("Waiting for location to be set from JWT...");
//         return;
//     }
    
//     setLoading(true);
//     try {
//       let finalFromDate = formatToDDMMYYYY(fromDate);
//       let finalToDate = formatToDDMMYYYY(toDate);

//       // Default to today's date if states are null (though initialized to today)
//       if (!finalFromDate || !finalToDate) {
//         const today = moment().format("DD-MM-YYYY");
//         finalFromDate = today;
//         finalToDate = today;
//       }
      
//       const url = new URL(`${BASE_URL}/V1/enquiry/listEnquiry`);
      
//       // Construct parameters
//       const params = {
//         from: finalFromDate,
//         to: finalToDate,
//         location: currentLocation, // <--- Use the JWT-derived location state
//       };

//       // Append all parameters to the URL
//       Object.keys(params).forEach((key) =>
//         url.searchParams.append(key, params[key])
//       );

//       const response = await fetch(url.toString(), {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//       });

//       const data = await response.json();
//       if (response.ok && Array.isArray(data.data)) {
//         setEnquiries(data.data);
//         setFilteredEnquiries(data.data);
//       } else {
//         console.error("Error fetching enquiries:", data.message || "Unknown error");
//       }
//     } catch (error) {
//       console.error("Error fetching enquiries:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, [fromDate, toDate, currentLocation]); // Re-run fetch on location change

//   // Load data on location/date change
//   useEffect(() => {
//     if (currentLocation !== 'default') {
//         fetchEnquiriesData();
//     }
//   }, [fetchEnquiriesData, currentLocation]);
  
//   // Handle global search input change (using filters1 state)
//   const handleGlobalSearchChange = (e) => {
//     setFilters1({
//         global: {
//           value: e.target.value,
//           matchMode: FilterMatchMode.CONTAINS,
//         },
//     });
//   };

//   // ------------------------- JSX RENDER HELPERS -------------------------

//   const renderHeader = () => (
//     <div
//       style={{
//         border: "2px solid #4dd0e1",
//         textAlign: "center",
//         borderRadius: "12px",
//         padding: "15px",
//         backgroundColor: "#e0f7fa",
//         boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           gap: "20px",
//         }}
//       >
//         {/* Global Search Section */}
//         <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
//           <Form.Group style={{ display: "flex", alignItems: "center", margin: 0 }}>
//             <InputGroup>
//               <Form.Control
//                 type="search"
//                 value={filters1.global.value || ""}
//                 onChange={handleGlobalSearchChange}
//                 placeholder="Global Search"
//                 style={{
//                   borderRadius: "8px",
//                   border: "2px solid #4dd0e1",
//                   padding: "8px 12px",
//                   width: "250px",
//                   fontSize: "14px",
//                   transition: "all 0.3s ease",
//                 }}
//               />
//             </InputGroup>
//           </Form.Group>
//         </div>

//         {/* Date Picker Section */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "15px",
//             border: "2px solid #4dd0e1",
//             borderRadius: "12px",
//             padding: "15px",
//             backgroundColor: "#f5fcfd",
//           }}
//         >
//           {/* From Date Picker */}
//           <div>
//             <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
//               From Date
//             </div>
//             <DatePicker
//               selected={fromDate} 
//               onChange={setFromDate}
//               dateFormat="dd-MM-yyyy"
//               placeholderText="Select from date"
//               customInput={
//                 <Form.Control
//                   style={{
//                     borderRadius: "8px",
//                     border: "2px solid #4dd0e1",
//                     padding: "8px 12px",
//                     width: "160px",
//                     fontSize: "14px",
//                     cursor: "pointer",
//                     backgroundColor: "white",
//                     transition: "all 0.3s ease",
//                   }}
//                 />
//               }
//             />
//           </div>

//           {/* To Date Picker */}
//           <div>
//             <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
//               To Date
//             </div>
//             <DatePicker
//               selected={toDate}
//               onChange={setToDate}
//               dateFormat="dd-MM-yyyy"
//               placeholderText="Select to date"
//               minDate={fromDate}
//               customInput={
//                 <Form.Control
//                   style={{
//                     borderRadius: "8px",
//                     border: "2px solid #4dd0e1",
//                     padding: "8px 12px",
//                     width: "160px",
//                     fontSize: "14px",
//                     cursor: "pointer",
//                     backgroundColor: "white",
//                     transition: "all 0.3s ease",
//                   }}
//                 />
//               }
//             />
//           </div>

//           <Button
//             variant="primary"
//             onClick={fetchEnquiriesData}
//             style={{
//               backgroundColor: "#00bcd4",
//               border: "none",
//               borderRadius: "8px",
//               padding: "8px 20px",
//               fontSize: "14px",
//               fontWeight: "500",
//               color: "white",
//               cursor: "pointer",
//               transition: "all 0.3s ease",
//               boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//               marginTop: "20px",
//             }}
//           >
//             Refresh Data
//           </Button>
//         </div>
//       </div>
//     </div>
//   );

//   const header = renderHeader();

//   return (
//     <div
//       className="themebody-wrap"
//       style={{
//         background: "linear-gradient(to right, #e0f7fa, #80deea)",
//         fontFamily: "'Poppins', Arial, sans-serif",
//         minHeight: "100vh",
//         padding: "20px",
//       }}
//     >
//       {/* Display Location in header */}
//       <NavBarA pagename={`Enquiry List (${currentLocation.toUpperCase()})`} /> 
      
//       <div className="theme-body">
//         <Container fluid>
//           <Row>
//             <Col>
//               <Card
//                 style={{
//                   borderRadius: "12px",
//                   boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
//                   borderColor: "#00bcd4",
//                   background: "white",
//                   border: "4px solid #00bcd4",
//                 }}
//               >
//                 <Card.Body>
//                   {loading ? (
//                     <div className="d-flex justify-content-center py-5" style={{ color: "#00bcd4" }}>
//                       <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
//                     </div>
//                   ) : (
//                     <DataTable
//                       value={filteredEnquiries}
//                       paginator
//                       rows={10}
//                       header={header}
//                       filters={filters1}
//                       globalFilterFields={[
//                         "date",
//                         "patient_name",
//                         "patient_phone",
//                         "patient_location",
//                         "FDE_Name",
//                       ]}
//                       responsiveLayout="scroll"
//                       className="p-datatable-customers"
//                       rowClassName={(rowData, { rowIndex }) => ({
//                         style: {
//                           backgroundColor: rowIndex % 2 === 0 ? "#e0f7fa" : "white",
//                           transition: "background-color 0.3s ease",
//                         },
//                         onMouseOver: (e) => {
//                           e.currentTarget.style.backgroundColor = "#b2ebf2";
//                         },
//                         onMouseOut: (e) => {
//                           e.currentTarget.style.backgroundColor =
//                             rowIndex % 2 === 0 ? "#e0f7fa" : "white";
//                         },
//                       })}
//                       style={{
//                         border: "1px solid #4dd0e1",
//                         marginTop: "5px",
//                         width: "100%",
//                         background: "white",
//                         borderRadius: "8px",
//                         overflow: "hidden",
//                       }}
//                     >
//                       <Column
//                         field="srNo"
//                         header="Sr. No"
//                         body={(rowData, { rowIndex }) => rowIndex + 1}
//                         sortable
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="date"
//                         header="Date"
//                         body={(rowData) => moment(rowData.date).format("DD-MM-YYYY")}
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="patient_name"
//                         header="Patient Name"
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="patient_phone"
//                         header="Contact No"
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="patient_location"
//                         header="Address"
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="enquirytype"
//                         header="Enquiry Type"
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column
//                         field="FDE_Name"
//                         header="FDE Name"
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                       />
//                       <Column 
//                         field="doctorName" 
//                         header="Doctor Name" 
//                         style={{ border: "1px solid #90caf9", textAlign: "center", padding: "0.75rem" }}
//                     />
//                     </DataTable>
//                   )}
//                 </Card.Body>
//               </Card>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </div>
//   );
// }










/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { decodeJwt } from "../../utils/decode-jwt"; // Assuming this utility is functional
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
import FeatherIcon from "feather-icons-react";
import { Link } from "react-router-dom";
import NavBarA from "../../components/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/styles.css";
import { FilterMatchMode } from "primereact/api";
import moment from "moment";

// --- Configuration ---
const BASE_URL = "http://localhost:5100/api";

export default function EnquiryList() {
  // --- Core State ---
  const [currentLocation, setCurrentLocation] = useState('default'); // State to hold JWT location
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- Filter State ---
  const [fromDate, setFromDate] = useState(moment().startOf('day').toDate());
  const [toDate, setToDate] = useState(moment().endOf('day').toDate());
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  // ------------------------- JWT & Initial Setup -------------------------
  useEffect(() => {
    // Fetches and sets location from the token upon component mount
    const token = localStorage.getItem('token');
    if (token) {
        const payload = decodeJwt(token);
        if (payload && payload.jobLocation) {
            setCurrentLocation(payload.jobLocation);
        }
    }
  }, []);

  // ------------------------- API & Data Fetching -------------------------

  // Helper to format Date objects to DD-MM-YYYY string for API
  const formatToDDMMYYYY = (date) => {
    if (!date) return null;
    return moment(date).format("DD-MM-YYYY");
  };

  const fetchEnquiriesData = useCallback(async () => {
    // 🛑 Block fetch if location hasn't been determined yet
    if (currentLocation === 'default') {
        console.warn("Waiting for location to be set from JWT...");
        return;
    }
    
    setLoading(true);
    try {
      let finalFromDate = formatToDDMMYYYY(fromDate);
      let finalToDate = formatToDDMMYYYY(toDate);

      // Default to today's date if states are null (though initialized to today)
      if (!finalFromDate || !finalToDate) {
        const today = moment().format("DD-MM-YYYY");
        finalFromDate = today;
        finalToDate = today;
      }
      
      const url = new URL(`${BASE_URL}/V1/enquiry/listEnquiry`);
      
      // Construct parameters
      const params = {
        from: finalFromDate,
        to: finalToDate,
        location: currentLocation, // <--- Use the JWT-derived location state
      };

      // Append all parameters to the URL
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setEnquiries(data.data);
        setFilteredEnquiries(data.data);
      } else {
        console.error("Error fetching enquiries:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, currentLocation]); // Re-run fetch on location change

  // Load data on location/date change
  useEffect(() => {
    if (currentLocation !== 'default') {
        fetchEnquiriesData();
    }
  }, [fetchEnquiriesData, currentLocation]);
  
  // Handle global search input change (using filters1 state)
  const handleGlobalSearchChange = (e) => {
    setFilters1({
        global: {
          value: e.target.value,
          matchMode: FilterMatchMode.CONTAINS,
        },
    });
  };

  // ------------------------- JSX RENDER HELPERS -------------------------

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
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <Form.Group style={{ display: "flex", alignItems: "center", margin: 0 }}>
            <span
            style={{
                marginRight: "10px", 
                fontSize: "16px", 
                fontWeight: "bold", 
                color: "#333",
                marginBottom:"15px"
            }}
        >
        Search
        </span> 
            <InputGroup>
              <Form.Control
                type="search"
                value={filters1.global.value || ""}
                onChange={handleGlobalSearchChange}
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
          {/* From Date Picker */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
              From Date
            </div>
            <DatePicker
              selected={fromDate} 
              onChange={setFromDate}
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

          {/* To Date Picker */}
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#00838f", marginBottom: "5px" }}>
              To Date
            </div>
            <DatePicker
              selected={toDate}
              onChange={setToDate}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select to date"
              minDate={fromDate}
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
            onClick={fetchEnquiriesData}
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
            }}
          >
            <FeatherIcon icon="refresh-ccw" size={16} className="me-2" />Refresh All Data
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
      {/* Display Location in header */}
      <NavBarA pagename={`Enquiry List (${currentLocation.toUpperCase()})`} /> 
      
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
                    <div className="d-flex justify-content-center py-5" style={{ color: "#00bcd4" }}>
                      <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
                    </div>
                  ) : (
                    <DataTable
                      value={filteredEnquiries}
                      paginator
                      rows={10}
                      header={header}
                      filters={filters1}
                      globalFilterFields={[
                        "date",
                        "patient_name",
                        "patient_phone",
                        "patient_location",
                        "FDE_Name",
                      ]}
                      responsiveLayout="scroll"
                      // --- STYLING CHANGE 1: Added datatable-compact-style class ---
                      className="p-datatable-customers datatable-compact-style" 
                      rowClassName={(rowData, { rowIndex }) => ({
                        style: {
                          backgroundColor: rowIndex % 2 === 0 ? "#e0f7fa" : "white",
                          transition: "background-color 0.3s ease",
                        },
                        onMouseOver: (e) => {
                          e.currentTarget.style.backgroundColor = "#b2ebf2";
                        },
                        onMouseOut: (e) => {
                          e.currentTarget.style.backgroundColor =
                            rowIndex % 2 === 0 ? "#e0f7fa" : "white";
                        },
                      })}
                      style={{
                        border: "1px solid #4dd0e1",
                        marginTop: "5px",
                        width: "100%",
                        background: "white",
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <Column
                        field="srNo"
                        header="Sr. No"
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        sortable
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
                      />
                      <Column
                        field="date"
                        header="Date"
                        body={(rowData) => moment(rowData.date).format("DD-MM-YYYY")}
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
                      />
                      <Column
                        field="patient_name"
                        header="Patient Name"
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
                      />
                      <Column
                        field="patient_phone"
                        header="Contact No"
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
                      />
                      <Column
                        field="patient_location"
                        header="Address"
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center", wordBreak:"break-all" }}
                      />
                      <Column
                        field="enquirytype"
                        header="Enquiry Type"
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center", wordBreak:"break-all" }}
                      />
                      <Column
                        field="FDE_Name"
                        header="FDE Name"
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
                      />
                      <Column 
                        field="doctorName" 
                        header="Doctor Name" 
                        // --- STYLING CHANGE 2: Added headerClassName and removed padding from style ---
                        headerClassName="datatable-header-center"
                        style={{ border: "1px solid #90caf9", textAlign: "center" }}
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