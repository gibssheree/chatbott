import React from 'react';
import { Card, Container, Row, Col, Badge } from 'react-bootstrap';
import { FiCode, FiCpu, FiUsers, FiTarget, FiZap } from 'react-icons/fi';

const About = () => {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h2 className="mb-0">
                <FiCpu className="me-2" />
                About Hermes AI
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="mb-4">
                <Col md={8}>
                  <h4 className="text-primary mb-3">Welcome to Hermes AI</h4>
                  <p className="lead">
                    Hermes AI is an intelligent chatbot powered by advanced neural networks 
                    and machine learning algorithms. Built with React and Brain.js, it provides 
                    natural language processing capabilities for educational and practical purposes.
                  </p>
                  <p>
                    Our AI assistant can help you with various tasks including mathematical calculations, 
                    answering questions, providing time and date information, and engaging in meaningful 
                    conversations. Hermes AI is designed to be both educational and entertaining.
                  </p>
                </Col>
                <Col md={4} className="text-center">
                  <div className="bg-light p-4 rounded">
                    <FiCpu size={48} className="text-primary mb-3" />
                    <h6>Powered by Brain.js</h6>
                    <Badge bg="success" className="mb-2">Neural Network</Badge>
                    <br />
                    <Badge bg="info" className="mb-2">Machine Learning</Badge>
                    <br />
                    <Badge bg="warning" className="mb-2">React Framework</Badge>
                  </div>
                </Col>
              </Row>

              <hr />

              <Row className="mb-4">
                <Col md={12}>
                  <h5 className="text-primary mb-3">Key Features</h5>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="text-center p-3 border rounded">
                    <FiTarget size={32} className="text-primary mb-2" />
                    <h6>Smart Responses</h6>
                    <p className="small text-muted">
                      Context-aware responses using neural network predictions
                    </p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="text-center p-3 border rounded">
                    <FiCode size={32} className="text-primary mb-2" />
                    <h6>Math Calculations</h6>
                    <p className="small text-muted">
                      Advanced mathematical expression evaluation and solving
                    </p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="text-center p-3 border rounded">
                    <FiZap size={32} className="text-primary mb-2" />
                    <h6>Real-time Processing</h6>
                    <p className="small text-muted">
                      Instant responses with real-time time and date information
                    </p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h5 className="text-primary mb-3">Technology Stack</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <FiCode className="me-2 text-primary" />
                      <strong>React 19.1.1</strong> - Frontend framework
                    </li>
                    <li className="mb-2">
                      <FiCpu className="me-2 text-primary" />
                      <strong>Brain.js 2.0</strong> - Neural network library
                    </li>
                    <li className="mb-2">
                      <FiCpu className="me-2 text-primary" />
                      <strong>Bootstrap 5.3.8</strong> - UI framework
                    </li>
                    <li className="mb-2">
                      <FiUsers className="me-2 text-primary" />
                      <strong>React Router</strong> - Navigation and routing
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5 className="text-primary mb-3">Capabilities</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <span className="badge bg-success me-2">✓</span>
                      Natural language understanding
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-success me-2">✓</span>
                      Mathematical expression solving
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-success me-2">✓</span>
                      Time and date queries
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-success me-2">✓</span>
                      Profanity filtering
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-success me-2">✓</span>
                      Educational responses
                    </li>
                  </ul>
                </Col>
              </Row>

              <div className="bg-light p-4 rounded">
                <h6 className="text-primary mb-3">Disclaimer</h6>
                <p className="small text-muted mb-0">
                  Hermes AI may make mistakes and provide inaccurate information. 
                  This application is designed for educational purposes. 
                  Please verify any important information independently.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
