import React, { useState, useEffect } from "react";
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

const BASE_URL = "http://194.195.117.79:5100/api";

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
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.data)) {
        setReceiptsList(data.data);
      } else {
        console.error("Failed to load receipts for reconciliation:", data.message);
        setReceiptsList([]);
      }

      // Fetch Daily OPD Report for Pharmacy Cash
      const opdReportUrl = `${BASE_URL}/V1/appointment/daily-opd?location=${loc}&date=${entryDate}`;
      const opdReportResponse = await fetch(opdReportUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });
      const opdReportResult = await opdReportResponse.json();
      if (opdReportResponse.ok && opdReportResult.statusCode === 200) {
        const pharmacyColl = opdReportResult.description?.pharmacyCollection || [];
        const cashRow = pharmacyColl.find(item => item[0] === "Cash");
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
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          location: loc,
          Fromdate: entryDate,
          Todate: entryDate
        })
      });
      const ipdReportResult = await ipdReportResponse.json();
      if (ipdReportResponse.ok && Array.isArray(ipdReportResult)) {
        const ipdCashSum = ipdReportResult.reduce((sum, item) => sum + Number(item.cashamt || 0), 0);
        setIpdSystemCash(ipdCashSum);
      } else {
        setIpdSystemCash(0);
      }

      // Fetch Daily Closing Status from Backend database
      const closingStatusUrl = `${BASE_URL}/V1/managereports/dailyclosing-status?location=${loc}&date=${entryDate}`;
      const closingStatusResponse = await fetch(closingStatusUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (closingStatusResponse.ok) {
        const closingStatusResult = await closingStatusResponse.json();
        if (closingStatusResult.success && closingStatusResult.data) {
          const dbData = closingStatusResult.data;
          const updatedData = {
            opdCash: dbData.opdcash !== null && dbData.opdcash !== undefined ? String(dbData.opdcash) : "",
            ipdCash: dbData.ipdcash !== null && dbData.ipdcash !== undefined ? String(dbData.ipdcash) : "",
            pharmacyCash: dbData.pharmacycash !== null && dbData.pharmacycash !== undefined ? String(dbData.pharmacycash) : "",
            upiSettlement: dbData.upiamt !== null && dbData.upiamt !== undefined ? String(dbData.upiamt) : "",
            cardSettlement: dbData.cardamt !== null && dbData.cardamt !== undefined ? String(dbData.cardamt) : "",
            bankDeposit: dbData.bankdeposit !== null && dbData.bankdeposit !== undefined ? String(dbData.bankdeposit) : "",
            comment: dbData.comment || "",
            cashDepositReceipt: dbData.cash_deposit_receipt || "",
            cardSettlementSlip: dbData.card_settlement_slip || "",
          };
          setFormData(updatedData);
          setIsSubmitted(true);
          // Sync to localStorage
          localStorage.setItem("hms_daily_closing", JSON.stringify({
            date: dateStr,
            data: updatedData
          }));
        } else {
          // If not found in DB, clear submitting state if localStorage is empty
          const savedData = localStorage.getItem("hms_daily_closing");
          if (!savedData) {
            setIsSubmitted(false);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching receipts/reports for reconciliation:", error);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const systemTotals = React.useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let total = 0;

    receiptsList.forEach((r) => {
      const net = parseFloat(r.totalamt || 0) - parseFloat(r.discountamt || 0);
      const mode = (r.paymentmode || "").toLowerCase().trim();
      if (mode.includes("cash")) {
        cash += net;
      } else if (mode.includes("upi")) {
        upi += net;
      } else if (mode.includes("card") || mode.includes("pos") || mode.includes("machine") || mode.includes("pinelabs") || mode.includes("pine labs")) {
        card += net;
      }
      total += net;
    });

    return { cash, upi, card, total };
  }, [receiptsList]);

  const diffCash = (parseFloat(formData.opdCash || 0) - systemTotals.cash).toFixed(2);
  const diffIpdCash = (parseFloat(formData.ipdCash || 0) - ipdSystemCash).toFixed(2);
  const diffPharmacyCash = (parseFloat(formData.pharmacyCash || 0) - pharmacySystemCash).toFixed(2);
  const diffUpi = (parseFloat(formData.upiSettlement || 0) - systemTotals.upi).toFixed(2);
  const diffCard = (parseFloat(formData.cardSettlement || 0) - systemTotals.card).toFixed(2);
  const totalEntered = parseFloat(formData.opdCash || 0) + parseFloat(formData.ipdCash || 0) + parseFloat(formData.upiSettlement || 0) + parseFloat(formData.cardSettlement || 0) + parseFloat(formData.pharmacyCash || 0);
  const totalSystem = systemTotals.total + pharmacySystemCash + ipdSystemCash;
  const diffTotal = (totalEntered - totalSystem).toFixed(2);

  const formatDifference = (diffStr) => {
    const diffVal = parseFloat(diffStr);
    const absoluteValStr = Math.abs(diffVal).toFixed(2);
    if (diffVal > 0.01) return `+₹ ${absoluteValStr}`;
    if (diffVal < -0.01) return `-₹ ${absoluteValStr}`;
    return `₹ ${absoluteValStr}`;
  };

  const hasMismatch = Math.abs(parseFloat(diffCash)) > 0.01 ||
    Math.abs(parseFloat(diffIpdCash)) > 0.01 ||
    Math.abs(parseFloat(diffPharmacyCash)) > 0.01 ||
    Math.abs(parseFloat(diffUpi)) > 0.01 ||
    Math.abs(parseFloat(diffCard)) > 0.01;
  const hasEnteredAmount =
    (formData.opdCash && formData.opdCash.trim() !== "") ||
    (formData.ipdCash && formData.ipdCash.trim() !== "") ||
    (formData.pharmacyCash && formData.pharmacyCash.trim() !== "") ||
    (formData.upiSettlement && formData.upiSettlement.trim() !== "") ||
    (formData.cardSettlement && formData.cardSettlement.trim() !== "");
  const showReconciliation = hasEnteredAmount;
  const isSaveDisabled = isSubmitted || loading || (hasMismatch && (!formData.comment || !formData.comment.trim()));

  const handleSave = async () => {
    // Basic Validation
    if (!formData.opdCash || !formData.bankDeposit) {
      return Swal.fire("Required", "Please fill essential fields", "warning");
    }

    if (hasMismatch && (!formData.comment || !formData.comment.trim())) {
      return Swal.fire(
        "Mismatch Comment Required",
        "There is a difference between system receipts/reports and entered totals. Please provide an explanation in the reconciliation section below the table.",
        "warning"
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
                  justifyContent: "flex-start",
                }}
              >
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
                  Today's Collection Summary
                </h5>
              </Card.Header>
              <Card.Body style={{ padding: "10px", background: "#ffffff", borderRadius: "0 0 5px 5px" }}>
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                            type="number"
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
                              backgroundColor: isSubmitted ? "#f8f9fa" : "white",
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
                                value={`${BASE_URL.replace('/api', '')}${formData.cashDepositReceipt}`}
                                style={{ fontSize: "11px", textAlign: "center", width: "130px", textOverflow: "ellipsis" }}
                                onClick={(e) => e.target.select()}
                              />
                              <a
                                href={`${BASE_URL.replace('/api', '')}${formData.cashDepositReceipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info py-5 px-2"
                                style={{ fontSize: "11px" }}
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>-</span>
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
                                backgroundColor: cashDepositFile ? "#0097a7" : "#00bcd4",
                                borderColor: cashDepositFile ? "#0097a7" : "#00bcd4",
                              }}
                            >
                              {cashDepositFile ? "Change File" : "Choose File"}
                            </label>
                            {cashDepositFile && (
                              <span
                                style={{ fontSize: "11px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
                                value={`${BASE_URL.replace('/api', '')}${formData.cardSettlementSlip}`}
                                style={{ fontSize: "11px", textAlign: "center", width: "130px", textOverflow: "ellipsis" }}
                                onClick={(e) => e.target.select()}
                              />
                              <a
                                href={`${BASE_URL.replace('/api', '')}${formData.cardSettlementSlip}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info py-5 px-2"
                                style={{ fontSize: "11px" }}
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: "12px" }}>-</span>
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
                                backgroundColor: cardSettlementFile ? "#0097a7" : "#00bcd4",
                                borderColor: cardSettlementFile ? "#0097a7" : "#00bcd4",
                              }}
                            >
                              {cardSettlementFile ? "Change File" : "Choose File"}
                            </label>
                            {cardSettlementFile && (
                              <span
                                style={{ fontSize: "11px", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
                            backgroundColor: isSaveDisabled ? "#ccc" : "#00bcd4",
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

                {showReconciliation && (
                  <>
                    <hr style={{ borderTop: "2px dashed #b2ebf2", margin: "10px 0" }} />

                    <div>
                      <h6 className="mb-3 font-weight-bold" style={{ color: "#006064" }}>
                        Collections Comparison (Entered Closing vs System Receipts & Reports)
                      </h6>

                      {receiptsLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading receipts...</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Table bordered hover responsive style={{ fontSize: "14px", border: "1px solid #b2ebf2" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#e0f7fa" }}>
                                <th style={{ border: "1px solid #b2ebf2", color: "#006064", fontWeight: "bold" }}>Payment Mode</th>
                                <th style={{ border: "1px solid #b2ebf2", color: "#006064", fontWeight: "bold" }}>System Receipts / Reports</th>
                                <th style={{ border: "1px solid #b2ebf2", color: "#006064", fontWeight: "bold" }}>Entered Closing Form</th>
                                <th style={{ border: "1px solid #b2ebf2", color: "#006064", fontWeight: "bold" }}>Difference</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>OPD Cash</td>
                                <td>₹ {systemTotals.cash.toFixed(2)}</td>
                                <td>₹ {parseFloat(formData.opdCash || 0).toFixed(2)}</td>
                                <td style={{
                                  color: Math.abs(parseFloat(diffCash)) > 0.01 ? "#d32f2f" : "#2e7d32",
                                  fontWeight: "bold"
                                }}>
                                  {formatDifference(diffCash)}
                                </td>
                              </tr>
                              <tr>
                                <td>IPD Cash</td>
                                <td>₹ {ipdSystemCash.toFixed(2)}</td>
                                <td>₹ {parseFloat(formData.ipdCash || 0).toFixed(2)}</td>
                                <td style={{
                                  color: Math.abs(parseFloat(diffIpdCash)) > 0.01 ? "#d32f2f" : "#2e7d32",
                                  fontWeight: "bold"
                                }}>
                                  {formatDifference(diffIpdCash)}
                                </td>
                              </tr>
                              <tr>
                                <td>Pharmacy Cash</td>
                                <td>₹ {pharmacySystemCash.toFixed(2)}</td>
                                <td>₹ {parseFloat(formData.pharmacyCash || 0).toFixed(2)}</td>
                                <td style={{
                                  color: Math.abs(parseFloat(diffPharmacyCash)) > 0.01 ? "#d32f2f" : "#2e7d32",
                                  fontWeight: "bold"
                                }}>
                                  {formatDifference(diffPharmacyCash)}
                                </td>
                              </tr>
                              <tr>
                                <td>UPI Settlement</td>
                                <td>₹ {systemTotals.upi.toFixed(2)}</td>
                                <td>₹ {parseFloat(formData.upiSettlement || 0).toFixed(2)}</td>
                                <td style={{
                                  color: Math.abs(parseFloat(diffUpi)) > 0.01 ? "#d32f2f" : "#2e7d32",
                                  fontWeight: "bold"
                                }}>
                                  {formatDifference(diffUpi)}
                                </td>
                              </tr>
                              <tr>
                                <td>Card Settlement</td>
                                <td>₹ {systemTotals.card.toFixed(2)}</td>
                                <td>₹ {parseFloat(formData.cardSettlement || 0).toFixed(2)}</td>
                                <td style={{
                                  color: Math.abs(parseFloat(diffCard)) > 0.01 ? "#d32f2f" : "#2e7d32",
                                  fontWeight: "bold"
                                }}>
                                  {formatDifference(diffCard)}
                                </td>
                              </tr>
                              <tr style={{ backgroundColor: "#eeeeee", fontWeight: "bold" }}>
                                <td style={{ backgroundColor: "#eeeeee" }}>Total Collections</td>
                                <td style={{ backgroundColor: "#eeeeee" }}>₹ {totalSystem.toFixed(2)}</td>
                                <td style={{ backgroundColor: "#eeeeee" }}>₹ {totalEntered.toFixed(2)}</td>
                                <td style={{
                                  backgroundColor: "#eeeeee",
                                  color: Math.abs(parseFloat(diffTotal)) > 0.01 ? "#d32f2f" : "#000000ff"
                                }}>
                                  {formatDifference(diffTotal)}
                                </td>
                              </tr>
                            </tbody>
                          </Table>

                          {hasMismatch ? (
                            <Alert variant="warning" className="mt-3" style={{ borderLeft: "5px solid #ff9800", backgroundColor: "#fffde7", color: "#5d4037", padding: "10px" }}>
                              <Alert.Heading style={{ fontSize: "16px", fontWeight: "bold", color: "#f57c00" }}>
                                <FeatherIcon icon="alert-triangle" size="18" className="me-2" />
                                Collection Discrepancy Detected
                              </Alert.Heading>
                              <p className="mb-10 " style={{ margin: 3, fontSize: "13px", fontWeight: "bold" }}>
                                The Entered Closing amounts do not match the system-generated Receipts and Reports list for today.
                                Please enter an explanation comment below before saving.
                              </p>

                              <Form.Group >
                                <Form.Label style={{ fontWeight: "bold", fontSize: "13px", color: "#e65100" }}>
                                  Discrepancy Explanation Comment <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  placeholder="Provide the reason for the difference (e.g. cash deposit delay, correction in receipt payment mode, etc.)"
                                  name="comment"
                                  value={formData.comment}
                                  onChange={handleChange}
                                  readOnly={isSubmitted}
                                  required
                                  style={{
                                    border: "1px solid #ffb74d",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    padding: "5px",
                                    backgroundColor: isSubmitted ? "#f8f9fa" : "white"
                                  }}
                                />
                              </Form.Group>
                            </Alert>
                          ) : (
                            <Alert variant="success" className="mt-3" style={{ borderLeft: "5px solid #4caf50", backgroundColor: "#f1f8e9", color: "#33691e" }}>
                              <Alert.Heading style={{ fontSize: "16px", fontWeight: "bold", color: "#2e7d32" }}>
                                <FeatherIcon icon="check-circle" size="18" className="me-2" />
                                Collections Match Perfectly
                              </Alert.Heading>
                              <p style={{ margin: 0, fontSize: "13px" }}>
                                Entered values align exactly with system receipts. You can proceed to submit.
                              </p>

                              <Form.Group className="mt-3">
                                <Form.Label style={{ fontWeight: "600", fontSize: "13px", color: "#555" }}>
                                  Additional Comment (Optional)
                                </Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Any additional notes..."
                                  name="comment"
                                  value={formData.comment}
                                  onChange={handleChange}
                                  readOnly={isSubmitted}
                                  style={{
                                    border: "1px solid #ced4da",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    padding: "8px",
                                    backgroundColor: isSubmitted ? "#f8f9fa" : "white"
                                  }}
                                />
                              </Form.Group>
                            </Alert>
                          )}
                        </>
                      )}
                    </div>
                  </>
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
