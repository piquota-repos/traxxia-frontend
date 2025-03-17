import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Accordion,
  Alert,
  Navbar,
  Nav,
  Dropdown,
  Badge,
} from "react-bootstrap";
import {
  Star,
  LogOut,
  Eye,
  BarChart,
  CheckCircle,
  Home,
  FileText,
  PieChart,
  Settings,
  User,
  Bell,
  Search,
  Zap,
  Briefcase,
  Activity,
} from "lucide-react";
import useGroqChat from "../components/GroqChat";
import "../styles/Dashboard.css";
import questionsData from "../utils/questions.json";

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [username, setUsername] = useState("");
  const [activeSection, setActiveSection] = useState("survey");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const navigate = useNavigate();
  const { generateResponse, loading, error } = useGroqChat();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    const setupQuestions = () => {
      try {
        // Set the categories from the imported JSON file
        setCategories(questionsData);

        // Initialize answers structure
        const initialAnswers = {};
        questionsData.forEach((category) => {
          category.questions.forEach((question) => {
            initialAnswers[question.id] = {
              rating: 0,
              description: "",
              selectedOption: question.type === "options" ? "" : null,
            };
          });
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error setting up questions:", error);
      }
    };

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized access. Please log in.");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: token },
        });
        if (!response.ok) throw new Error("Failed to fetch data");

        // Assume we get user info from the backend
        const userData = await response.json();
        setUsername(userData.username || "Carlos Felipe Niezen");
      } catch (err) {
        alert("Error fetching data");
        navigate("/login");
      }
    };

    setupQuestions();
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRatingClick = (questionId, rating) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        rating: prev[questionId].rating === rating ? 0 : rating,
      },
    }));
  };

  const handleDescriptionChange = (questionId, e) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        description: e.target.value,
      },
    }));
  };

  const handleOptionChange = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: option,
      },
    }));
  };

  const isQuestionCompleted = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return false;

    return (
      answer.description.trim() !== "" ||
      (answer.selectedOption && answer.selectedOption !== "")
    );
  };

  const allQuestionsAnswered = () => {
    return Object.keys(answers).every((questionId) =>
      isQuestionCompleted(questionId)
    );
  };

  const getProgressPercentage = () => {
    if (Object.keys(answers).length === 0) return 0;

    const completedCount = Object.keys(answers).filter((questionId) =>
      isQuestionCompleted(questionId)
    ).length;

    return Math.round((completedCount / Object.keys(answers).length) * 100);
  };

  const getAccordionStyles = (questionId) => {
    return {
      backgroundColor: isQuestionCompleted(questionId)
        ? "var(--completed-bg)"
        : "white",
      borderLeft: isQuestionCompleted(questionId)
        ? "4px solid var(--accent-color)"
        : "none",
      transition: "all 0.3s ease",
      borderRadius: "12px",
      margin: "12px 0",
      overflow: "hidden",
    };
  };

  const handleAnalyzeResponses = async () => {
    let promptText = `Please analyze the following survey responses and provide insights:\n`;

    categories.forEach((category) => {
      promptText += `\n## ${category.name}\n`;

      category.questions.forEach((question) => {
        const answer = answers[question.id];
        promptText += `Question: ${question.question}\n`;
        promptText += `Rating: ${answer.rating}/5\n`;

        if (question.type === "options" && answer.selectedOption) {
          promptText += `Selected Option: ${answer.selectedOption}\n`;
        }

        promptText += `Comments: ${answer.description}\n\n`;
      });
    });

    promptText += `Please provide a structured analysis focusing on key business insights, areas of strength, areas for improvement, and strategic recommendations based on these responses.`;

    const analysis = await generateResponse(promptText);
    if (analysis) {
      setAnalysisResult(analysis);
      setShowAnalysis(true);
    }
  };

  const PreviewContent = () => (
    <div className="preview-content">
      <h4 className="text-center mb-4 fw-bold">Your Responses</h4>

      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <h5 className="category-heading">{category.name}</h5>

          {category.questions.map((question) => (
            <Card key={question.id} className="mb-3 preview-card">
              <Card.Body>
                <h6>{question.question}</h6>
                {/* <div className="d-flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= answers[question.id]?.rating ? "var(--star-color)" : "none"}
                      color={star <= answers[question.id]?.rating ? "var(--star-color)" : "#ccc"}
                    />
                  ))}
                </div> */}

                {question.type === "options" &&
                  answers[question.id]?.selectedOption && (
                    <p className="text-primary">
                      Selected: {answers[question.id].selectedOption}
                    </p>
                  )}

                {answers[question.id]?.description && (
                  <p className="text-muted">
                    {answers[question.id].description}
                  </p>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );

  const AnalysisContent = () => (
    <div className="p-4">
      {loading ? (
        <div className="text-center">
          <h5 className="mb-3">Analyzing Your Responses...</h5>
          <div className="progress">
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: "75%", backgroundColor: "var(--primary-color)" }}
            ></div>
          </div>
        </div>
      ) : (
        <div>
          <h5 className="mb-3">Analysis Results</h5>
          <div className="analysis-content" style={{ whiteSpace: "pre-line" }}>
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );

  // Placeholder content for other sections with trendy design
  const renderPlaceholderContent = (section) => {
    const sectionInfo = {
      reports: {
        icon: <FileText size={48} className="mb-3 text-primary" />,
        description:
          "View and download all your survey reports in one place. Generate custom reports and share with your team.",
      },
      analytics: {
        icon: <Activity size={48} className="mb-3 text-primary" />,
        description:
          "Deep dive into your survey data with interactive charts, trends analysis, and AI-powered insights.",
      },
      settings: {
        icon: <Settings size={48} className="mb-3 text-primary" />,
        description:
          "Customize your dashboard, manage notifications, and update your account preferences.",
      },
    };

    return (
      <div className="text-center py-5 placeholder-content">
        <div className="glass-card p-5">
          {sectionInfo[section]?.icon}
          <h4 className="mb-3">
            Welcome to {section.charAt(0).toUpperCase() + section.slice(1)}
          </h4>
          <p className="text-muted">{sectionInfo[section]?.description}</p>
          <Button variant="outline-primary" className="mt-3 btn-glow">
            <Zap size={16} className="me-2" />
            Explore {section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        </div>
      </div>
    );
  };

  // Main content based on active section
  // Add this to your Dashboard component to implement the new styling

  // Update the renderMainContent function's survey section
  const renderMainContent = () => {
    switch (activeSection) {
      case "survey":
        return (
          <div className="glass-card p-4">
            <div className="progress-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="progress-title mb-0">Survey Progress</h5>
                <span className="progress-percentage">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: `${getProgressPercentage()}%` }}
                  aria-valuenow={getProgressPercentage()}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>

            {categories.map((category) => (
              <Accordion key={category.id} className="mb-4 modern-accordion">
                <Accordion.Item eventKey={category.id}>
                  <Accordion.Header>
                    <h4 className="category-heading">
                      {category.id}. {category.name}
                    </h4>
                  </Accordion.Header>
                  <Accordion.Body>
                    <Accordion className="nested-accordion">
                      {category.questions.map((question) => (
                        <Accordion.Item
                          key={question.id}
                          eventKey={question.id}
                          className={
                            isQuestionCompleted(question.id)
                              ? "question-completed"
                              : ""
                          }
                        >
                          <Accordion.Header>
                            <div className="d-flex align-items-center justify-content-between w-100">
                              <span>
                                {question.nested?.id}
                                {question.nested?.question}
                              </span>
                              {isQuestionCompleted(question.id) && (
                                <CheckCircle
                                  size={20}
                                  className="ms-2 text-success"
                                  style={{ marginRight: "10px" }}
                                />
                              )}
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <span className="fw-bold">{question.question}</span>

                            <div className="question-container">
                              {question.type === "options" ? (
                                <div className="flex-container">
                                  <div className="options-wrapper">
                                    <QuestionOptions
                                      question={question}
                                      value={
                                        answers[question.id]?.selectedOption ||
                                        ""
                                      }
                                      onChange={(option) =>
                                        handleOptionChange(question.id, option)
                                      }
                                    />
                                  </div>
                                  <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Share your thoughts here..."
                                    value={
                                      answers[question.id]?.description || ""
                                    }
                                    onChange={(e) =>
                                      handleDescriptionChange(question.id, e)
                                    }
                                    className="modern-textarea half-width"
                                  />
                                </div>
                              ) : (
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  placeholder="Share your thoughts here..."
                                  value={
                                    answers[question.id]?.description || ""
                                  }
                                  onChange={(e) =>
                                    handleDescriptionChange(question.id, e)
                                  }
                                  className="modern-textarea"
                                />
                              )}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))}

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button
                variant="outline-info"
                onClick={() => setShowPreview(true)}
                className="btn-preview glass-button"
              >
                <Eye size={18} className="me-2" />
                Preview
              </Button>
              <Button
                variant="success"
                onClick={handleAnalyzeResponses}
                disabled={loading || !allQuestionsAnswered()}
                className="btn-analyze"
              >
                <BarChart size={18} className="me-2" />
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
        );
      // other cases remain the same
    }
  };

  // Update the StarRating component for more visual appeal
  const StarRating = ({ currentRating, onRatingChange }) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="text-center">
            <Star
              key={rating}
              size={32}
              fill={rating <= currentRating ? "var(--star-color)" : "none"}
              color={rating <= currentRating ? "var(--star-color)" : "#ccc"}
              onClick={() => onRatingChange(rating)}
              className="star-hover"
            />
            <div
              className="rating-label"
              style={{
                fontSize: "10px",
                marginTop: "4px",
                color: rating <= currentRating ? "var(--star-color)" : "#aaa",
              }}
            >
              {rating}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const QuestionOptions = ({ question, value, onChange }) => {
    if (question.type !== "options") return null;

    return (
      <div className="mb-3">
        {question.options.map((option, idx) => (
          <div key={idx} className="form-check">
            <input
              type="radio"
              id={`${question.id}-${idx}`}
              name={`question-${question.id}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="form-check-input"
            />
            <label
              htmlFor={`${question.id}-${idx}`}
              className="form-check-label"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Main Header */}
      <Navbar expand="lg" className="p-2 sticky-top modern-navbar">
        <Container fluid>
          <Navbar.Brand href="#home" className="fw-bold logo-text">
            <span className="text-gradient">Traxxia</span>
          </Navbar.Brand>
          <div className="d-flex align-items-center order-lg-last">
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-user"
                className="nav-profile-toggle"
              >
                <div className="avatar-circle">{username.toUpperCase()}</div>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="modern-dropdown">
                <Dropdown.Item
                  onClick={handleLogout}
                  className="dropdown-item-modern text-danger"
                >
                  <LogOut size={16} className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2" />
          </div>

          {showSearchBox && (
            <div className="search-overlay">
              <div className="search-container">
                <div className="d-flex align-items-center">
                  <Search size={20} className="text-muted me-2" />
                  <input
                    type="text"
                    className="form-control border-0 search-input"
                    placeholder="Search..."
                    autoFocus
                  />
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={() => setShowSearchBox(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto me-auto">
              <Nav.Link
                href="#survey"
                active={activeSection === "survey"}
                onClick={() => setActiveSection("survey")}
                className="nav-link-modern"
              >
                <FileText size={16} className="me-1" /> Survey
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <Container fluid className="mt-4 mb-5 px-4 main-content">
        <Row>
          <Col>{renderMainContent()}</Col>
        </Row>
      </Container>

      {/* Modals */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        centered
        className="modern-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            Response Summary
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent />
        </Modal.Body>
      </Modal>

      <Modal
        show={showAnalysis}
        onHide={() => setShowAnalysis(false)}
        centered
        size="lg"
        dialogClassName="analysis-modal modern-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Detailed Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AnalysisContent />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAnalysis(false)}
            className="btn-modern"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
