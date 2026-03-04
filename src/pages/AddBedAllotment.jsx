import React, { useState, useEffect } from "react";
import { Row, Col, Form, Container, Card, Button } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import NavbarBedAllotment from "../components/NavbarBedAllotment";
import Swal from "sweetalert2";
import "../styles/styles.css";
import PageBreadcrumb from "../components/PageBreadcrumb";
import MuiDateTimePicker from "./IPD Forms/inputs/MuiDateTimePicker";

export default function AddBedAllotment() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bedNumber: "",
        bedType: "",
        patientName: "",
        admissionDate: "",
        dischargeDate: "",
    });

    useEffect(() => {
        Swal.fire({
            title: "Information",
            text: "This feature is under development",
            icon: "info",
            confirmButtonColor: "#00bcd4",
        });
    }, []);

    const bedOptions = [
        { value: "W1", label: "W1 - General Ward" },
        { value: "W2", label: "W2 - Semi AC" },
        { value: "I1", label: "I1 - Private AC" },
        { value: "SEMI 1", label: "SEMI 1 - DELUXE" },
        { value: "SEMIZ", label: "SEMIZ - Twin Sharing" },
        { value: "SEMI3", label: "SEMI3 - Super Deluxe" },
        { value: "SEMI4", label: "SEMI4 - Suite" },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Bed Allotment added successfully.",
                confirmButtonColor: "#00bcd4",
            });
            handleCancel();
        }, 1000);
    };

    const handleCancel = () => {
        setFormData({
            bedNumber: "",
            bedType: "",
            patientName: "",
            admissionDate: "",
            dischargeDate: "",
        });
    };

    const labelStyle = {
        fontSize: "12px",
        fontWeight: "600",
        marginBottom: "5px",
        display: "block",
    };

    const inputStyle = {
        fontSize: "12px",
        borderRadius: "10px",
        border: "2px solid rgb(77, 208, 225)",
        padding: "5px 10px",
    };

    const cardHeaderStyle = {
        backgroundColor: "#67c5cfff",
        padding: "12px 20px",
        borderBottom: "2px solid #1a5b61ff",
        display: "flex",
        alignItems: "center",
    };

    return (
        <div
            className="themebody-wrap"
            style={{
                background: "linear-gradient(to right, #e0f7fa, #80deea)",
                minHeight: "105vh",
                padding: "10px",
                fontFamily: "'Poppins', sans-serif",
            }}
        >
            <PageBreadcrumb pagename="Add Bed Allotment" />
            <Container fluid>
                <Row>
                    <Col>
                        <NavbarBedAllotment />
                        <Card
                            style={{
                                borderRadius: "15px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                                border: "none",
                                background: "white",
                                overflow: "hidden",
                                minHeight: "250px",
                                margin: "5px"
                            }}
                        >
                            <div style={cardHeaderStyle}>
                                <FeatherIcon
                                    icon="plus-square"
                                    size="18"
                                    style={{ color: "#1a5b61ff", marginRight: "10px" }}
                                />
                                <h4
                                    style={{
                                        color: "#1a5b61ff",
                                        fontWeight: "600",
                                        fontSize: "1rem",
                                        margin: 0,
                                    }}
                                >
                                    Add Bed Allotment
                                </h4>
                            </div>

                            <Card.Body style={{ padding: "10px" }}>
                                <Form onSubmit={handleSubmit}>
                                    <Row className="g-3 mb-3">
                                        <Col md={4}>
                                            <Form.Label style={labelStyle}>Bed Number</Form.Label>
                                            <Form.Select
                                                name="bedNumber"
                                                style={inputStyle}
                                                value={formData.bedNumber}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Bed</option>
                                                {bedOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Label style={labelStyle}>Bed Type</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="bedType"
                                                style={inputStyle}
                                                value={formData.bedType}
                                                onChange={handleInputChange}
                                                placeholder="Enter Bed Type"
                                                required
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <Form.Label style={labelStyle}>Patient Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="patientName"
                                                style={inputStyle}
                                                value={formData.patientName}
                                                onChange={handleInputChange}
                                                placeholder="Enter Patient Name"
                                                required
                                            />
                                        </Col>
                                    </Row>

                                    <Row className="g-3 mb-4">
                                        <Col md={6}>
                                            <MuiDateTimePicker
                                                label="Admission Date and Time"
                                                value={formData.admissionDate}
                                                onChange={handleInputChange}
                                                name="admissionDate"
                                                type="datetime"
                                                labelStyle={labelStyle}
                                                required={true}
                                                placeholder="Select Admission Date & Time"
                                                style={{ marginBottom: "0px" }}
                                                inputSx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "10px",
                                                        height: "35px",
                                                        "& fieldset": {
                                                            borderWidth: "2px !important",
                                                            borderColor: "rgb(77, 208, 225) !important",
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        padding: "5px 10px !important",
                                                        fontSize: "12px !important",
                                                    },
                                                    "& .MuiIconButton-root": {
                                                        padding: "4px",
                                                        color: "#1a5b61ff",
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <MuiDateTimePicker
                                                label="Discharge Date and Time"
                                                value={formData.dischargeDate}
                                                onChange={handleInputChange}
                                                name="dischargeDate"
                                                type="datetime"
                                                labelStyle={labelStyle}
                                                required={true}
                                                placeholder="Select Discharge Date & Time"
                                                style={{ marginBottom: "0px" }}
                                                inputSx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: "10px",
                                                        height: "35px",
                                                        "& fieldset": {
                                                            borderWidth: "2px !important",
                                                            borderColor: "rgb(77, 208, 225) !important",
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        padding: "5px 10px !important",
                                                        fontSize: "12px !important",
                                                    },
                                                    "& .MuiIconButton-root": {
                                                        padding: "4px",
                                                        color: "#1a5b61ff",
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    <div className="d-flex justify-content-end gap-2" style={{ marginTop: "10px" }}>
                                        <Button
                                            variant="secondary"
                                            onClick={handleCancel}
                                            disabled
                                            style={{
                                                fontSize: "13px",
                                                borderRadius: "10px",
                                                padding: "10px 25px",
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled
                                            style={{
                                                fontSize: "13px",
                                                borderRadius: "10px",
                                                padding: "10px 25px",
                                                border: "none",
                                                backgroundColor: "#00bcd4"
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
