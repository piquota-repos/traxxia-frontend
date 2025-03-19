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
  Navbar,
  Nav,
  Dropdown,
  Badge
} from "react-bootstrap";
import { 
  LogOut,
  Eye,
  BarChart,
  CheckCircle,
  FileText,
  PieChart,
  Settings,
  Bell,
  Search,
  Zap,
  Briefcase,
  Activity,
  ChevronRight,
  CircleUserRound
} from "lucide-react";
import useGroqChat from "../components/GroqChat";
import "../styles/Dashboard.css";
import questionsData from "../utils/questions.json";
import strategicPlanningBook from "../utils/strategicPlanningBook.js"; 
import { Groq } from "groq-sdk";

const Dashboard = () => {
  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [username, setUsername] = useState("");
  const [activeSection, setActiveSection] = useState("survey");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);
  const [showAnalysisSelection, setShowAnalysisSelection] = useState(false);
  const navigate = useNavigate();
  const { loading } = useGroqChat();
  const groqClient = new Groq({
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
  });
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  // Analysis types with descriptions
  const analysisTypes = [
    {
      id: "swot",
      name: "SWOT Analysis",
      description: "Strengths, Weaknesses, Opportunities, and Threats analysis",
      icon: <Activity size={24} />,
    },
    {
      id: "pestle",
      name: "PESTLE Analysis",
      description: "Political, Economic, Social, Technological, Legal and Environmental factors",
      icon: <Briefcase size={24} />,
    },
    {
      id: "noise",
      name: "NOISE Analysis",
      description: "Needs, Opportunities, Improvements, Strengths, and Exceptions",
      icon: <Bell size={24} />,
    },
    {
      id: "vrio",
      name: "VRIO Framework",
      description: "Value, Rarity, Imitability, and Organization",
      icon: <PieChart size={24} />,
    },
    {
      id: "bsc",
      name: "Balanced Scorecard",
      description: "Financial, Customer, Internal Process, and Learning & Growth perspectives",
      icon: <BarChart size={24} />,
    },
  ];

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
        const userData = await response.json();
        console.log(userData.user)
        setUsername(userData.user?.name || "User");
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
        description: "", 
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

  const handleAnalyzeResponses = async () => {
    setShowAnalysisSelection(false);
    setShowAnalysis(true);
    let promptText = `Please analyze the following survey responses and provide insights:\n`;
  
    categories.forEach((category) => {
      promptText += `\n## ${category.name}\n`;
  
      category.questions.forEach((question) => {
        const answer = answers[question.id];
        promptText += `Question: ${question.question}\n`;
        
        if (question.type === "options" && answer.selectedOption) {
          promptText += `Selected Option: ${answer.selectedOption}\n`;
        }
  
        promptText += `Comments: ${answer.description}\n\n`;
      });
    });
  
    try {
      setAnalysisResult(`Analyzing responses with ${getAnalysisTypeName(selectedAnalysisType)} framework...`);
      console.log(promptText); 
      let systemContent = "";
      
      switch(selectedAnalysisType) {
        case "swot":
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed SWOT analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items";
          break;
        case "pestle":
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed PESTLE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items.\nBe as detailed as possible";
          break;
        case "noise":
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed NOISE analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible";
          break;
        case "vrio":
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed VRIO analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible";
          break;
        case "bsc":
          systemContent = "You are a strategic analyst. You should read the \"Strategic Planning Book\" given by the user and analyze the set of question answers and provide detailed Balanced Scorecard analysis based on the book and the question answers. This will help the user understand the next steps they have to take in their strategic planning process. Use the STRATEGIC acronym at the end to provide specific actionable items\nBe as detailed as possible";
          break;
        default:
          systemContent = "You are a strategic analyst. Analyze the provided survey responses and deliver a comprehensive business analysis. Identify key strengths, weaknesses, opportunities for growth, and potential threats. Conclude with practical, actionable recommendations prioritized by impact and feasibility.";
      }
      
      const messages = [
        {
          "role": "system",
          "content": systemContent
        },
        {
          "role": "user",
          "content": promptText
        }
      ];
      // "content": strategicPlanningBook + promptText
       
      setAnalysisResult("");
       
      const chatCompletion = await groqClient.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 1,
        max_tokens: 31980,   
        top_p: 1,
        stream: true,
        stop: null
      }); 
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        setAnalysisResult(prevResult => prevResult + content);
      }
      
    } catch (error) {
      console.error(`Error generating ${selectedAnalysisType} analysis:`, error);
      setAnalysisResult(`Error generating analysis: ${error.message}`);
    }
  };
  
  const getAnalysisTypeName = (type) => {
    const analysisName = analysisTypes.find(a => a.id === type)?.name || "comprehensive";
    return analysisName;
  };

  const isCategoryCompleted = (category) => {
    return category.questions.every((question) => isQuestionCompleted(question.id));
  };

  const handleShowAnalysisSelection = () => {
    setShowAnalysisSelection(true);
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
          <h5 className="mb-3">
            {selectedAnalysisType && (
              <>
                <Badge bg="primary" className="me-2">
                  {analysisTypes.find(type => type.id === selectedAnalysisType).name}
                </Badge>
                Analysis Results
              </>
            )}
          </h5>
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
                  <Accordion.Header className={isCategoryCompleted(category) ? "category-completed" : ""}>
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <span>
                        {category.id}. {category.name}
                      </span>
                      {isCategoryCompleted(category) && (
                        <CheckCircle
                          size={20}
                          className="ms-2 text-success"
                          style={{ marginRight: "10px" }}
                        />
                      )}
                    </div>
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
                onClick={handleShowAnalysisSelection}
                disabled={!allQuestionsAnswered()}
                className="btn-analyze"
              >
                <BarChart size={18} className="me-2" />
                Analyze
              </Button>
            </div>
          </div>
        );
      case "reports":
        return renderPlaceholderContent("reports");
      case "analytics":
        return renderPlaceholderContent("analytics");
      case "settings":
        return renderPlaceholderContent("settings");
      default:
        return renderPlaceholderContent("survey");
    }
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
                <div className="avatar-circle"> <CircleUserRound size={25} style={{ marginRight: "5px",marginBottom:"3px" }} />{username.toUpperCase()}</div>
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

      {/* Analysis Type Selection Modal */}
      <Modal
        show={showAnalysisSelection}
        onHide={() => setShowAnalysisSelection(false)}
        centered
        className="modern-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            Choose Analysis Type
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="analysis-type-container">
            <Row>
              {analysisTypes.map((type) => (
                <Col md={6} key={type.id} className="mb-3">
                  <Card 
                    className={`analysis-type-card p-3 h-100 ${selectedAnalysisType === type.id ? 'selected-analysis' : ''}`}
                    onClick={() => setSelectedAnalysisType(type.id)}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-2">
                        <div className="analysis-icon me-3">
                          {type.icon}
                        </div>
                        <h5 className="mb-0">{type.name}</h5>
                      </div>
                      <p className="text-muted mb-0 mt-2">{type.description}</p>
                      {selectedAnalysisType === type.id && (
                        <div className="selected-indicator mt-2">
                          <Badge bg="success" pill>Selected</Badge>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAnalysisSelection(false)}
            className="btn-modern"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAnalyzeResponses}
            disabled={!selectedAnalysisType || loading}
            className="btn-modern"
          >
            {loading ? "Analyzing..." : "Generate Analysis"}
            <ChevronRight size={16} className="ms-1" />
          </Button>
        </Modal.Footer>
      </Modal>

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