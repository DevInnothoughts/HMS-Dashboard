import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Tabs,
  Tab,
  Alert,
  InputGroup,
} from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../components/PageBreadcrumb";
import Swal from "sweetalert2";
import { decodeJwt } from "../utils/decode-jwt";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const BASE_URL = "http://localhost:5100/api";

const DailyClosing = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("");
  const [receiptsList, setReceiptsList] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [pharmacySystemCash, setPharmacySystemCash] = useState(0);
  const [ipdSystemCash, setIpdSystemCash] = useState(0);

  const [cashDepositFile, setCashDepositFile] = useState(null);
  const [cardSettlementFile, setCardSettlementFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
    }
  }, []);

  const [formData, setFormData] = useState({
    opdCash: "",
    ipdCash: "",
    pharmacyCash: "",
    upiSettlement: "",
    cardSettlement: "",
    bankDeposit: "",
    comment: "",
    cashDepositReceipt: "",
    cardSettlementSlip: "",
  });

  const fetchTodayReceipts = async (dateStr, loc) => {
    if (!loc || loc === "default") return;
    setReceiptsLoading(true);
    try {
      const [dd, mm, yyyy] = dateStr.split("-");
      const entryDate = `${yyyy}-${mm}-${dd}`;
      const url = `${BASE_URL}/V1/appointment/listReceipt?from=${entryDate}&to=${entryDate}&location=${loc}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setReceiptsList(data.data);
      } else {
        console.error(
          "Failed to load receipts for reconciliation:",
          data.message,
        );
        setReceiptsList([]);
      }

      // Fetch Daily OPD Report for Pharmacy Cash
      const opdReportUrl = `${BASE_URL}/V1/daily-opd-report?location=${loc}&date=${entryDate}`;
      const opdReportResponse = await fetch(opdReportUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const opdReportResult = await opdReportResponse.json();
      if (opdReportResponse.ok && opdReportResult.statusCode === 200) {
        const pharmacyColl =
          opdReportResult.description?.pharmacyCollection || [];
        const cashRow = pharmacyColl.find((item) => item[0] === "Cash");
        const cashAmt = cashRow ? Number(cashRow[1]) : 0;
        setPharmacySystemCash(cashAmt);
      } else {
        setPharmacySystemCash(0);
      }

      // Fetch IPD payments report for IPD Cash reconciliation
      const ipdReportUrl = `${BASE_URL}/V1/managereports/getIPDPaymentReport`;
      const ipdReportResponse = await fetch(ipdReportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          location: loc,
          Fromdate: entryDate,
          Todate: entryDate,
        }),
      });
      const ipdReportResult = await ipdReportResponse.json();
      if (ipdReportResponse.ok && Array.isArray(ipdReportResult)) {
        const ipdCashSum = ipdReportResult.reduce(
          (sum, item) => sum + Number(item.cashamt || 0),
          0,
        );
        setIpdSystemCash(ipdCashSum);
      } else {
        setIpdSystemCash(0);
      }

      // Fetch Daily Closing Status from Backend database
      const closingStatusUrl = `${BASE_URL}/V1/managereports/dailyclosing-status?location=${loc}&date=${entryDate}`;
      const closingStatusResponse = await fetch(closingStatusUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (closingStatusResponse.ok) {
        const closingStatusResult = await closingStatusResponse.json();
        if (closingStatusResult.success && closingStatusResult.data) {
          const dbData = closingStatusResult.data;
          const updatedData = {
            opdCash:
              dbData.opdcash !== null && dbData.opdcash !== undefined
                ? String(dbData.opdcash)
                : "",
            ipdCash:
              dbData.ipdcash !== null && dbData.ipdcash !== undefined
                ? String(dbData.ipdcash)
                : "",
            pharmacyCash:
              dbData.pharmacycash !== null && dbData.pharmacycash !== undefined
                ? String(dbData.pharmacycash)
                : "",
            upiSettlement:
              dbData.upiamt !== null && dbData.upiamt !== undefined
                ? String(dbData.upiamt)
                : "",
            cardSettlement:
              dbData.cardamt !== null && dbData.cardamt !== undefined
                ? String(dbData.cardamt)
                : "",
            bankDeposit:
              dbData.bankdeposit !== null && dbData.bankdeposit !== undefined
                ? String(dbData.bankdeposit)
                : "",
            comment: dbData.comment || "",
            cashDepositReceipt: dbData.cash_deposit_receipt || "",
            cardSettlementSlip: dbData.card_settlement_slip || "",
          };
          setFormData(updatedData);
          setIsSubmitted(true);
          // Sync to localStorage
          localStorage.setItem(
            "hms_daily_closing",
            JSON.stringify({
              date: dateStr,
              data: updatedData,
            }),
          );
        } else {
          setIsSubmitted(false);
          const savedData = localStorage.getItem("hms_daily_closing");
          let shouldUseLocal = false;
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.date === dateStr) {
              shouldUseLocal = true;
            }
          }
          if (!shouldUseLocal) {
            setFormData({
              opdCash: "",
              ipdCash: "",
              pharmacyCash: "",
              upiSettlement: "",
              cardSettlement: "",
              bankDeposit: "",
              comment: "",
              cashDepositReceipt: "",
              cardSettlementSlip: "",
            });
            setCashDepositFile(null);
            setCardSettlementFile(null);
          }
        }
      }
    } catch (error) {
      console.error(
        "Error fetching receipts/reports for reconciliation:",
        error,
      );
      setReceiptsList([]);
      setPharmacySystemCash(0);
      setIpdSystemCash(0);
    } finally {
      setReceiptsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;
    setCurrentDate(dateStr);

    // Check for existing submission for today
    const savedData = localStorage.getItem("hms_daily_closing");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.date === dateStr) {
        setFormData({
          opdCash: parsed.data.opdCash || "",
          ipdCash: parsed.data.ipdCash || "",
          pharmacyCash: parsed.data.pharmacyCash || "",
          upiSettlement: parsed.data.upiSettlement || "",
          cardSettlement: parsed.data.cardSettlement || "",
          bankDeposit: parsed.data.bankDeposit || "",
          comment: parsed.data.comment || "",
          cashDepositReceipt: parsed.data.cashDepositReceipt || "",
          cardSettlementSlip: parsed.data.cardSettlementSlip || "",
        });
        setIsSubmitted(true);
      } else {
        // It's a new day, clear old data
        localStorage.removeItem("hms_daily_closing");
        setIsSubmitted(false);
      }
    }
  }, []);

  useEffect(() => {
    if (currentDate && currentLocation && currentLocation !== "default") {
      fetchTodayReceipts(currentDate, currentLocation);
    }
  }, [currentDate, currentLocation]);

  const handleChange = (e) => {
    if (isSubmitted) return;
    const { name, value } = e.target;
    const numericFields = [
      "opdCash",
      "ipdCash",
      "pharmacyCash",
      "upiSettlement",
      "cardSettlement",
      "bankDeposit",
    ];
    if (numericFields.includes(name)) {
      const cleanValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const checkFields = [
    "opdCash",
    "ipdCash",
    "pharmacyCash",
    "upiSettlement",
    "cardSettlement",
    "bankDeposit",
  ];
  const hasZero = checkFields.some(
    (key) => formData[key] !== "" && Number(formData[key]) === 0,
  );
  const isSaveDisabled =
    isSubmitted ||
    loading ||
    (hasZero && (!formData.comment || !formData.comment.trim()));

  const handleSave = async () => {
    // Basic Validation
    if (!formData.opdCash || !formData.bankDeposit) {
      return Swal.fire("Required", "Please fill essential fields", "warning");
    }
    if (hasZero && (!formData.comment || !formData.comment.trim())) {
      return Swal.fire(
        "Justification Required",
        "Please provide a justification for the zero balance.",
        "warning",
      );
    }

    setLoading(true);
    try {
      // Convert DD-MM-YYYY to YYYY-MM-DD for backend
      const [dd, mm, yyyy] = currentDate.split("-");
      const entryDate = `${yyyy}-${mm}-${dd}`;

      const fd = new FormData();
      fd.append("entryDate", entryDate);
      fd.append("opdCash", formData.opdCash);
      fd.append("ipdCash", formData.ipdCash);
      fd.append("pharmacyCash", formData.pharmacyCash);
      fd.append("upiSettlement", formData.upiSettlement);
      fd.append("cardSettlement", formData.cardSettlement);
      fd.append("bankDeposit", formData.bankDeposit);
      fd.append("comment", formData.comment || "");

      if (cashDepositFile) {
        fd.append("cashDepositReceipt", cashDepositFile);
      }
      if (cardSettlementFile) {
        fd.append("cardSettlementSlip", cardSettlementFile);
      }

      const response = await fetch(
        `${BASE_URL}/V1/managereports/dailyclosing?location=${currentLocation}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: fd,
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const updatedFormData = {
          ...formData,
          cashDepositReceipt: result.cash_deposit_receipt || "",
          cardSettlementSlip: result.card_settlement_slip || "",
        };
        const submission = {
          date: currentDate,
          data: updatedFormData,
          isSubmitted: true,
        };
        localStorage.setItem("hms_daily_closing", JSON.stringify(submission));
        setFormData(updatedFormData);
        setIsSubmitted(true);

        Toast.fire({
          icon: "success",
          title: "Daily closing saved to database",
        });
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="themebody-wrap"
      style={{
        background: "linear-gradient(to right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        padding: "10px",
        fontFamily: "'Poppins', Arial, sans-serif",
      }}
    >
      <PageBreadcrumb pagename="Daily Closing" />
      <Container fluid>
        <Row>
          <Col>
            <Card
              style={{
                borderRadius: "5px",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderColor: "#00bcd4",
                background: "white",
                border: "1px solid #00bcd4",
                margin: "10px 5px 12px 5px",
              }}
            >
              <Card.Header
                style={{
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #4dd0e1",
                  padding: "10px 15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i
                    className="fa fa-list"
                    style={{ marginRight: "8px", color: "#333" }}
                  ></i>
                  <h5
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: "bold",
                      color: "#333",
                      textTransform: "uppercase",
                    }}
                  >
                    Collection Summary
                  </h5>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <style>{`
                    .custom-datepicker-wrapper .react-datepicker__input-container input {
                      border: 1px solid #4dd0e1 !important;
                      border-radius: 5px !important;
                      width: 130px !important;
                      font-size: 13px !important;
                      font-weight: 600 !important;
                      color: #006064 !important;
                      box-shadow: none !important;
                    }
                    .custom-datepicker-wrapper .react-datepicker__input-container input:focus {
                      border-color: #00bcd4 !important;
                    }
                  `}</style>
                  <span
                    style={{
                      marginRight: "10px",
                      fontWeight: "bold",
                      fontSize: "14px",
                      color: "#00838f",
                    }}
                  >
                    Date:
                  </span>
                  <div className="custom-datepicker-wrapper">
                    <DatePicker
                      selected={
                        currentDate
                          ? moment(currentDate, "DD-MM-YYYY").toDate()
                          : new Date()
                      }
                      onChange={(date) => {
                        if (date)
                          setCurrentDate(moment(date).format("DD-MM-YYYY"));
                      }}
                      dateFormat="dd-MM-yyyy"
                      maxDate={new Date()}
                      className="form-control form-control-sm"
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body
                style={{
                  padding: "10px",
                  background: "#ffffff",
                  borderRadius: "0 0 5px 5px",
                }}
              >
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  style={{ margin: 0, fontSize: "14px" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                          minWidth: "100px",
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        OPD Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        IPD Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Pharmacy Cash
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        UPI Settlement
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Card Settlement
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Bank Deposit
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Cash Deposit Receipt
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Card Settlement Slip
                      </th>
                      <th
                        style={{
                          border: "1px solid #4dd0e1",
                          color: "#333",
                          fontWeight: "bold",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: "white" }}>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          verticalAlign: "middle",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#333",
                          fontSize: "14px",
                          padding: "12px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {currentDate}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="opdCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.opdCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.opdCash !== "" &&
                          Number(formData.opdCash) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="ipdCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.ipdCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.ipdCash !== "" &&
                          Number(formData.ipdCash) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="pharmacyCash"
                            onWheel={(e) => e.target.blur()}
                            value={formData.pharmacyCash}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.pharmacyCash !== "" &&
                          Number(formData.pharmacyCash) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="upiSettlement"
                            onWheel={(e) => e.target.blur()}
                            value={formData.upiSettlement}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.upiSettlement !== "" &&
                          Number(formData.upiSettlement) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="cardSettlement"
                            onWheel={(e) => e.target.blur()}
                            value={formData.cardSettlement}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.cardSettlement !== "" &&
                          Number(formData.cardSettlement) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                        }}
                      >
                        <InputGroup style={{ minWidth: "120px" }}>
                          <InputGroup.Text
                            style={{
                              border: "1px solid #4dd0e1",
                              borderRight: "none",
                              backgroundColor: "#f8f9fa",
                              fontSize: "13px",
                              borderTopLeftRadius: "8px",
                              borderBottomLeftRadius: "8px",
                            }}
                          >
                            ₹
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0.00"
                            name="bankDeposit"
                            onWheel={(e) => e.target.blur()}
                            value={formData.bankDeposit}
                            onChange={handleChange}
                            readOnly={isSubmitted}
                            style={{
                              border: "1px solid #4dd0e1",
                              borderTopRightRadius: "8px",
                              borderBottomRightRadius: "8px",
                              borderTopLeftRadius: "0",
                              borderBottomLeftRadius: "0",
                              padding: "8px",
                              fontSize: "13px",
                              textAlign: "center",
                              transition: "all 0.3s ease",
                              boxShadow: "none",
                              cursor: isSubmitted ? "not-allowed" : "text",
                              backgroundColor: isSubmitted
                                ? "#f8f9fa"
                                : "white",
                            }}
                            onFocus={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#00bcd4")
                            }
                            onBlur={(e) =>
                              !isSubmitted &&
                              (e.target.style.borderColor = "#4dd0e1")
                            }
                          />
                        </InputGroup>
                        {formData.bankDeposit !== "" &&
                          Number(formData.bankDeposit) === 0 && (
                            <div
                              style={{
                                color: "#d32f2f",
                                fontSize: "11px",
                                marginTop: "4px",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              <i className="fa fa-warning me-1"></i>0 has been
                              entered
                            </div>
                          )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {isSubmitted ? (
                          formData.cashDepositReceipt ? (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cashDepositReceipt}`}
                                style={{
                                  fontSize: "11px",
                                  textAlign: "center",
                                  width: "130px",
                                  textOverflow: "ellipsis",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <a
                                href={`${BASE_URL.replace("/api", "")}${formData.cashDepositReceipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info py-5 px-2"
                                style={{ fontSize: "11px" }}
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span
                              className="text-muted"
                              style={{ fontSize: "12px" }}
                            >
                              -
                            </span>
                          )
                        ) : (
                          <div className="d-flex flex-column align-items-center gap-1">
                            <input
                              type="file"
                              accept="image/*"
                              id="cashDepositReceiptFile"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setCashDepositFile(file);
                              }}
                            />
                            <label
                              htmlFor="cashDepositReceiptFile"
                              className="btn btn-sm btn-info text-white mb-0"
                              style={{
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: cashDepositFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                                borderColor: cashDepositFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                              }}
                            >
                              {cashDepositFile ? "Change File" : "Choose File"}
                            </label>
                            {cashDepositFile && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  maxWidth: "120px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={cashDepositFile.name}
                              >
                                {cashDepositFile.name}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {isSubmitted ? (
                          formData.cardSettlementSlip ? (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <Form.Control
                                type="text"
                                readOnly
                                value={`${BASE_URL.replace("/api", "")}${formData.cardSettlementSlip}`}
                                style={{
                                  fontSize: "11px",
                                  textAlign: "center",
                                  width: "130px",
                                  textOverflow: "ellipsis",
                                }}
                                onClick={(e) => e.target.select()}
                              />
                              <a
                                href={`${BASE_URL.replace("/api", "")}${formData.cardSettlementSlip}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info py-5 px-2"
                                style={{ fontSize: "11px" }}
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span
                              className="text-muted"
                              style={{ fontSize: "12px" }}
                            >
                              -
                            </span>
                          )
                        ) : (
                          <div className="d-flex flex-column align-items-center gap-1">
                            <input
                              type="file"
                              accept="image/*"
                              id="cardSettlementSlipFile"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setCardSettlementFile(file);
                              }}
                            />
                            <label
                              htmlFor="cardSettlementSlipFile"
                              className="btn btn-sm btn-info text-white mb-0"
                              style={{
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                backgroundColor: cardSettlementFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                                borderColor: cardSettlementFile
                                  ? "#0097a7"
                                  : "#00bcd4",
                              }}
                            >
                              {cardSettlementFile
                                ? "Change File"
                                : "Choose File"}
                            </label>
                            {cardSettlementFile && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  maxWidth: "120px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={cardSettlementFile.name}
                              >
                                {cardSettlementFile.name}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td
                        style={{
                          border: "1px solid #4dd0e1",
                          textAlign: "center",
                          verticalAlign: "middle",
                          padding: "12px",
                        }}
                      >
                        <Button
                          variant="success"
                          onClick={handleSave}
                          disabled={isSaveDisabled}
                          style={{
                            borderRadius: "8px",
                            padding: "8px 20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            backgroundColor: isSaveDisabled
                              ? "#ccc"
                              : "#00bcd4",
                            borderColor: isSaveDisabled ? "#ccc" : "#00bcd4",
                            boxShadow: isSaveDisabled
                              ? "none"
                              : "0 2px 4px rgba(0,0,0,0.1)",
                            transition: "all 0.3s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            whiteSpace: "nowrap",
                            justifyContent: "center",
                            cursor: isSaveDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          <FeatherIcon
                            icon={isSubmitted ? "check-circle" : "save"}
                            size="14"
                            className="me-1"
                          />
                          {isSubmitted ? "SUBMITTED" : "SAVE"}
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </Table>

                {(hasZero || formData.comment) && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "5px",
                      backgroundColor: "#f8d7da",
                      borderRadius: "5px",
                      border: "1px solid #f5c6cb",
                    }}
                  >
                    {hasZero && !isSubmitted && (
                      <div
                        style={{
                          color: "#721c24",
                          fontSize: "13px",
                          fontWeight: "bold",
                          marginBottom: "10px",
                        }}
                      >
                        <i className="fa fa-exclamation-triangle me-2"></i>A
                        zero balance is recorded in one or more fields. Please
                        provide a justification below to proceed.
                      </div>
                    )}
                    <Form.Group>
                      <Form.Label
                        style={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#721c24",
                        }}
                      >
                        {hasZero ? "Justification for Zero Balance" : "Remarks"}{" "}
                        {hasZero && !isSubmitted && (
                          <span className="text-danger">*</span>
                        )}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        readOnly={isSubmitted}
                        placeholder="Enter justification or remarks..."
                        style={{
                          fontSize: "13px",
                          border: "1px solid #f5c6cb",
                          borderRadius: "5px",
                        }}
                      />
                    </Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DailyClosing;
