import React, { useState, useEffect, useRef } from 'react';
import NavbarIpdBills from '../../components/NavbarIpdBills';
import { Container, Card, Row, Col, Form, Button, ListGroup, Table, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { FaPrint, FaPlus, FaListUl, FaTasks } from 'react-icons/fa';
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:5100/api";

const IpdPaymentData = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [patientDetails, setPatientDetails] = useState({ name: '', uhid: '', patient_id: '', phone: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBillDetails, setShowBillDetails] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState('HDFC');
    const [currentLocation, setCurrentLocation] = useState("");

    const [summary, setSummary] = useState({ totalBill: 0, insuranceApproved: 0, patientPayable: 0, totalDue: 0 });
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({
        date: new Date().toISOString().split('T')[0],
        cash: 0, card: 0, cheque: 0, online: 0, internalDiscount: 0, tds: 0
    });

    const dropdownRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const payload = decodeJwt(token);
            if (payload?.jobLocation) setCurrentLocation(payload.jobLocation);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (invoiceId.trim().length > 0) {
                fetchAutocompleteInvoices();
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [invoiceId]);

    const fetchAutocompleteInvoices = async () => {
        try {
            const response = await fetch(`${BASE_URL}/V1/invoice/searchByInvoiceId?invoice_id=${invoiceId}&location=${currentLocation}`);
            const data = await response.json();
            if (data && Array.isArray(data)) {
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
            setShowDropdown(true);
        } catch (error) {
            console.error("Autocomplete error:", error);
            setSearchResults([]);
        }
    };

    const handleSelectInvoice = (inv) => {
        setInvoiceId(inv.invoice_id);
        setPatientDetails({
            name: inv.name,
            uhid: inv.Uid_no,
            patient_id: inv.patient_id,
            phone: inv.phone
        });
        setShowDropdown(false);
    };

    const handleViewBillDetails = async () => {
        setLoading(true);
        try {
            const resTotal = await fetch(`${BASE_URL}/V1/invoice/searchInvoiceTotal?invoice_id=${invoiceId}&location=${currentLocation}`);
            const totalData = await resTotal.json();
            const financialInfo = Array.isArray(totalData) ? totalData[0] : totalData;

            if (financialInfo) {
                setSummary({
                    totalBill: financialInfo.totalamt || 0,
                    insuranceApproved: financialInfo.receivedamt || 0,
                    patientPayable: financialInfo.payableamt || 0,
                    totalDue: financialInfo.totalduedamt || 0
                });

                const resHistory = await fetch(`${BASE_URL}/V1/invoice/searchInvoiceDetails?invoice_id=${invoiceId}&location=${currentLocation}`);
                const historyData = await resHistory.json();
                setPayments(Array.isArray(historyData) ? historyData : []);
                setShowBillDetails(true);
            } else {
                Swal.fire("Error", "Invoice financial data not found", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Failed to fetch bill details", "error");
        } finally {
            setLoading(false);
        }
    };

    // ... inside your IpdPaymentData component ...

// 1. Updated cancelPayment logic to match IPD requirements
const cancelPayment = async (referenceId, originalPayload, apidata) => {
    try {
        // Prepare the specific cancellation payload for IPD
        const cancelPayload = {
            reference_id: referenceId,
            transaction_id: originalPayload.transaction_id || referenceId,
            PosMachine: originalPayload.PosMachine,
            MachineType: 'IPD', // Explicitly set to IPD
            // Pass along financial context if needed by backend cancel logic
            InvoiceId: originalPayload.InvoiceId,
            PatientId: originalPayload.PatientId,
            apidata: apidata,
        };
        console.log(cancelPayload);
        const response = await fetch(
            `${BASE_URL}/V1/invoice/cancelIPDPaymentStatus?location=${currentLocation}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cancelPayload),
            }
        );

        return await response.json();
    } catch (err) {
        throw new Error(err.message);
    }
};

// 2. Updated showPaymentPendingPopup to handle the IPD status check loop
const showPaymentPendingPopup = (referenceId, originalPayload, apidata) => {
    Swal.fire({
        title: "Transaction in Progress",
        html: `
            <div style="padding: 10px;">
                <div class="spinner-border text-info mb-3" role="status"></div>
                <p><strong>Waiting for card swipe...</strong></p>
                <p class="text-muted small">Reference ID: ${referenceId}</p>
                <hr/>
                <p style="font-size: 13px;">Please check the POS terminal and click "Check Status" once the swipe is completed.</p>
            </div>
        `,
        icon: "info",
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonText: "Check Status",
        cancelButtonText: "Cancel Payment",
        confirmButtonColor: "#00bcd4",
        cancelButtonColor: "#cfd8dc",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            try {
                // Prepare payload for status check
                const statusPayload = {
                    receiptData: originalPayload, // Contains all CashAmt, CardAmt, etc.
                    reference_id: apidata.reference_id,
                    transaction_id: referenceId,
                    PosMachine: originalPayload.PosMachine,
                    MachineType: 'IPD',
                    InvoiceId: originalPayload.InvoiceId,
                    PatientId: originalPayload.PatientId,
                    Totalinvoiceamt: originalPayload.Totalinvoiceamt
                };
                console.log("INITITATION DATA IN PENDING POPUP: ", apidata);2
                console.log(statusPayload);
                const response = await fetch(
                    `${BASE_URL}/V1/invoice/checkIPDPaymentStatus?location=${currentLocation}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(statusPayload),
                    }
                );

                const result = await response.json();
                
                // If status check returns 200/201, the payment is recorded in DB
                if (response.ok && (result.success || result.statusCode === 201 || result.statusCode === 200)) {
                    return result;
                } else {
                    Swal.showValidationMessage(
                        result.message || "Swipe not detected yet. Please try again after swiping."
                    );
                    return false;
                }
            } catch (error) {
                Swal.showValidationMessage(`Check failed: ${error.message}`);
            }
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Paid!",
                text: "IPD Receipt Generated Successfully",
                icon: "success",
                timer: 2000,
            });
            setShowAddRow(false);
            handleViewBillDetails(); // Refresh the table and summary
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Confirmation before calling the actual backend cancellation
            const confirmCancel = await Swal.fire({
                title: "Are you sure?",
                text: "This will attempt to stop the current payment request on the terminal.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Cancel it!",
                cancelButtonText: "No, Keep Waiting",
            });

            if (confirmCancel.isConfirmed) {
                try {
                    Swal.fire({
                        title: "Processing Cancellation...",
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                    });

                    const cancelResult = await cancelPayment(referenceId, originalPayload, apidata);

                    if (cancelResult?.success || cancelResult?.statusCode === 200) {
                        await Swal.fire("Cancelled", "Transaction has been cancelled successfully.", "success");
                        setShowAddRow(false);
                    } else {
                        Swal.fire(
                            "Cancellation Error",
                            cancelResult?.message || "Remote cancel failed. Please cancel manually on the POS machine.",
                            "error"
                        );
                    }
                } catch (err) {
                    Swal.fire("Error", "Server error during cancellation process", "error");
                }
            } else {
                // If user backs out of cancellation, re-open the pending popup
                showPaymentPendingPopup(referenceId, originalPayload, apidata);
            }
        }
    });
};

    const handleSavePayment = async () => {
        const totalEntered = Object.values(newPayment).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
        if (totalEntered <= 0) return Swal.fire("Invalid Amount", "Please enter a payment value", "warning");

        setLoading(true);
        try {
            const endpoint = newPayment.card > 0 || newPayment.online > 0
                ? '/V1/invoice/IPDDigitalPayment'
                : '/V1/invoice/SaveIPDPayment';

            const payload = {
                PatientId: patientDetails.patient_id,
                InvoiceId: invoiceId,
                InvoiceDate: newPayment.date,
                CashAmt: newPayment.cash,
                CardAmt: newPayment.card,
                ChequeAmt: newPayment.cheque,
                OnlineAmt: newPayment.online,
                DiscountAmt: newPayment.internalDiscount,
                TdsAmt: newPayment.tds,
                Totalinvoiceamt: summary.patientPayable,
                PosMachine: selectedTerminal,
                location: currentLocation
            };
            console.log(endpoint);
            console.log(payload);
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            console.log("INITIATION RESULT: ", result);
            if (result.statusCode === 201 || result.statusCode === 200) {
                    Swal.fire("Success", "Receipt Generated Successfully", "success");
                setShowAddRow(false);
                handleViewBillDetails();
            } else if (
                    result.statusCode === 202 &&
                    (result.data?.result === "success" || result.data?.stat === "success")
                  ) {
                    // showPaymentPendingPopup(result.data.transaction_id, payload, result.data.pos_tid);
                    showPaymentPendingPopup(
                      result.data.transaction_id,
                      payload,
                      result.data,
                    );
                  } else {
                    Swal.fire(
                      "Error",
                      result.message || "Failed to initiate payment",
                      "error",
                    );
                  }
        } catch (error) {
            Swal.fire("Error", "Server communication failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const terminalOptions = ['HDFC', 'PineLabs', 'OFFLINE', 'BharatPe1', 'BharatPe2'];

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="themebody-wrap custom-ipd-styles">
            <PageBreadcrumb pagename="IPD Payment Data" />
            <NavbarIpdBills />
            <Container fluid>
                <Row>
                    <Col>
                        <Card className="shadow-sm border-cyan mb-20 overflow-visible">
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col lg={3} md={6} className="mb-3 position-relative" ref={dropdownRef}>
                                        <Form.Label className="label-style">Search Invoice ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={invoiceId}
                                            onChange={(e) => setInvoiceId(e.target.value)}
                                            placeholder="Enter Invoice ID..."
                                            className="input-style"
                                        />
                                        {showDropdown && (
                                            <ListGroup className="position-absolute w-300 z-index-dropdown shadow custom-list">
                                                {Array.isArray(searchResults) && searchResults.map((inv) => (
                                                    <ListGroup.Item key={inv.invoice_id} action onClick={() => handleSelectInvoice(inv)}>
                                                        {inv.invoice_id} - {inv.name}
                                                    </ListGroup.Item>
                                                ))}
                                                {searchResults.length === 0 && <ListGroup.Item className="text-danger">No invoice found</ListGroup.Item>}
                                            </ListGroup>
                                        )}
                                    </Col>
                                    <Col lg={3} md={6} className="mb-3">
                                        <Form.Label className="label-style">Patient Name</Form.Label>
                                        <Form.Control readOnly value={patientDetails.name} className="input-style" />
                                    </Col>
                                    <Col lg={3} md={6} className="mb-3">
                                        <Form.Label className="label-style">UID Number</Form.Label>
                                        <Form.Control readOnly value={patientDetails.uhid} className="input-style" />
                                    </Col>
                                    <Col lg={2} md={6} className="mb-3">
                                        <Button variant="primary" className="w-200 text-white fw-bold btn-view" disabled={!invoiceId || loading} onClick={handleViewBillDetails}>
                                            {loading ? <Spinner size="sm" /> : "View Bill Details"}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {showBillDetails && (
                            <Card className="shadow-sm border-0 overflow-hidden">
                                <div className="summary-header">
                                    <span><FaListUl className="me-1" />Total Bill: {summary.totalBill}</span>
                                    <span><FaTasks className="me-1" />Insurance Approved: {summary.insuranceApproved}</span>
                                    <span><FaListUl className="me-1" />Patient Payable: {summary.patientPayable}</span>
                                    <span><FaListUl className="me-1" />Total Due: {summary.totalDue}</span>
                                </div>
                                <Card.Body>
                                    <Table responsive borderless className="align-middle custom-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '5%' }}>Sr No</th>
                                                <th style={{ width: '9%' }}>Date</th>
                                                <th style={{ width: '10%' }}>Cash</th>
                                                <th style={{ width: '10%' }}>Card</th>
                                                <th style={{ width: '10%' }}>Cheque</th>
                                                <th style={{ width: '10%' }}>Online</th>
                                                <th style={{ width: '10%' }}>Internal Discount</th>
                                                <th style={{ width: '3%' }}>Hospital Discount</th>
                                                <th style={{ width: '1%' }} className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((pay, idx) => (
                                                <tr key={pay.ipdpaymentid}>
                                                    <td><Form.Control className="table-input" style={{width:"55px"}} readOnly value={idx + 1} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"110px"}} readOnly value={pay.receipt_date ? pay.receipt_date.split('T')[0].split('-').reverse().join('-') : ''} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.cashamt}`} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.cardamt}`} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.chequeamt}`} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.onlineamt}`} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.discountamt}`} /></td>
                                                    <td><Form.Control className="table-input" style={{width:"135px"}} readOnly value={`₹${pay.tdsamt}`} /></td>
                                                    <td className="text-center">
                                                        <Button title="Print Receipt" variant="outline-primary" className="btn-print"><FaPrint /></Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <div className="d-flex justify-content-between mt-4 p-3 rounded border align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="me-3 fw-bold text-cyan-dark">PoS Terminal:</span>
                                            {terminalOptions.map(opt => (
                                                <Form.Check key={opt} inline type="radio" label={opt} checked={selectedTerminal === opt} onChange={() => setSelectedTerminal(opt)} className="fw-bold text-secondary" />
                                            ))}
                                        </div>
                                        <Button className="btn-add" onClick={() => setShowAddRow(!showAddRow)}><FaPlus /></Button>
                                    </div>

                                    {showAddRow && (
                                        <div className="mt-3 p-3 border rounded bg-white add-payment-box">
                                            <Row className="g-2">
                                                <Col md={2}><Form.Control type="date" className="input-style" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Cash" className="input-style" onChange={e => setNewPayment({ ...newPayment, cash: +e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Card" className="input-style" onChange={e => setNewPayment({ ...newPayment, card: +e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Cheque" className="input-style" onChange={e => setNewPayment({ ...newPayment, cheque: +e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Online" className="input-style" onChange={e => setNewPayment({ ...newPayment, online: +e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Int. Disc" className="input-style" onChange={e => setNewPayment({ ...newPayment, internalDiscount: +e.target.value })} /></Col>
                                                <Col><Form.Control type="number" placeholder="Hosp. Disc" className="input-style" onChange={e => setNewPayment({ ...newPayment, tds: +e.target.value })} /></Col>
                                                <Col md={1}><Button className="w-100 btn-save" onClick={handleSavePayment} disabled={loading}>Save</Button></Col>
                                            </Row>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>

            <style>{`
                .custom-ipd-styles {
                    background: linear-gradient(to right, #e0f7fa, #80deea);
                    min-height: 100vh;
                    padding: 10px;
                    font-family: 'Poppins', sans-serif;
                }
                .input-style { 
                    border-radius: 10px !important; 
                    border: 1px solid #80deea !important; 
                    height: 30px !important; 
                    background-color: #ffffff !important; 
                    font-size: 14px;
                }
                .label-style { font-size: 13px; fontWeight: 600; color: #00838f; }
                .border-cyan { border: 1px solid #00bcd4; }
                .z-index-dropdown { z-index: 1050; }
                .summary-header {
                    background: #1099ab;
                    padding: 10px 15px;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                }

                .custom-table {
                    border: none !important;    
                }

                .custom-table thead th { 
                    background-color: transparent; 
                    color: #006064; 
                    border: none !important;
                    border-bottom: 2px solid #80deea !important;
                    padding-bottom: 10px;
                    font-size: 14px;
                    text-align: left;
                }

                .custom-table tbody td {
                    border: none !important;
                    padding: 5px 2px !important;
                    text-align: left;
                }

                .table-input {
                    border: 1px solid #80deea !important;
                    border-radius: 6px !important;
                    height: 32px !important;
                     background-color: #f8f9fa !important; /* Slight grey to show read-only */
                     text-align: left; /* Changed to left */
                     padding-left: 8px;
                     width: 100px; /* Reduced width */
                     max-width: 100%; 
                     pointer-events: none; 
                     cursor: not-allowed; /* Visual cue for read-only */
                     box-shadow: none !important;
                     font-size: 13px;
                }

                .btn-view { background-color: #00bcd4; border: none; height: 38px; border-radius: 10px; }
                .btn-add { background-color: #00bcd4; border: none; border-radius: 6px; }
                .btn-save { background-color: #00bcd4; border: none; font-weight: 600; }
                .btn-print { 
        border-color: #00bcd4 !important; 
        color: #00bcd4 !important;
        width: 40px;      /* Reduced width */
        height: 35px;     /* Reduced height */
        padding: 0;       /* Remove default padding to center icon */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px !important; /* Requested border radius */
    }
                .text-cyan-dark { color: #00838f; }
                .custom-list .list-group-item:hover { background-color: #e0f7fa; }
            `}</style>
        </div>
    );
};

export default IpdPaymentData;