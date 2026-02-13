import React, { useState, useEffect, useRef } from 'react';
import NavbarIpdBills from '../../components/NavbarIpdBills';
import { Container, Card, Row, Col, Form, Button, InputGroup, ListGroup, Table } from 'react-bootstrap';
import PageBreadcrumb from '../../components/PageBreadcrumb';
import { FaPrint, FaPlus, FaListUl, FaTasks } from 'react-icons/fa';

const IpdPaymentData = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [patientName, setPatientName] = useState('');
    const [uhid, setUhid] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isInvoiceFound, setIsInvoiceFound] = useState(false);
    const [showBillDetails, setShowBillDetails] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState('HDFC');
    const dropdownRef = useRef(null);

    // Mock data for payments
    const [payments, setPayments] = useState([
        { srNo: 1, date: '13-02-2026', cash: 27000, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 2, date: '02-02-2026', cash: 20000, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 3, date: '01-02-2026', cash: 1000, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 4, date: '25-01-2026', cash: 1000, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 5, date: '31-12-2025', cash: 500, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 6, date: '31-12-2025', cash: 500, card: 0, cheque: 0, online: 0, internalDiscount: 0, hospitalDiscount: 0 },
        { srNo: 7, date: '11-07-2025', cash: 30000, card: 0, cheque: 0, online: 30000, internalDiscount: 0, hospitalDiscount: 0 },
    ]);

    // Summary mock values
    const summary = {
        totalBill: 110000,
        insuranceApproved: 50000,
        patientPayable: 60000,
        totalDue: 0
    };

    // Mock data for invoice search
    const mockInvoices = [
        { id: 'INV-001', name: 'John Doe', uhid: 'UHID-12345' },
        { id: 'INV-002', name: 'Jane Smith', uhid: 'UHID-67890' },
        { id: 'INV-003', name: 'Robert Brown', uhid: 'UHID-11223' },
        { id: 'INV-101', name: 'Alice Johnson', uhid: 'UHID-44556' },
    ];

    useEffect(() => {
        if (invoiceId.trim() === '') {
            setSearchResults([]);
            setShowDropdown(false);
            setPatientName('');
            setUhid('');
            setIsInvoiceFound(false);
            setShowBillDetails(false);
            return;
        }

        const filtered = mockInvoices.filter(inv =>
            inv.id.toLowerCase().includes(invoiceId.toLowerCase())
        );
        setSearchResults(filtered);
        setShowDropdown(true);

        const perfectMatch = mockInvoices.find(inv => inv.id.toLowerCase() === invoiceId.toLowerCase());
        if (perfectMatch) {
            setPatientName(perfectMatch.name);
            setUhid(perfectMatch.uhid);
            setIsInvoiceFound(true);
        } else {
            setPatientName('');
            setUhid('');
            setIsInvoiceFound(false);
            setShowBillDetails(false);
        }
    }, [invoiceId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectInvoice = (invoice) => {
        setInvoiceId(invoice.id);
        setPatientName(invoice.name);
        setUhid(invoice.uhid);
        setIsInvoiceFound(true);
        setShowDropdown(false);
    };

    const handleViewBillDetails = () => {
        if (isInvoiceFound) {
            setShowBillDetails(true);
        }
    };

    const terminalOptions = ['HDFC', 'PINE LABS', 'OFFLINE', 'BHARATPE 1', 'BHARATPE 2'];

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
            <PageBreadcrumb pagename="IPD Payment Data" />
            <NavbarIpdBills />
            <Container fluid>
                <Row>
                    <Col>
                        {/* Search Card */}
                        <Card
                            style={{
                                borderRadius: "8px",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                background: "white",
                                border: "1px solid #00bcd4",
                                padding: "5px",
                                overflow: "visible",
                                marginBottom: "20px"
                            }}
                        >
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col lg={3} md={6} className="mb-3 position-relative" ref={dropdownRef}>
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: "600", color: "#00838f" }}>Enter Invoice ID</Form.Label>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Search Invoice ID"
                                                    value={invoiceId}
                                                    onChange={(e) => setInvoiceId(e.target.value)}
                                                    onFocus={() => invoiceId && setShowDropdown(true)}
                                                    style={{ borderRadius: "8px", border: "1px solid #80deea" }}
                                                />
                                            </InputGroup>
                                        </Form.Group>

                                        {showDropdown && (
                                            <ListGroup
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '15px',
                                                    right: '15px',
                                                    zIndex: 1000,
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    borderRadius: '0 0 8px 8px'
                                                }}
                                            >
                                                {searchResults.length > 0 ? (
                                                    searchResults.map((inv) => (
                                                        <ListGroup.Item
                                                            key={inv.id}
                                                            action
                                                            onClick={() => handleSelectInvoice(inv)}
                                                            style={{ cursor: 'pointer', fontSize: '14px' }}
                                                        >
                                                            {inv.id} - {inv.name}
                                                        </ListGroup.Item>
                                                    ))
                                                ) : (
                                                    <ListGroup.Item style={{ color: 'red', fontSize: '14px' }}>
                                                        No invoice found
                                                    </ListGroup.Item>
                                                )}
                                            </ListGroup>
                                        )}
                                    </Col>

                                    <Col lg={3} md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: "600", color: "#00838f" }}>Patient Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={patientName}
                                                readOnly
                                                style={{ borderRadius: "8px", backgroundColor: "#f5f5f5", cursor: "not-allowed", border: "1px solid #80deea" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={2} md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label style={{ fontWeight: "600", color: "#00838f" }}>UID No</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={uhid}
                                                readOnly
                                                style={{ borderRadius: "8px", backgroundColor: "#f5f5f5", cursor: "not-allowed", border: "1px solid #80deea" }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={2} md={6} className="mb-3">
                                        <Button
                                            variant="info"
                                            disabled={!isInvoiceFound}
                                            onClick={handleViewBillDetails}
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                backgroundColor: isInvoiceFound ? "#00bcd4" : "#b2ebf2",
                                                borderColor: isInvoiceFound ? "#00bcd4" : "#b2ebf2",
                                                color: "white",
                                                height: "38px"
                                            }}
                                        >
                                            View Bill Details
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Bill Details Section */}
                        {showBillDetails && (
                            <Card style={{ borderRadius: "8px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", border: "none" }}>
                                <Card.Body style={{ padding: "0" }}>
                                    {/* Summary Header */}
                                    <div style={{
                                        background: "linear-gradient(to right, #00acc1, #00bcd4)",
                                        padding: "12px 20px",
                                        borderRadius: "8px 8px 0 0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        color: "white"
                                    }}>
                                        <div className="d-flex align-items-center"><FaListUl className="me-2" /> Total Bill : ₹{summary.totalBill}</div>
                                        <div className="d-flex align-items-center"><FaTasks className="me-2" /> Insurance Approved: ₹{summary.insuranceApproved}</div>
                                        <div>Patient Payable : ₹{summary.patientPayable}</div>
                                        <div>Total Due : ₹{summary.totalDue}</div>
                                    </div>

                                    {/* Payments Table */}
                                    <div style={{ padding: "15px" }}>
                                        <Table responsive hover className="mb-0" style={{ fontSize: "13px" }}>
                                            <thead style={{ backgroundColor: "#e0f7fa", color: "#006064", borderBottom: "2px solid #80deea" }}>
                                                <tr>
                                                    <th className="py-3">Sr.No</th>
                                                    <th className="py-3">Date</th>
                                                    <th className="py-3">Cash</th>
                                                    <th className="py-3">Card</th>
                                                    <th className="py-3">Cheque</th>
                                                    <th className="py-3">Online</th>
                                                    <th className="py-3">Internal Discount</th>
                                                    <th className="py-3">Hospital Discount</th>
                                                    <th className="py-3">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map((pay) => (
                                                    <tr key={pay.srNo} style={{ borderBottom: "1px solid #e0f2f1" }}>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <div style={{ padding: "6px", border: "1px solid #b2ebf2", borderRadius: "4px", width: "40px", textAlign: "center", backgroundColor: "#f0fbff", color: "#00838f", fontWeight: "600" }}>{pay.srNo}</div>
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={pay.date} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.cash}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.card}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.cheque}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.online}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.internalDiscount}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Form.Control size="sm" readOnly value={`₹${pay.hospitalDiscount}`} style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0" }} />
                                                        </td>
                                                        <td style={{ verticalAlign: "middle" }}>
                                                            <Button size="sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", backgroundColor: "#00838f", borderColor: "#00838f", color: "white" }}>
                                                                <FaPrint />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>

                                        {/* PoS Terminal and Add button */}
                                        <div className="d-flex justify-content-between align-items-center mt-4 px-3" style={{ padding: "15px", backgroundColor: "#f5fcfd", borderRadius: "8px", border: "1px solid #e0f7fa" }}>
                                            <div className="d-flex align-items-center" style={{ fontSize: "14px", fontWeight: "700", color: "#006064" }}>
                                                <span className="me-4">Select PoS Terminal :</span>
                                                <div className="d-flex">
                                                    {terminalOptions.map(option => (
                                                        <Form.Check
                                                            key={option}
                                                            type="radio"
                                                            label={option}
                                                            name="terminal"
                                                            id={`terminal-${option}`}
                                                            checked={selectedTerminal === option}
                                                            onChange={() => setSelectedTerminal(option)}
                                                            className="me-4"
                                                            style={{ fontWeight: "600", color: "#00838f" }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                variant="info"
                                                size="sm"
                                                onClick={() => setShowAddRow(!showAddRow)}
                                                style={{ width: "32px", height: "32px", borderRadius: "6px", padding: 0, backgroundColor: "#00bcd4", borderColor: "#00bcd4", color: "white" }}
                                            >
                                                <FaPlus size={14} />
                                            </Button>
                                        </div>

                                        {/* Add Payment Row */}
                                        {showAddRow && (
                                            <div style={{ marginTop: "15px", padding: "5px", border: "1px solid #80deea", borderRadius: "8px", backgroundColor: "#fff" }}>
                                                {/* <h6 style={{ color: "#007c91", fontWeight: "700", marginBottom: "15px" }}>Add New Payment Entry</h6> */}
                                                <Table responsive borderless style={{ fontSize: "13px" }}>
                                                    <thead style={{ backgroundColor: "#f0fbff", color: "#00838f" }}>
                                                        <tr>
                                                            <th>Sr.No</th>
                                                            <th>Date</th>
                                                            <th>Cash</th>
                                                            <th>Card</th>
                                                            <th>Cheque</th>
                                                            <th>Online</th>
                                                            <th>Internal Discount</th>
                                                            <th>Hospital Discount</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <div style={{ padding: "6px", border: "1px solid #80deea", borderRadius: "4px", width: "40px", textAlign: "center", backgroundColor: "#e0f7fa", color: "#00838f", fontWeight: "600" }}>{payments.length + 1}</div>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <Form.Control
                                                                    size="sm"
                                                                    type="date"
                                                                    defaultValue={new Date().toISOString().split('T')[0]}
                                                                    style={{ border: "1px solid #80deea" }}
                                                                />
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <InputGroup size="sm">
                                                                    <InputGroup.Text style={{ backgroundColor: "#e0f7fa", border: "1px solid #80deea", color: "#00838f" }}>₹</InputGroup.Text>
                                                                    <Form.Control type="number" defaultValue="0" style={{ border: "1px solid #80deea" }} />
                                                                </InputGroup>
                                                            </td>
                                                            <td style={{ verticalAlign: "middle" }}>
                                                                <Button size="sm" style={{ backgroundColor: "#00bcd4", borderColor: "#00bcd4", fontWeight: "600", width: "100%" }}>
                                                                    Save
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default IpdPaymentData;
