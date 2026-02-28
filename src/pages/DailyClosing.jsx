import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import PageBreadcrumb from "../components/PageBreadcrumb";
import Swal from "sweetalert2";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const DailyClosing = () => {
    const [currentDate, setCurrentDate] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        opdCash: "",
        ipdCash: "",
        pharmacyCash: "",
        upiSettlement: "",
        cardSettlement: "",
        bankDeposit: ""
    });

    useEffect(() => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const dateStr = `${dd}-${mm}-${yyyy}`;
        setCurrentDate(dateStr);

        // Check for existing submission for today
        const savedData = localStorage.getItem("hms_daily_closing");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.date === dateStr) {
                setFormData(parsed.data);
                setIsSubmitted(true);
            } else {
                // It's a new day, clear old data
                localStorage.removeItem("hms_daily_closing");
                setIsSubmitted(false);
            }
        }
    }, []);

    const handleChange = (e) => {
        if (isSubmitted) return;
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        const submission = {
            date: currentDate,
            data: formData,
            isSubmitted: true
        };
        localStorage.setItem("hms_daily_closing", JSON.stringify(submission));
        setIsSubmitted(true);

        Toast.fire({
            icon: "success",
            title: "Daily closing saved successfully",
        });
    };

    return (
        <div className="themebody-wrap" style={{ background: "linear-gradient(to right, #e0f7fa, #80deea)", minHeight: "100vh", padding: "10px", fontFamily: "'Poppins', Arial, sans-serif" }}>
            <PageBreadcrumb pagename="Daily Closing" />
            <Container fluid>
                <Row>
                    <Col>
                        <Card style={{ borderRadius: "12px", boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)", borderColor: "#00bcd4", background: "white", border: "1px solid #00bcd4" }}>
                            <Card.Header style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid #4dd0e1", padding: "10px 15px", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                                <i className="fa fa-list" style={{ marginRight: "8px", color: "#333" }}></i>
                                <h5 style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#333", textTransform: "uppercase" }}>DATEWISE CASH COLLECTION</h5>
                            </Card.Header>
                            <Card.Body style={{ padding: "0" }}>
                                <Table striped bordered hover responsive style={{ margin: 0, fontSize: "14px" }}>
                                    <thead>
                                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center", whiteSpace: "nowrap", minWidth: "120px" }}>Date</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>OPD Cash</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>IPD Cash</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>Pharmacy Cash</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>UPI Settlement</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>Card Settlement</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>Bank Deposit</th>
                                            <th style={{ border: "1px solid #4dd0e1", color: "#333", fontWeight: "bold", padding: "12px 10px", textAlign: "center" }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ backgroundColor: "white" }}>
                                            <td style={{ border: "1px solid #4dd0e1", verticalAlign: "middle", textAlign: "center", fontWeight: "600", color: "#333", fontSize: "14px", padding: "12px", whiteSpace: "nowrap" }}>{currentDate}</td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="opdCash"
                                                    value={formData.opdCash}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="ipdCash"
                                                    value={formData.ipdCash}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="pharmacyCash"
                                                    value={formData.pharmacyCash}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="upiSettlement"
                                                    value={formData.upiSettlement}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="cardSettlement"
                                                    value={formData.cardSettlement}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", padding: "8px", verticalAlign: "middle" }}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="0.00"
                                                    name="bankDeposit"
                                                    value={formData.bankDeposit}
                                                    onChange={handleChange}
                                                    readOnly={isSubmitted}
                                                    style={{ border: "1px solid #4dd0e1", borderRadius: "8px", padding: "8px", fontSize: "13px", textAlign: "center", transition: "all 0.3s ease", boxShadow: "none", cursor: isSubmitted ? "not-allowed" : "text", backgroundColor: isSubmitted ? "#f8f9fa" : "white" }}
                                                    onFocus={(e) => !isSubmitted && (e.target.style.borderColor = "#00bcd4")}
                                                    onBlur={(e) => !isSubmitted && (e.target.style.borderColor = "#4dd0e1")}
                                                />
                                            </td>
                                            <td style={{ border: "1px solid #4dd0e1", textAlign: "center", verticalAlign: "middle", padding: "12px" }}>
                                                <Button
                                                    variant="success"
                                                    onClick={handleSave}
                                                    disabled={isSubmitted}
                                                    style={{ borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "bold", backgroundColor: isSubmitted ? "#ccc" : "#00bcd4", borderColor: isSubmitted ? "#ccc" : "#00bcd4", boxShadow: isSubmitted ? "none" : "0 2px 4px rgba(0,0,0,0.1)", transition: "all 0.3s ease", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", justifyContent: "center", cursor: isSubmitted ? "not-allowed" : "pointer" }}
                                                >
                                                    <FeatherIcon icon={isSubmitted ? "check-circle" : "save"} size="14" className="me-1" />
                                                    {isSubmitted ? "SUBMITTED" : "SAVE"}
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DailyClosing;
