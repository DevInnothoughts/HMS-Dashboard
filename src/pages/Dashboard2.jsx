import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { Row, Col, Card, Table, Container } from "react-bootstrap";
import PageBreadcrumb from "../componets/PageBreadcrumb";
import Chart from "react-apexcharts";
import { doctskill, Gallerydata } from "./js/Dashboard2";

import IMAGE_URLS from "/src/pages/api/Imgconfig.js";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
      <button
        className="btn btn-link p-0"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        «
      </button>

      <button
        className="btn btn-link p-0"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>

      <span
        className="px-2"
        style={{
          backgroundColor: "#e9ecef",
          padding: "2px 8px",
          borderRadius: "4px",
        }}
      >
        {currentPage}
      </span>

      <button
        className="btn btn-link p-0"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>

      <button
        className="btn btn-link p-0"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        »
      </button>

      <span className="ms-2">
        Showing {(currentPage - 1) * appointmentsPerPage + 1} to{" "}
        {Math.min(currentPage * appointmentsPerPage, totalItems)} of{" "}
        {totalItems}
      </span>
    </div>
  );
};

export default function Dashboard2() {
  const [appointments, setAppointments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const appointmentsPerPage = 5;
  const BASE_URL = "http://194.195.117.79:5000/api";

  // Function to fetch today's appointments
  const fetchTodayAppointments = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/V1/appointment/listappointments?page=${page}&limit=${appointmentsPerPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data.data || []);
      setTotalItems(data.total);
      setTotalPages(Math.ceil(data.total / appointmentsPerPage));
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {});
    fetchTodayAppointments(1);
    return () => {
      Fancybox.destroy();
    };
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTodayAppointments(page);
  };

  return (
    <div className="themebody-wrap">
      {/* Breadcrumb Start */}
      <PageBreadcrumb pagename="Doctor Dashboard" />
      {/* Breadcrumb End */}
      {/* theme body start */}
      <div className="theme-body">
        <Container fluid className="cdxuser-profile">
          <Row>
            <Col xxl={4} md={6}>
              <Card className="doctor-probox">
                <div className="img-wrap"></div>
                <Card.Body>
                  <div className="profile-head">
                    <div className="proimg-wrap">
                      <img
                        className="img-fluid"
                        src={IMAGE_URLS["avtar/1.jpg"]}
                        alt=""
                      />
                    </div>
                    <h4>Elizabeth Blackwell</h4>
                    <span>Cardiologists</span>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                      sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam,{" "}
                    </p>
                    <div className="group-btn">
                      <Link
                        className="btn btn-primary"
                        href="javascript:void(0);"
                      >
                        Send Email
                      </Link>
                      <Link
                        className="btn btn-secondary"
                        href="javascript:void(0);"
                      >
                        Send Message
                      </Link>
                    </div>
                  </div>
                </Card.Body>
                <ul className="docactivity-list">
                  <li>
                    <h4>2000</h4>
                    <span>Operations</span>
                  </li>
                  <li>
                    <h4>99</h4>
                    <span>Hospital</span>
                  </li>
                  <li>
                    <h4>9999</h4>
                    <span>Patients</span>
                  </li>
                </ul>
              </Card>
            </Col>
            <Col xxl={4} md={6}>
              <Card>
                <Card.Header>
                  <h4>Today's Appointments</h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <div
                    className="table-responsive"
                    style={{ height: "400px", overflowY: "auto" }}
                  >
                    <Table className="table-borderless mb-0">
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          background: "white",
                          zIndex: 1,
                        }}
                      >
                        <tr>
                          <th className="px-3 py-2">Patient Name</th>
                          <th className="px-3 py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="2" className="text-center py-3">
                              Loading...
                            </td>
                          </tr>
                        ) : appointments.length > 0 ? (
                          appointments.map((appointment, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2">
                                <div className="d-flex align-items-center">
                                  <span>{appointment.patientName}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                {appointment.appointmentTime}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-3">
                              No appointments for today
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="p-3 border-top">
                      <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </Card.Body>
                <div className="card-footer">
                  <Link
                    to="/appointment-list"
                    className="btn btn-primary d-block mx-auto"
                  >
                    View All Appointments
                  </Link>
                </div>
              </Card>
            </Col>
            <Col xxl={4} md={6}>
              <div className="card">
                <Card.Header>
                  <h4>Skill</h4>
                </Card.Header>
                <Card.Body>
                  <Chart
                    options={doctskill}
                    series={doctskill.series}
                    height={410}
                    type="pie"
                  />
                </Card.Body>
              </div>
            </Col>
            <Col xxl={4} md={6}>
              <div className="card">
                <Card.Header>
                  <h4>Personal Information</h4>
                </Card.Header>
                <Card.Body>
                  <ul className="contact-list">
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="user" />
                      </div>
                      <h6> Alex Spencer</h6>
                    </li>
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="bookmark" />
                      </div>
                      <h6> Senior doctor</h6>
                    </li>
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="phone-call" />
                      </div>
                      <h6>
                        {" "}
                        <Link href="tel:+9588489584">+9588489584</Link>
                      </h6>
                    </li>
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="mail" />
                      </div>
                      <h6>
                        {" "}
                        <Link href="mailto:test@example.com">
                          test@example.com
                        </Link>
                      </h6>
                    </li>
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="map-pin" />
                      </div>
                      <h6> live in uk</h6>
                    </li>
                    <li>
                      <div className="iocn-item">
                        <FeatherIcon icon="globe" />
                      </div>
                      <h6> https://medixo.com</h6>
                    </li>
                  </ul>
                </Card.Body>
              </div>
            </Col>
            <Col xxl={4} md={6}>
              <div className="card">
                <Card.Header>
                  <h4>Speciality</h4>
                </Card.Header>
                <Card.Body>
                  <ul className="speciality-list">
                    <li>
                      <div className="media">
                        <div className="icon-wrap bg-primary">
                          <i className="fa fa-trophy"></i>
                        </div>
                        <div className="media-body">
                          <h6>Certified</h6>
                          <span className="text-light">
                            Cold Laser Operation
                          </span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="media">
                        <div className="icon-wrap bg-primary">
                          <i className="fa fa-trophy"></i>
                        </div>
                        <div className="media-body">
                          <h6>professional</h6>
                          <span className="text-light">
                            Certified Skin Treatment
                          </span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="media">
                        <div className="icon-wrap bg-primary">
                          <i className="fa fa-trophy"></i>
                        </div>
                        <div className="media-body">
                          <h6>Medication Laser</h6>
                          <span className="text-light">Hair Lose Product </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </Card.Body>
              </div>
            </Col>
            <Col xxl={4} md={6}>
              <div className="card doct-skill">
                <Card.Header>
                  <h4>Doctors Abilities</h4>
                </Card.Header>
                <Card.Body>
                  <div className="progress-group progressCounter">
                    <h6>
                      Operations{" "}
                      <span>
                        <span className="count">50</span>%
                      </span>
                    </h6>
                    <div className="progress">
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-group progressCounter">
                    <h6>
                      Theraphy{" "}
                      <span>
                        <span className="count">80</span>%
                      </span>
                    </h6>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-group progressCounter">
                    <h6>
                      Mediation
                      <span>
                        <span className="count">40</span>%
                      </span>
                    </h6>
                    <div className="progress">
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="progress-group progressCounter">
                    <h6>
                      Colestrol
                      <span>
                        <span className="count">60</span>%
                      </span>
                    </h6>
                    <div className="progress">
                      <div
                        className="progress-bar bg-info"
                        style={{ width: "90%" }}
                      ></div>
                    </div>
                  </div>
                </Card.Body>
              </div>
            </Col>
            <Col xxl={4} xl={12}>
              <div className="card">
                <Card.Header>
                  <h4>
                    {" "}
                    <i className="fa fa-picture-o"></i>Gallery
                  </h4>
                </Card.Header>
                <Card.Body>
                  <ul className="gallerypost-list">
                    {Gallerydata.map((galleryitem, index) => {
                      const imgSrc = IMAGE_URLS[galleryitem.imgsrc];
                      return (
                        <li key={index}>
                          <a
                            data-fancybox="gallery"
                            data-src={imgSrc}
                            data-caption=""
                          >
                            <img
                              className="img-fluid"
                              src={imgSrc}
                              alt="gallery"
                            />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </Card.Body>
              </div>
            </Col>
            <Col xxl={8} xl={12}>
              <div className="card">
                <Card.Header>
                  <h4>Appointment</h4>
                </Card.Header>
                <Card.Body>
                  <Table className="patients-tbl table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Time </th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tiger Nixon</td>
                        <td>+2 40 305060</td>
                        <td>example@email.com</td>
                        <td>05/06/2023</td>
                        <td>08:00 Am</td>
                        <td>
                          {" "}
                          <span className="badge badge-success">start</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Brielle Williamson</td>
                        <td>+3 20 456589</td>
                        <td>example@email.com</td>
                        <td>08/09/2023</td>
                        <td>09:00 Am </td>
                        <td>
                          {" "}
                          <span className="badge badge-success">start</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Cedric Kelly</td>
                        <td>+1 36 121390</td>
                        <td>example@email.com</td>
                        <td>10/11/2023</td>
                        <td>10:00 Am </td>
                        <td>
                          {" "}
                          <span className="badge badge-danger">Canclled</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Charde Marshall</td>
                        <td>+6 30 208060</td>
                        <td>example@email.com</td>
                        <td>12/06/2023</td>
                        <td>11:00 Am </td>
                        <td>
                          {" "}
                          <span className="badge badge-danger">Canclled</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Dai Rios</td>
                        <td>+1 50 456589</td>
                        <td>example@email.com</td>
                        <td>02/02/2023</td>
                        <td>12:00 Am </td>
                        <td>
                          {" "}
                          <span className="badge badge-info">pending</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Garrett Winters</td>
                        <td>+2 20 558890</td>
                        <td>example@email.com</td>
                        <td>08/12/2023</td>
                        <td>02:00 Pm </td>
                        <td>
                          {" "}
                          <span className="badge badge-info">pending</span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Gloria Little</td>
                        <td>+5 20 608022</td>
                        <td>example@email.com</td>
                        <td>12/02/2023</td>
                        <td>03:00 Pm </td>
                        <td>
                          {" "}
                          <span className="badge badge-warning">
                            re schedule
                          </span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td>Jena Gaines</td>
                        <td>+3 22 588829</td>
                        <td>example@email.com</td>
                        <td>10/12/2023</td>
                        <td>04:00 Pm </td>
                        <td>
                          {" "}
                          <span className="badge badge-warning">
                            re schedule
                          </span>
                        </td>
                        <td>
                          <Link href="edit-appointment.html">
                            <FeatherIcon icon="edit" className="w-18" />
                          </Link>
                          <Link
                            className="text-danger ml-8"
                            href="javascript:void(0);"
                          >
                            <FeatherIcon icon="trash-2" className="w-18" />
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* theme body end */}
    </div>
  );
}
