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
import FeatherIcon from "feather-icons-react";
import { Link, useNavigate } from "react-router-dom";
import NavBarA from "../componets/NavbarA";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/styles.css"; // Add this import at the top
import { FilterMatchMode } from "primereact/api";
import logo from "../assets/images/3.png";
import labLogo from "../assets/images/1.png";
import pharmacyLogo from "../assets/images/2.png";
import receiptLogo from "../assets/images/4.png";
// import receiptLogo from "../assets/images/4.png";
const BASE_URL = "http://192.168.1.46:5000/api";

export default function ReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appointment, setAppointmentData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed"); // Default to fixed
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [filters1, setFilters1] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [selectedReceipt, setSelectedReceipt] = useState([]);

  // // Fetch patients data
  // const fetchAppointmentData = async (withFilters = false) => {
  //   setLoading(true);
  //   try {
  //     const url = new URL(`${BASE_URL}/V1/appointment/listAppointments`);

  //     console.log(" Request URL:", url.toString());

  //     const response = await fetch(url, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       console.log(" Fetched Data:", data.data);
  //       setAppointmentData(data.data);
  //     } else {
  //       console.error(
  //         " Error fetching appointments:",
  //         data.message || "Unknown error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error(" Error fetching appointments:", error);
  //     alert("Error fetching appointments: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAppointmentData();
  // }, []);

  // Fetch enquiries data
  // Format date to YYYY-MM-DD
  const formatToDDMMYYYY = (date) => {
    let d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatToYYYYMMDD = (date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchReceiptsData = async (withFilters = false) => {
    setLoading(true);
    try {
      const url = new URL(`${BASE_URL}/V1/appointment/listReceipt`);
      const today = new Date();

      // // Convert date to UTC and format as DD/MM/YYYY
      // const formatToDDMMYYYY = (date) => {
      //   let d = new Date(date);
      //   return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
      //     d.getUTCMonth() + 1
      //   ).padStart(2, "0")}/${d.getUTCFullYear()}`;
      // };

      let finalFromDate = fromDate
        ? formatToYYYYMMDD(new Date(fromDate))
        : formatToYYYYMMDD(today);
      let finalToDate = toDate
        ? formatToYYYYMMDD(new Date(toDate))
        : formatToYYYYMMDD(today);

      console.log("📅 Final From Date (Frontend):", finalFromDate);
      console.log("📅 Final To Date (Frontend):", finalToDate);

      const params = {
        from: finalFromDate,
        to: finalToDate,
      };

      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key])
      );

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        const result = Array.isArray(data.data) ? data.data : [];
        setReceipts(result);
        setFilteredReceipts(result); // Initialize filtered data
        console.log("📥 Fetched Data:", data.data);
      } else {
        console.error(
          "❌ Error fetching receipts:",
          data.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("❌ Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load default data on component mount
  useEffect(() => {
    fetchReceiptsData(); // Fetch data for current date by default
  }, [fromDate, toDate]);

  const handlePrintReceipt = (selectedReceipt) => {
    if (!selectedReceipt) {
      alert("No receipt selected for printing.");
      return;
    }

    const receiptWindow = window.open("", "_blank", "width=800,height=800");
    if (!receiptWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    const numberToWords = (num) => {
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];

      if (num === 0) return "Zero";

      const toWords = (n) => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10];
        if (n < 1000)
          return ones[Math.floor(n / 100)] + " Hundred " + toWords(n % 100);
        return toWords(Math.floor(n / 1000)) + " Thousand " + toWords(n % 1000);
      };

      return toWords(num);
    };

    const getBase64Image = (imgUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (error) {
            console.error("Error generating base64 image:", error);
            resolve("");
          }
        };
        img.onerror = (error) => {
          console.error("Image loading error:", error);
          resolve("");
        };
        img.src = imgUrl;
      });
    };

    Promise.all([
      getBase64Image(logo),
      getBase64Image(labLogo),
      getBase64Image(pharmacyLogo),
      getBase64Image(receiptLogo),
    ])
      .then(
        ([mainLogo, labLogoBase64, pharmacyLogoBase64, receiptLogoBase64]) => {
          let amountInWords;
          try {
            amountInWords = numberToWords(Math.round(selectedReceipt.totalamt));
          } catch (error) {
            console.error("Error converting number to words:", error);
            amountInWords = "Error in conversion";
          }
          const receiptContent = `
      <html>
  <head>
    <title>Receipt - Healing Hands</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <style>
      body, table, tr, td, p {
        font-size: 13px !important;
        margin: 0;
        padding: 0;
      }
      .bgdiv {
        background: #2b9163;
        padding: 15px;
      }
      .maindiv {
        background: white;
        border: 1px solid white;
        border-radius: 15px;
        padding: 10px;
      }
      .HHClogo {
        width: 100%;
        border-right: dotted;
        border-color: #ccc;
        padding-right: 20px;
      }
      .Lablogo, .Medicologo {
        width: 50%;
      }
      .receipt {
        width: 80%;
        height: 380px;
      }
      .fa-phone {
        padding: 3px 4px;
        border: 1px solid grey;
        border-radius: 50%;
      }
      .amount-box-container {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-start;
      }
      .amount-box {
        border: 1px solid #ccc;
        padding: 10px;
        width: 180px;
        text-align: center;
        background-color: #f9f9f9;
      }
         /* Print button styling */
            .print-btn {
              display: block;
              width: 20%;
              padding: 10px;
              background-color: #2b9163;
              color: white;
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              border: none;
              border-radius: 5px;
              margin-top: 10px; 
            }
      @media print {
      .print-btn {
      display: none;
        .bgdiv {
          background-color: #2b9163 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="bgdiv">
      <div class="maindiv">
        <table width='100%' border='0'>
          <tr>
            <td style="width:30%;"><img src="${mainLogo}" class="HHClogo"></td>
            <td style="width:15%; text-align:right;"><img src="${labLogoBase64}" class="Lablogo"></td>
            <td style="width:15%; text-align:center;"><img src="${pharmacyLogoBase64}" class="Medicologo"></td>
            <td style="width:40%;">
              <table width='100%' border='0'>
                <tr>
                  <td>Receipt No. &nbsp;&nbsp;<b>${selectedReceipt.receipt_id}</b></td>
                </tr>
                <tr>
                  <td>Date : &nbsp;&nbsp;<b>${selectedReceipt.receipt_date}</b></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <br>
        <table width='100%' border='0'>
          <tr>
            <td style="width:15%;"><img src="${receiptLogoBase64}" class="receipt"></td>
            <td style="width:85%;">
              <table width='100%' border='0'>
                <tr>
                  <td style="width:30%; line-height:40px;">Received From : </td>
                  <td>
                    <p style="border-bottom: dotted; border-color: #ccc; font-weight: 600; text-transform: uppercase;">
                      ${selectedReceipt.patientName}
                    </p>
                  </td>
                </tr>
              </table>
              <table width='100%' border='0'>
                <tr>
                  <td>
                    For <span style="font-weight:600; text-transform:uppercase; border-bottom: dotted; border-color: #ccc;">
                      ${selectedReceipt.consultation}
                    </span>
                  </td>
                </tr>
              </table>
              <table width='100%' border='0'>
                <tr>
                  <td style="line-height:40px;">
                    <i class="fa fa-phone"></i>&nbsp;8888288884&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;020 - 26164488/99
                  </td>
                </tr>
              </table>
              <table width='100%' border='0'>
                <tr>
                  <td>
                    Email: info@healinghandsclinic.co.in
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    Website: www.healinghandsclinic.co.in
                  </td>
                </tr>
              </table>
              <br>
              <table width='100%' border='0'>
                <tbody>
                  <tr>
                    <td style="width:60%; vertical-align: top;">
                      Payment Mode: &nbsp;<b>${selectedReceipt.paymentmode}</b><br>
                      In Words: &nbsp;<b>${amountInWords}</b><br><br>
                      <b>Next Appointment: </b>No appointment scheduled<br>
                      <b>Dhole Patil Road: </b><br>
                    Healing Hands Clinic Pvt Ltd<br>
                    DP Road, Ground Floor, Millenium Star Extension,<br>
                    Adjacent to Ruby Hall Clinic, Pune 411001
                    </td>
                    <td style="width:40%; vertical-align: top;">
                       <div class="amount-box-container">
                          <div class="amount-box"><b>Total:</b> Rs. ${selectedReceipt.totalamt}/-</div>
                          <div class="amount-box"><b>Discount:</b> Rs. ${selectedReceipt.discountamt}/-</div>
                       </div>
                      </td>
                  </tr>
                </tbody>
              </table>
              <table width='100%' border='0'>
                <tr>
                  <td style="width:100%;" colspan="3">
                    <br><br>
                    <p>
                      In case you have not received the correct receipt for the paid amount, or for any discrepancies in the transaction,
                      please write to us at 
                      <a href="mailto:info@healinghandsclinic.co.in" style="color:grey;">info@healinghandsclinic.co.in</a> 
                      or WhatsApp at 
                      <a href="https://wa.me/+918888988882?text=Hello Doctor, I would like to know more about your treatments" target="_blank" style="color:grey;">
                        +91 8888988882
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
                <!-- Print Button -->
            <button class="print-btn" onclick="window.print()">Print</button>
    <div style="clear:both; color:#aaa; padding:20px;">
      <hr />
      <center>&copy;2025 <a target="_blank" href="http://www.innothoughts.com/" style="color:grey;">Innothoughts System Pvt. Ltd</a></center>
    </div>
  </body>
</html>
    `;

          setTimeout(() => {
            receiptWindow.document.write(receiptContent);
            receiptWindow.document.close();
          }, 500);
        }
      )
      .catch((error) => console.error("Error loading images:", error));
  };

  const sendMail = (receipt) => {};

  const actionBodyTemplate = (receipt) => (
    <div
      className="cart-action"
      style={{ margin: "5px", display: "flex", gap: "5px" }}
    >
      <Link
        onClick={() => sendMail(receipt)}
        className="mail"
        to=""
        style={{
          width: "35px", // Slightly reduce the width
          height: "35px", // Slightly reduce the height
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%", // Circular shape
          padding: "0", // Remove default padding
        }}
        title="Mail" // Tooltip text on hover
      >
        <FeatherIcon icon="mail" className="w-18" />
      </Link>
      <Link
        onClick={() => handlePrintReceipt(receipt)}
        className="print"
        to=""
        style={{
          width: "35px",
          height: "35px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          padding: "0",
        }}
        title="Print"
      >
        <FeatherIcon icon="printer" className="w-18" />
      </Link>
    </div>
  );

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

          {/* <Button
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
        </Button> */}
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
      <NavBarA pagename="Receipt List" />
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
                      value={filteredReceipts} // Use filtered data
                      paginator
                      rows={10}
                      header={header}
                      globalFilter={filters1.global.value}
                      globalFilterFields={[
                        "receipt_id",
                        "receipt_date",
                        "patientName",
                        "consultation",
                        "doctorName",
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
                        body={(rowData, { rowIndex }) => rowIndex + 1}
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="receipt_id"
                        header="Receipt ID"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="receipt_date"
                        header="Date"
                        sortable
                        body={(rowData) =>
                          formatToDDMMYYYY(new Date(rowData.receipt_date))
                        }
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="patientName"
                        header="Patient Name"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="consultation"
                        header="Consultation"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        field="doctorName"
                        header="Doctor"
                        sortable
                        style={{
                          border: "1px solid #90caf9",
                          textAlign: "center",
                          padding: "0.75rem",
                        }}
                      />
                      <Column
                        header="Actions"
                        body={actionBodyTemplate}
                        exportable={false}
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
