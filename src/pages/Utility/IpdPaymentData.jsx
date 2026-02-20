import React, { useState, useEffect, useRef } from 'react';
import NavbarIpdBills from '../../components/NavbarIpdBills';
import { Container, Card, Row, Col, Form, Button, InputGroup, ListGroup, Table, Spinner } from 'react-bootstrap';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { FaPrint, FaPlus, FaListUl, FaTasks } from 'react-icons/fa';
import { decodeJwt } from "../../utils/decode-jwt";
import Swal from "sweetalert2";

const BASE_URL = "http://localhost:5100/api";

const IpdPaymentData = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [patientDetails, setPatientDetails] = useState({ name: '', uhid: '', patient_id: '', phone: '' });
    const [searchResults, setSearchResults] = useState([]); // Safety initialized as array
    const [showDropdown, setShowDropdown] = useState(false);
    const [showBillDetails, setShowBillDetails] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState('HDFC');
    const [currentLocation, setCurrentLocation] = useState("");
    
    // State for Database Data
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

    // 1. Fixed Search Logic with Type Safety
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
            // console.log("invoice location: ", currentLocation);
            const response = await fetch(`${BASE_URL}/V1/invoice/searchByInvoiceId?invoice_id=${invoiceId}&location=${currentLocation}`);
            const data = await response.json();
            
            // FIX: Ensure data is always an array before setting state
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

    // 2. Fetch Bill Totals and History
    const handleViewBillDetails = async () => {
        setLoading(true);
        try {
            const resTotal = await fetch(`${BASE_URL}/V1/invoice/searchInvoiceTotal?invoice_id=${invoiceId}&location=${currentLocation}`);
            const totalData = await resTotal.json();
            
            // Safety check for array response
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

    // 3. Save Payment Logic
    const handleSavePayment = async () => {
        const totalEntered = Object.values(newPayment).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
        if (totalEntered <= 0) return Swal.fire("Invalid Amount", "Please enter a payment value", "warning");

        setLoading(true);
        try {
            const endpoint = newPayment.card > 0 && selectedTerminal !== 'OFFLINE' 
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
            // console.log("SAVE IPD PAYMENT PAYLOAD:", payload);
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status) {
                Swal.fire("Success", result.message, "success");
                setShowAddRow(false);
                handleViewBillDetails(); // Refresh list
            } else {
                Swal.fire("Failed", result.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server communication failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const terminalOptions = ['HDFC', 'PINE LABS', 'OFFLINE', 'BHARATPE 1', 'BHARATPE 2'];

    return (
        <div className="themebody-wrap custom-ipd-styles">
            <PageBreadcrumb pagename="IPD Payment Data" />
            <NavbarIpdBills />
            <Container fluid>
                <Row>
                    <Col>
                        {/* Search Section */}
                        <Card className="shadow-sm border-cyan mb-4 overflow-visible">
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
                                            <ListGroup className="position-absolute w-100 z-index-dropdown shadow custom-list">
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
                                        <Form.Label className="label-style">UID No</Form.Label>
                                        <Form.Control readOnly value={patientDetails.uhid} className="input-style" />
                                    </Col>
                                    <Col lg={2} md={6} className="mb-3">
                                        <Button variant="info" className="w-100 text-white fw-bold btn-view" disabled={!invoiceId || loading} onClick={handleViewBillDetails}>
                                            {loading ? <Spinner size="sm" /> : "View Bill Details"}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {showBillDetails && (
                            <Card className="shadow-sm border-0 overflow-hidden">
                                <div className="summary-header">
                                    <span><FaListUl className="me-2"/>Bill: ₹{summary.totalBill}</span>
                                    <span><FaTasks className="me-2"/>Insurance: ₹{summary.insuranceApproved}</span>
                                    <span className="fw-bold">Payable: ₹{summary.patientPayable}</span>
                                    <span className="bg-danger px-2 rounded">Due: ₹{summary.totalDue}</span>
                                </div>
                                <Card.Body>
                                    <Table responsive hover size="sm" className="text-center align-middle custom-table">
                                        <thead>
                                            <tr>
                                                <th>Sr</th><th>Date</th><th>Cash</th><th>Card</th><th>Chq</th><th>Onl</th><th>Int. Disc</th><th>Hosp. Disc</th><th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((pay, idx) => (
                                                <tr key={pay.ipdpaymentid}>
                                                    <td>{idx + 1}</td>
                                                    <td>{pay.receipt_date?.split('T')[0]}</td>
                                                    <td>₹{pay.cashamt}</td>
                                                    <td>₹{pay.cardamt}</td>
                                                    <td>₹{pay.chequeamt}</td>
                                                    <td>₹{pay.onlineamt}</td>
                                                    <td>₹{pay.discountamt}</td>
                                                    <td>₹{pay.tdsamt}</td>
                                                    <td><Button variant="outline-primary" size="sm"><FaPrint/></Button></td>
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
                                        <Button className="btn-add" onClick={() => setShowAddRow(!showAddRow)}><FaPlus/></Button>
                                    </div>

                                    {showAddRow && (
                                        <div className="mt-3 p-3 border rounded bg-white add-payment-box">
                                            <Row className="g-2">
                                                <Col md={2}><Form.Control type="date" className="input-style" value={newPayment.date} onChange={e => setNewPayment({...newPayment, date: e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="Cash" className="input-style" onChange={e => setNewPayment({...newPayment, cash: +e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="Card" className="input-style" onChange={e => setNewPayment({...newPayment, card: +e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="Chq" className="input-style" onChange={e => setNewPayment({...newPayment, cheque: +e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="Onl" className="input-style" onChange={e => setNewPayment({...newPayment, online: +e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="Int.D" className="input-style" onChange={e => setNewPayment({...newPayment, internalDiscount: +e.target.value})} /></Col>
                                                <Col><Form.Control type="number" placeholder="TDS" className="input-style" onChange={e => setNewPayment({...newPayment, tds: +e.target.value})} /></Col>
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
                .label-style { font-size: 13px; fontWeight: 600; color: #00838f; }
                .input-style { border-radius: 10px; border: 1px solid #80deea; }
                .border-cyan { border: 1px solid #00bcd4; }
                .z-index-dropdown { z-index: 1050; }
                .summary-header {
                    background: linear-gradient(to right, #00acc1, #00bcd4);
                    padding: 12px 20px;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 15px;
                    font-weight: 600;
                    color: white;
                }
                .custom-table thead { background-color: #e0f7fa; color: #006064; }
                .btn-view { background-color: #00bcd4; border: none; height: 38px; border-radius: 10px; }
                .btn-add { background-color: #00bcd4; border: none; border-radius: 6px; }
                .btn-save { background-color: #00bcd4; border: none; font-weight: 600; }
                .text-cyan-dark { color: #00838f; }
                .custom-list .list-group-item:hover { background-color: #e0f7fa; }
            `}</style>
        </div>
    );
};

export default IpdPaymentData;