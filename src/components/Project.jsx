import React from "react";
import { Card, Container, Row, Col, Badge } from "react-bootstrap";
import {
  FiUser,
  FiMail,
  FiCode,
  FiTag,
  FiGitBranch,
  FiBookOpen,
} from "react-icons/fi";

// EDIT HERE: add/remove entries to list every developer who worked on this project.
// Duplicate an object in this array for each additional person.
const developers = [
  {
    name: "Gilbert Orlands Sambow",
    role: "Full Stack Developer",
    bio: "Klabat University alumnee, majoring Computer Science. passionate for AI, Backend Software Engineering.",
    email: "gilbertorlands28@gmail.com",
  },
];

// EDIT HERE: project metadata
const projectInfo = {
  name: "Hermes AI",
  description:
    "This is a final project of Front-end Class First Semester 2023/2024 Year.",
  version: "1.0.0",
  builtFor: "Front-end Developer Class",
  license: "MIT",
};

const Project = () => {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10}>
          {/* Project Information */}
          <Card className="shadow-sm page-dark-card mb-4">
            <Card.Header>
              <h2 className="mb-0">
                <FiCode className="me-2" />
                Project Information
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={8}>
                  <h4 className="text-primary mb-3">{projectInfo.name}</h4>
                  <p className="lead">{projectInfo.description}</p>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge bg="warning">v{projectInfo.version}</Badge>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="page-dark-tile p-3 rounded">
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <FiBookOpen className="me-2 text-primary" />
                        <strong>Built for:</strong>{" "}
                        <span className="text-muted">
                          {projectInfo.builtFor}
                        </span>
                      </li>
                      <li className="mb-2">
                        <FiTag className="me-2 text-primary" />
                        <strong>License:</strong>{" "}
                        <span className="text-muted">
                          {projectInfo.license}
                        </span>
                      </li>
                      <li className="mb-0">
                        <FiGitBranch className="me-2 text-primary" />
                        <strong>Version:</strong>{" "}
                        <span className="text-muted">
                          {projectInfo.version}
                        </span>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Developer Information */}
          <Card className="shadow-sm page-dark-card">
            <Card.Header>
              <h2 className="mb-0">
                <FiUser className="me-2" />
                Developer{developers.length > 1 ? "s" : ""}
              </h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                {developers.map((dev, index) => (
                  <Col md={developers.length > 1 ? 6 : 12} key={index} className="mb-4">
                    <div className="page-dark-tile p-4 rounded h-100">
                      <h5 className="text-primary mb-1">{dev.name}</h5>
                      <p className="text-muted mb-3">{dev.role}</p>
                      <p className="mb-3">{dev.bio}</p>
                      <div className="d-flex flex-wrap gap-2">
                        <a
                          href={`mailto:${dev.email}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <FiMail className="me-1" />
                          Email
                        </a>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Project;
