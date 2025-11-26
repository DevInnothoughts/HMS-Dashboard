import React from "react";
// Import React Big Calendar components
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Row, Col, Card, Container } from "react-bootstrap";
import PageBreadcrumb from "../../components/PageBreadcrumb";

// Initialize the localizer for React Big Calendar
const localizer = momentLocalizer(moment);

// Helper function to convert your existing event format
const formatEventsForRBC = (events) => {
    return events.map(event => {
        // RBC requires Date objects for start and end
        return {
            ...event,
            start: new Date(event.start),
            // Ensure end date exists, otherwise set it to start date
            end: event.end ? new Date(event.end) : moment(event.start).add(1, 'hour').toDate(),
            // RBC uses title property
            title: event.title,
        };
    });
};


export default function Event_management() {
  const rawEvents = [
    {
      title: "All Day Event",
      start: "2024-08-01",
    },
    {
      title: "Long Event",
      start: "2024-08-07",
      end: "2024-08-10",
    },
    {
      id: 999,
      title: "Repeating Event",
      start: "2024-08-09T16:00:00",
    },
    {
      id: 999,
      title: "Repeating Event",
      start: "2024-08-16T16:00:00",
    },
    {
      title: "Conference",
      start: "2024-08-11",
      end: "2024-08-13",
    },
    {
      title: "Meeting",
      start: "2024-08-12T10:30:00",
      end: "2024-08-12T12:30:00",
    },
    {
      title: "Birthday Party",
      start: "2024-08-13T07:00:00",
    },
    {
      title: "Click for Google",
      url: "http://google.com/",
      start: "2024-08-28",
    },
  ];

  // Format events once
  const events = formatEventsForRBC(rawEvents);
  
  // Custom styling for RBC events based on their title/type (optional)
  const eventPropGetter = (event) => {
    let backgroundColor = '#3174ad'; // RBC default color
    if (event.title.includes('Birthday')) {
      backgroundColor = '#007bff'; // Primary
    } else if (event.title.includes('Meeting')) {
      backgroundColor = '#6c757d'; // Secondary
    } else if (event.title.includes('Conference')) {
      backgroundColor = '#28a745'; // Success
    }

    return {
      style: {
        backgroundColor: backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      },
    };
  };


  return (
    <div className="themebody-wrap">
      {/* Breadcrumb Start */}
      <PageBreadcrumb pagename="Event management" />
      {/* Breadcrumb End */}
      {/* theme body start */}
      <div className="theme-body codex-calendar">
        <Container fluid>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    {/* Event List (Sidebar remains the same) */}
                    <Col xxl={3}>
                      <ul className="events-list" id="codex-events-list">
                        <li className="fc-event bg-primary">
                          <i className="fa fa-birthday-cake"></i>Birthday Party
                        </li>
                        <li className="fc-event bg-secondary">
                          <i className="fa fa-handshake-o"></i>Metting
                        </li>
                        <li className="fc-event bg-success">
                          <i className="fa fa-graduation-cap"></i>Holidays
                        </li>
                        <li className="fc-event bg-warning">
                          <i className="fa fa-bus"></i>Travel
                        </li>
                        <li className="fc-event bg-info">
                          <i className="fa fa-building-o"></i>Company
                        </li>
                      </ul>
                    </Col>
                    
                    {/* React Big Calendar Component */}
                    <Col xxl={9}>
                      <div id="rbc-calendar-container" className="codex-calendar" style={{ height: '600px' }}>
                        <Calendar
                          localizer={localizer}
                          events={events}
                          // RBC uses defaultDate (Date object) to set the initial view date
                          defaultDate={new Date('2024-08-12')} 
                          // RBC uses defaultView (string) to set the starting view
                          defaultView="month" 
                          
                          // Configuration for views
                          views={['month', 'week', 'day', 'agenda']}
                          
                          // Accessor props (default names, match your formatted events)
                          startAccessor="start"
                          endAccessor="end"
                          titleAccessor="title"
                          
                          // Enable drag and drop/resizing (requires additional RBC package, but set here for functionality parity)
                          // draggableAccessor={event => true} 
                          // editable={true} // Not a direct RBC prop, handled by separate components

                          // Custom style for events
                          eventPropGetter={eventPropGetter}
                          
                          // Style for the container (RBC requires a height)
                          style={{ height: '100%' }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        {/* theme body end */}
      </div>
    </div>
  );
}