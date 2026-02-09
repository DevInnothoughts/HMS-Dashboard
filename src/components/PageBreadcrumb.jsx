import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Container } from 'react-bootstrap';


export default function PageBreadcrumb(props) {
    // const [time, setTime] = useState(new Date().toLocaleTimeString());
    // const today = new Date(); // Get the current date
    // const formattedDate = today.toLocaleDateString(); // Format the date
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const today = new Date();
    // Format the date as dd/mm/yyyy
    const formattedDate = today.toLocaleDateString("en-GB"); // Use 'en-GB' for dd/mm/yyyy format
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, []);

    const department = localStorage.getItem("department");
    const dashboardLink = department === "IPD" ? "/ipd-dashboard" : "/reception-dashboard";

    return (

        <div className="codex-breadcrumb">
            <Container fluid>
                <div className="breadcrumb-contain">
                    <div className="left-breadcrumb">
                        <ul className="breadcrumb mb-0">
                            <li className="breadcrumb-item ">
                                <Link to={dashboardLink}>Dashboard</Link>
                            </li>
                            <li className="breadcrumb-item active">
                                <Link to={''}>{props.pagename}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="right-breadcrumb">
                        <ul>
                            <li>
                                <div className="bread-wrap">
                                    <i className="fa fa-clock-o"></i>
                                </div>
                                {time}
                            </li>
                            <li>
                                <div className="bread-wrap">
                                    <i className="fa fa-calendar"></i>
                                </div>
                                {formattedDate}
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    );
}