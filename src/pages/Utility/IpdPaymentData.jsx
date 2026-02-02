import React from 'react';
import NavbarIpdBills from '../../components/NavbarIpdBills';
import { Container, Card, Row, Col } from 'react-bootstrap';
import PageBreadcrumb from '../../components/PageBreadcrumb';

const IpdPaymentData = () => {
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
                        <Card
                            style={{
                                borderRadius: "12px",
                                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                                borderColor: "#00bcd4",
                                background: "white",
                                border: "1px solid #00bcd4",
                                padding: "20px",
                                textAlign: "center",
                                minHeight: "400px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <h4 style={{ color: "#00838f" }}>IPD Payment Data - Coming Soon</h4>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default IpdPaymentData;
