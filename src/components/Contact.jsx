import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

const Contact = () => {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">
                <FiMail className="me-2" />
                Contact Us
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <h5 className="text-primary">
                      <FiMail className="me-2" />
                      Email
                    </h5>
                    <p className="text-muted">hermes@example.com</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-primary">
                      <FiPhone className="me-2" />
                      Phone
                    </h5>
                    <p className="text-muted">+1 (555) 123-4567</p>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-4">
                    <h5 className="text-primary">
                      <FiMapPin className="me-2" />
                      Address
                    </h5>
                    <p className="text-muted">
                      123 AI Street<br />
                      Tech City, TC 12345
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-primary">
                      <FiClock className="me-2" />
                      Business Hours
                    </h5>
                    <p className="text-muted">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </Col>
              </Row>
              
              <hr />
              
              <div className="text-center">
                <h5 className="text-primary mb-3">Get in Touch</h5>
                <p className="text-muted">
                  Have questions about Hermes AI? We'd love to hear from you. 
                  Send us a message and we'll respond as soon as possible.
                </p>
                <div className="mt-4">
                  <button className="btn btn-primary me-2">
                    <FiMail className="me-1" />
                    Send Email
                  </button>
                  <button className="btn btn-outline-primary">
                    <FiPhone className="me-1" />
                    Call Now
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
