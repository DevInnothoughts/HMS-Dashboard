import React from "react";
import { Container, Card } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import SimpleBar from "simplebar-react";

export default function SuperAdminDashboard() {
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
      <PageBreadcrumb pagename="SuperAdmin Dashboard" />

      <SimpleBar className="theme-body common-dash">
        <Container fluid>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "65vh",
              padding: "20px 0",
            }}
          >
            <Card
              style={{
                maxWidth: "600px",
                width: "100%",
                borderRadius: "16px",
                border: "2px solid #00bcd4",
                boxShadow: "0px 10px 25px rgba(0, 188, 212, 0.15)",
                background: "#ffffff",
                textAlign: "center",
                padding: "40px 30px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 20px auto",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00838f",
                  fontSize: "36px",
                  boxShadow: "0 4px 12px rgba(0, 172, 193, 0.2)",
                }}
              >
                <i className="fa fa-cogs"></i>
              </div>

              <h2
                style={{
                  color: "#006064",
                  fontWeight: "700",
                  fontSize: "24px",
                  marginBottom: "10px",
                  letterSpacing: "0.5px",
                }}
              >
                Dashboard Under Development
              </h2>

              <p
                style={{
                  color: "#546e7a",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  marginBottom: "20px",
                }}
              >
                The Super Admin dashboard is currently under construction. Administrative controls, high-level metrics, and multi-branch reports will be available soon.
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "6px 18px",
                  background: "#e0f7fa",
                  borderRadius: "20px",
                  border: "1px solid #4dd0e1",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#00838f",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <i className="fa fa-info-circle me-1"></i> Coming Soon
              </div>
            </Card>
          </div>
        </Container>
      </SimpleBar>
    </div>
  );
}
