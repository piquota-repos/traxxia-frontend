import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Groq } from "groq-sdk";
import axios from 'axios';
import {
  Card,
  Button,
  Modal,
  Container,
  Row,
  Col,
  Accordion,
  Navbar,
  Nav,
  Dropdown,
  Toast,
  ToastContainer
} from "react-bootstrap";
import {
  LogOut,
  Eye,
  BarChart,
  CheckCircle,
  CircleUserRound
} from "lucide-react";

// Components
import FormattedContentViewer from '../components/FormattedContentViewer';
import PreviewContent from "@/components/PreviewContent";
import AnalysisContent from "../components/AnalysisContent";
import QuestionOptions from "../components/QuestionOptions";
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
    resetAnalysisResult
  } = useAnalysis(categories, answers, strategicPlanningBook);

  // UI State
  const [activeSection, setActiveSection] = useState("survey");
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAnalysisSelection, setShowAnalysisSelection] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

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

  const handleShowAnalysisSelection = () => {
    setShowAnalysisSelection(true);
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

  // Main survey content
  const renderSurveyContent = () => (
    <div className="glass-card p-4">
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
          variant="outline-primary"
          onClick={handleShowAnalysisSelection}
          className="btn-analyze"
          disabled={!allQuestionsAnswered()}
        >
          <BarChart size={18} className="me-2" />
          Analyze
        </Button>
      </div>
    </div>
  );

  const renderPlaceholderContent = () => (
    <div className="text-center py-5 placeholder-content">
      <div className="glass-card p-5">
        <h4 className="mb-3">Survey Dashboard</h4>
        <p className="text-muted">
          Complete the survey questions to get strategic insights for your business.
        </p>
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
            <h5>SURVEY</h5>
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
            {activeSection === "survey" ? renderSurveyContent() : renderPlaceholderContent()}
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

      <Modal
        show={showAnalysisSelection}
        onHide={() => setShowAnalysisSelection(false)}
        centered
        className="modern-modal"
        size="lg"
      >
        <AnalysisContent
          loading={false}
          selectedAnalysisType={selectedAnalysisType}
          analysisTypes={ANALYSIS_TYPES}
          analysisResult={analysisResult}
          onAnalysisTypeSelect={setSelectedAnalysisType}
          onAnalyzeResponses={handleAnalyzeResponses}
          onResetAnalysisResult={resetAnalysisResult}
          onClose={() => setShowAnalysisSelection(false)}
        />
      </Modal>

      <Modal
        show={showAnalysis}
        onHide={() => setShowAnalysis(false)}
        centered
        size="lg"
        dialogClassName="analysis-modal modern-modal"
      >
        <AnalysisContent
          loading={false}
          selectedAnalysisType={selectedAnalysisType}
          analysisTypes={ANALYSIS_TYPES}
          analysisResult={analysisResult}
          onAnalysisTypeSelect={setSelectedAnalysisType}
          onAnalyzeResponses={handleAnalyzeResponses}
          onResetAnalysisResult={resetAnalysisResult}
          onClose={() => setShowAnalysis(false)}
        />
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