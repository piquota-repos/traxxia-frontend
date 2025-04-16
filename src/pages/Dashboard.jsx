import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Container,
  Row,
  Col,
  Navbar,
  Dropdown,
  Toast,
  ToastContainer,
  ProgressBar
} from "react-bootstrap";
import {
  LogOut,
  Eye,
  BarChart,
  CircleUserRound,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

// Components 
import PreviewContent from "@/components/PreviewContent";
import AnalysisContent from "../components/AnalysisContent";
import SurveyProgressCard from "../components/SurveyProgressCard";
import CategoryAccordion from "../components/CategoryAccordion";

// Hooks
import useToast from "../hooks/useToast";
import useSurveyData from "../hooks/useSurveyData";
import useAuthGuard from "../hooks/useAuthGuard";
import useAnalysis from "../hooks/useAnalysis";

// Utils & Data
import questionsData from "../utils/questions.json";
import strategicPlanningBook from "../utils/strategicPlanningBook.js";
import { ANALYSIS_TYPES } from "../utils/constants";

// Styles
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { username, isLoggedIn } = useAuthGuard();
  const { showToast, toastMessage, toastVariant, setToastMessage, setToastVariant, setShowToast } = useToast();

  const {
    categories,
    answers,
    setAnswers,
    isQuestionCompleted,
    isCategoryCompleted,
    getProgressPercentage,
    allQuestionsAnswered,
    handleOptionChange,
    handleDescriptionChange,
    fetchSavedAnswers,
    saveAllAnswers
  } = useSurveyData(questionsData);

  const {
    analysisResult,
    selectedAnalysisType,
    setSelectedAnalysisType,
    handleAnalyzeResponses,
    resetAnalysisResult,
    isLoading
  } = useAnalysis(categories, answers, strategicPlanningBook);

  // UI State
  const [activeSection, setActiveSection] = useState("survey");
  const [showPreview, setShowPreview] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1 for survey, 2 for analysis

  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedAnswers();
    }
  }, [isLoggedIn, fetchSavedAnswers]);

  const handleAccordionChange = async (questionId) => {
    if (activeQuestionId && activeQuestionId !== questionId) {
      await saveAllAnswers(false);
    }
    setActiveQuestionId(questionId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goToAnalysisStep = async () => {
    await saveAllAnswers(false);
    setCurrentStep(2);
  };

  const goBackToSurvey = () => {
    resetAnalysisResult();
    setCurrentStep(1);
  };

  const saveAndShowToast = async () => {
    try {
      await saveAllAnswers();
      setToastMessage("All survey answers saved successfully!");
      setToastVariant("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage(`Failed to save answers: ${error.message}`);
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  // Main survey content (Step 1)
  const renderSurveyContent = () => (
    <div className="glass-card p-4">
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="primary"
          onClick={() => setShowPreview(true)}
          className="btn-next"
        >
          <Eye size={18} className="me-2" />
          Preview
        </Button>
        <Button
          variant="primary"
          onClick={goToAnalysisStep}
          className="btn-next"
          disabled={!allQuestionsAnswered()}
        >
          Continue to Analysis
          <ArrowRight size={18} className="ms-2" />
        </Button>
      </div><br></br>
      <SurveyProgressCard percentage={getProgressPercentage()} />

      {categories.map((category) => (
        <CategoryAccordion
          key={category.id}
          category={category}
          answers={answers}
          isQuestionCompleted={isQuestionCompleted}
          isCategoryCompleted={isCategoryCompleted}
          handleOptionChange={handleOptionChange}
          handleDescriptionChange={handleDescriptionChange}
          handleAccordionChange={handleAccordionChange}
        />
      ))}


    </div>
  );

  // Analysis content (Step 2)
  const renderAnalysisContent = () => (
    <div className="glass-card p-4">
      <div >
        <Button
          variant="primary"
          onClick={goBackToSurvey}
          className="btn-back"
        >
          <ArrowLeft size={18} className="me-2" />
          Back to Survey
        </Button>
      </div>

      <div className="step-header">
        <h4 className="text-center">Analyze Your Responses</h4>
        <p className="text-center text-muted">
          Select an analysis type and generate insights from your survey responses
        </p>
      </div>

      <AnalysisContent
        loading={isLoading}
        selectedAnalysisType={selectedAnalysisType}
        analysisTypes={ANALYSIS_TYPES}
        analysisResult={analysisResult}
        onAnalysisTypeSelect={setSelectedAnalysisType}
        onAnalyzeResponses={handleAnalyzeResponses}
        onResetAnalysisResult={resetAnalysisResult}
        onClose={() => { }} // Empty function since we don't need to close a modal
      />
    </div>
  );

  // Step indicator component
  const StepIndicator = () => (
    <div className="step-indicator-container">
      <div className="step-indicator">
        <div className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>
          1
          <span className="step-label">SURVEY</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}>
          2
          <span className="step-label">ANALYZE</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Navbar expand="lg" className="p-2 sticky-top modern-navbar">
        <Container fluid>
          <Navbar.Brand href="#home" className="fw-bold logo-text order-1 order-lg-1">
            <span className="text-gradient">Traxxia</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center order-3 order-lg-2" style={{ marginTop: "10px" }}>
            <h5>{currentStep === 1 ? "SURVEY" : "ANALYSIS"}</h5>
          </div>

          <div className="d-flex align-items-center order-2 order-lg-3" style={{ marginTop: "10px" }}>
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-user"
                className="nav-profile-toggle"
              >
                <div className="avatar-circle">
                  <CircleUserRound size={25} style={{ marginRight: "5px", marginBottom: "3px" }} />
                  {username.toUpperCase()}
                </div>
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
        </Container>
      </Navbar>

      <Container fluid className="mt-4 mb-5 px-4 main-content">
        <Row>
          <Col>
            <StepIndicator />
            {currentStep === 1 ? renderSurveyContent() : renderAnalysisContent()}
          </Col>
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
          <PreviewContent categories={categories} answers={answers} showModal={showPreview} onHide={showPreview} />
        </Modal.Body>
      </Modal>

      <ToastContainer
        position="bottom-center"
        className="p-3 position-fixed bottom-50 start-50 translate-middle-x z-index-1050"
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Dashboard;