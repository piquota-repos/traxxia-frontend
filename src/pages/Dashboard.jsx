import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Modal,
  Container,
  Row,
  Col,
  Toast,
  ToastContainer,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Eye,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Components
import MenuBar from "../components/MenuBar";
import PreviewContent from "@/components/PreviewContent";
import AnalysisContent from "../components/AnalysisContent";
import SurveyProgressCard from "../components/SurveyProgressCard";
import CategoryAccordion from "../components/CategoryAccordion";

// Hooks
import useToast from "../hooks/useToast";
import useAnalysis from "../hooks/useAnalysis";

// Utils & Data
import strategicPlanningBook from "../utils/strategicPlanningBook.js";
import { ANALYSIS_TYPES } from "../utils/constants";
import { getAuthData, isAuthenticated, logout, redirectIfNotAuthenticated } from "../utils/auth";

// Services
import { categorizeQuestionsWithGroq } from "../utils/groqUtils";

// Styles
import "../styles/Dashboard.css";

// Constants
const TABS = {
  PHASE_1: "tab1",
  PHASE_2: "tab2"
};

const STEPS = {
  SURVEY: 1,
  ANALYSIS: 2
};

const ANALYSIS_TABS = {
  BASIC: "tab1",
  STRATEGIC: "tab2"
};

// Helper functions
const formatContentForStorage = (text) => {
  if (!text) return '';
  return text.trim();
};

const extractPlainTextFromHtml = (htmlContent) => {
  if (!htmlContent) return '';

  if (!htmlContent.includes('<')) {
    return htmlContent;
  }

  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  return doc.body.textContent || '';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  // Auth data
  const { userName, userId, latestVersion, isAdmin, token } = getAuthData();

  // Hooks
  const {
    showToast,
    toastMessage,
    toastVariant,
    setToastMessage,
    setToastVariant,
    setShowToast,
  } = useToast();

  // State
  const [state, setState] = useState({
    // Questions and survey state
    allQuestions: [],
    phase1Questions: [],
    phase2Questions: [],
    answers: {},
    questionsLoading: true,
    questionsError: '',
    isCategorizingQuestions: false,

    // UI State
    showPreview: false,
    activeQuestionId: null,
    currentStep: STEPS.SURVEY,
    activeTab: TABS.PHASE_1,
    analysisTab: ANALYSIS_TABS.BASIC,
  });

  // Analysis hook
  const {
    analysisResult,
    selectedAnalysisType,
    setSelectedAnalysisType,
    handleAnalyzeResponses,
    resetAnalysisResult,
    isLoading,
  } = useAnalysis(state.allQuestions, state.answers, strategicPlanningBook);

  // Update state helper
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // API Service Functions
  const apiService = {
    async checkExistingResponses() {
      const response = await axios.post(`${API_BASE_URL}/api/get-user-response`, {
        user_id: userId,
        version: latestVersion || '1.0'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    },

    async loadFreshQuestions() {
      const response = await axios.get(`${API_BASE_URL}/api/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data?.questions) {
        throw new Error('Invalid questions data received');
      }

      return response.data;
    },

    async saveAnswers(answers, showSuccessToast = true) {
      const answersArray = Object.entries(answers).map(([questionId, answerData]) => ({
        question_id: questionId,
        answer: answerData.answer || answerData.description || '',
        selected_option: answerData.selectedOption || '',
        selected_options: answerData.selectedOptions || [],
        rating: answerData.rating || null
      }));

      await axios.post(`${API_BASE_URL}/api/survey/submit`, {
        version: latestVersion,
        answers: answersArray
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Backup to localStorage
      localStorage.setItem(`survey_answers_${userId}`, JSON.stringify(answers));

      if (showSuccessToast) {
        setToastMessage("Survey answers saved successfully!");
        setToastVariant("success");
        setShowToast(true);
      }
    }
  };

  // Question Processing Functions
  const questionProcessor = {
    normalizeQuestion(question) {
      return {
        id: question.question_id || question.id,
        question: question.question_text || question.question,
        type: question.question_type || question.type || 'open-ended',
        options: question.options || [],
        nested: question.nested || null,
        answered: question.answered || false,
        user_answer: question.user_answer || null
      };
    },

    processExistingAnswers(categories) {
      const existingAnswers = {};

      categories.forEach(category => {
        category.questions.forEach(question => {
          if (question.answered && question.user_answer) {
            const answerText = extractPlainTextFromHtml(question.user_answer.answer || '');

            existingAnswers[question.question_id] = {
              answer: answerText,
              description: answerText,
              selectedOption: question.user_answer.selected_option || '',
              selectedOptions: question.user_answer.selected_options || [],
              rating: question.user_answer.rating || null
            };
          }
        });
      });

      return existingAnswers;
    },

    async categorizeWithGroq(questions) {
      updateState({ isCategorizingQuestions: true });

      try {
        const categorization = await categorizeQuestionsWithGroq(questions);
        const { phase1, phase2 } = this.applyCategorization(questions, categorization);

        updateState({
          phase1Questions: phase1,
          phase2Questions: phase2
        });

      } catch (error) {
        console.error('Error categorizing questions with Groq:', error);

        setToastMessage("AI categorization failed, using fallback method");
        setToastVariant("warning");
        setShowToast(true);

        this.categorizeWithKeywords(questions);
      } finally {
        updateState({ isCategorizingQuestions: false });
      }
    },

    categorizeWithKeywords(questions) {
      const phase1Keywords = [
        'industry', 'business model', 'customer segment', 'pain points',
        'main competitors', 'short-term objectives', 'margins', 'target demographics',
        'niche', 'competitive landscape', 'differentiate', 'competitors',
        'value proposition', 'profit margins'
      ];

      const { phase1, phase2 } = this.applyCategorization(questions, null, phase1Keywords);

      updateState({
        phase1Questions: phase1,
        phase2Questions: phase2
      });
    },

    applyCategorization(questions, groqCategorization = null, keywords = null) {
      const phase1 = [];
      const phase2 = [];

      if (groqCategorization) {
        // Prepare questions list for indexing
        const questionsForAnalysis = questions.flatMap(category =>
          category.questions.map(question => ({
            id: question.question_id || question.id,
            text: question.question_text || question.question,
            category: category.category_name || category.name
          }))
        );

        questions.forEach(category => {
          const phase1QuestionsInCategory = [];
          const phase2QuestionsInCategory = [];

          category.questions.forEach(question => {
            const globalIndex = questionsForAnalysis.findIndex(q =>
              q.id === (question.question_id || question.id)
            ) + 1;

            const normalizedQuestion = this.normalizeQuestion(question);

            if (groqCategorization.phase1.includes(globalIndex)) {
              phase1QuestionsInCategory.push(normalizedQuestion);
            } else {
              phase2QuestionsInCategory.push(normalizedQuestion);
            }
          });

          this.addCategoryToPhases(category, phase1QuestionsInCategory, phase2QuestionsInCategory, phase1, phase2);
        });
      } else if (keywords) {
        // Keyword-based categorization
        questions.forEach(category => {
          const phase1QuestionsInCategory = [];
          const phase2QuestionsInCategory = [];

          category.questions.forEach(question => {
            const questionText = (question.question_text || question.question || '').toLowerCase();
            const isPhase1 = keywords.some(keyword =>
              questionText.includes(keyword.toLowerCase())
            );

            const normalizedQuestion = this.normalizeQuestion(question);

            if (isPhase1) {
              phase1QuestionsInCategory.push(normalizedQuestion);
            } else {
              phase2QuestionsInCategory.push(normalizedQuestion);
            }
          });

          this.addCategoryToPhases(category, phase1QuestionsInCategory, phase2QuestionsInCategory, phase1, phase2);
        });
      }

      return { phase1, phase2 };
    },

    addCategoryToPhases(category, phase1Questions, phase2Questions, phase1Array, phase2Array) {
      if (phase1Questions.length > 0) {
        phase1Array.push({
          id: category.category_id || category.id,
          name: category.category_name || category.name,
          questions: phase1Questions
        });
      }

      if (phase2Questions.length > 0) {
        phase2Array.push({
          id: category.category_id || category.id,
          name: category.category_name || category.name,
          questions: phase2Questions
        });
      }
    }
  };

  // Main Data Loading Functions
  const dataLoader = {
    async loadQuestionsAndAnswers() {
      updateState({ questionsLoading: true, questionsError: '' });

      try {
        const qnaResponse = await apiService.checkExistingResponses();

        if (qnaResponse?.categories) {
          const categories = qnaResponse.categories;
          const existingAnswers = questionProcessor.processExistingAnswers(categories);

          updateState({
            allQuestions: categories,
            answers: existingAnswers
          });

          await questionProcessor.categorizeWithGroq(categories);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('ℹ️  No existing responses found, loading fresh questions...');
          await this.loadFreshQuestions();
        } else {
          console.error('Error checking for existing responses:', error);
          console.log('🔄 Error occurred, falling back to fresh questions...');
          await this.loadFreshQuestions();
        }
      } finally {
        updateState({ questionsLoading: false });
      }
    },

    async loadFreshQuestions() {
      try {
        const response = await apiService.loadFreshQuestions();
        const questions = response.questions;

        updateState({
          allQuestions: questions,
          answers: {}
        });

        await questionProcessor.categorizeWithGroq(questions);

      } catch (error) {
        console.error('Error loading fresh questions:', error);
        updateState({ questionsError: error.response?.data?.message || 'Failed to load questions' });

        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
      }
    }
  };

  // Event Handlers
  const handlers = {
    handleOptionChange: (questionId, value) => {
      updateState({
        answers: {
          ...state.answers,
          [questionId]: {
            ...state.answers[questionId],
            selectedOption: value
          }
        }
      });
    },

    // In your Dashboard component, update the handleDescriptionChange function:
    handleDescriptionChange: (questionId, value) => {
      // Remove any unnecessary text processing that might interfere with input
      updateState({
        answers: {
          ...state.answers,
          [questionId]: {
            ...state.answers[questionId],
            answer: value, // Keep the original value without extra processing
            description: value
          }
        }
      });
    },

    handleAccordionChange: (questionId) => {
      updateState({ activeQuestionId: questionId });
    },

    goToAnalysisStep: async () => {
      await apiService.saveAnswers(state.answers, false);
      updateState({ currentStep: STEPS.ANALYSIS });
    },

    goBackToSurvey: () => {
      resetAnalysisResult();
      updateState({ currentStep: STEPS.SURVEY });
    },

    saveAndShowToast: async () => {
      try {
        await apiService.saveAnswers(state.answers, true);
      } catch (error) {
        console.error('Error saving answers:', error);
        setToastMessage(`Failed to save answers: ${error.message}`);
        setToastVariant("danger");
        setShowToast(true);
      }
    }
  };

  // Utility Functions
  const utils = {
    isQuestionCompleted: (questionId) => {
      const answer = state.answers[questionId];
      if (!answer) return false;

      if (answer.selectedOption) return true;

      const answerText = (answer.answer || answer.description || '').trim();
      return answerText.length > 0;
    },

    isCategoryCompleted: (category) => {
      return category.questions.every(q => utils.isQuestionCompleted(q.id));
    },

    getProgressPercentage: () => {
      if (state.activeTab === TABS.PHASE_1) {
        // No progress bar for Phase 1
        return 0;
      }

      // For Phase 2, calculate progress including both Phase 1 and Phase 2 questions
      const allPhase1Questions = state.phase1Questions.flatMap(cat => cat.questions);
      const allPhase2Questions = state.phase2Questions.flatMap(cat => cat.questions);
      const totalQuestions = allPhase1Questions.length + allPhase2Questions.length;

      const completedPhase1Questions = allPhase1Questions.filter(q => utils.isQuestionCompleted(q.id)).length;
      const completedPhase2Questions = allPhase2Questions.filter(q => utils.isQuestionCompleted(q.id)).length;
      const totalCompletedQuestions = completedPhase1Questions + completedPhase2Questions;

      return totalQuestions > 0 ? (totalCompletedQuestions / totalQuestions) * 100 : 0;
    },

    allQuestionsAnswered: () => {
      const allQs = [...state.phase1Questions, ...state.phase2Questions].flatMap(cat => cat.questions);
      return allQs.every(q => utils.isQuestionCompleted(q.id));
    },

    allTab1Answered: () => {
      const phase1Qs = state.phase1Questions.flatMap(cat => cat.questions);
      return phase1Qs.every(q => utils.isQuestionCompleted(q.id));
    }
  };

  // Component Renderers
  const renderers = {
    renderQuestions: () => {
      const currentQuestions = state.activeTab === TABS.PHASE_1 ? state.phase1Questions : state.phase2Questions;

      return currentQuestions.map((category) => (
        <CategoryAccordion
          key={category.id}
          category={category}
          answers={state.answers}
          isQuestionCompleted={utils.isQuestionCompleted}
          isCategoryCompleted={utils.isCategoryCompleted}
          handleOptionChange={handlers.handleOptionChange}
          handleDescriptionChange={handlers.handleDescriptionChange}
          handleAccordionChange={handlers.handleAccordionChange}
        />
      ));
    },

    renderSurveyContent: () => (
      <div className="glass-card p-4">
        {/* Tab buttons */}
        <div className="d-flex justify-content-center mb-3">
          <Button
            variant={state.activeTab === TABS.PHASE_1 ? "primary" : "outline-primary"}
            className="mx-2"
            onClick={() => updateState({ activeTab: TABS.PHASE_1 })}
          >
            Phase 1 ({state.phase1Questions.reduce((sum, cat) => sum + cat.questions.length, 0)} questions)
          </Button>
          <Button
            variant={state.activeTab === TABS.PHASE_2 ? "primary" : "outline-primary"}
            className="mx-2"
            onClick={() => {
              if (state.activeTab === TABS.PHASE_2 || utils.allTab1Answered()) {
                updateState({ activeTab: TABS.PHASE_2 });
              }
            }}
            disabled={state.activeTab !== TABS.PHASE_2 && !utils.allTab1Answered()}
            style={{
              opacity: state.activeTab === TABS.PHASE_2 || utils.allTab1Answered() ? 1 : 0.65,
              cursor: state.activeTab === TABS.PHASE_2 || utils.allTab1Answered() ? "pointer" : "not-allowed",
            }}
          >
            Phase 2 ({state.phase2Questions.reduce((sum, cat) => sum + cat.questions.length, 0)} questions)
          </Button>
        </div>

        {/* Action buttons */}
        <div className="d-flex justify-content-between mb-3">
          <Button variant="primary" onClick={() => updateState({ showPreview: true })}>
            <Eye size={18} className="me-2" />
            Preview
          </Button>

          <Button variant="success" onClick={handlers.saveAndShowToast}>
            Save Progress
          </Button>

          {state.activeTab === TABS.PHASE_2 && (
            <Button
              variant="primary"
              onClick={handlers.goToAnalysisStep}
              disabled={!utils.allQuestionsAnswered()}
            >
              Continue to Analysis
              <ArrowRight size={18} className="ms-2" />
            </Button>
          )}
        </div>

        {/* Progress bar - only show in Phase 2 */}
        {state.activeTab === TABS.PHASE_2 && (
          <SurveyProgressCard percentage={utils.getProgressPercentage()} />
        )}

        {/* Phase description */}
        <div className="mb-3 p-3 bg-light rounded">
          {state.activeTab === TABS.PHASE_1 ? (
            <div>
              <h6>Phase 1: Core Business Foundation</h6>
              <p className="mb-0 text-muted">
                Questions about your industry, business model, customer segments, pain points,
                competitors, objectives, and margins.
              </p>
            </div>
          ) : (
            <div>
              <h6>Phase 2: Strategic Deep Dive</h6>
              <p className="mb-0 text-muted">
                Advanced questions about strategy, operations, technology, and future planning.
              </p>
            </div>
          )}
        </div>

        {/* Render questions */}
        {renderers.renderQuestions()}
      </div>
    ),

    renderAnalysisContent: () => {
      const firstAnalysisGroup = ANALYSIS_TYPES.slice(0, 4);
      const strategicAnalysisGroup = ANALYSIS_TYPES.slice(4);

      return (
        <div className="glass-card p-4">
          <div>
            <Button variant="primary" onClick={handlers.goBackToSurvey} className="btn-back">
              <ArrowLeft size={18} className="me-2" />
              Back to Survey
            </Button>
          </div>

          {/* Analysis Tabs */}
          <div className="d-flex justify-content-center mb-3">
            <Button
              variant={state.analysisTab === ANALYSIS_TABS.BASIC ? "primary" : "outline-primary"}
              className="mx-2"
              onClick={() => updateState({ analysisTab: ANALYSIS_TABS.BASIC })}
            >
              Insights
            </Button>
            <Button
              variant={state.analysisTab === ANALYSIS_TABS.STRATEGIC ? "primary" : "outline-primary"}
              className="mx-2"
              onClick={() => updateState({ analysisTab: ANALYSIS_TABS.STRATEGIC })}
            >
              Strategic Summary
            </Button>
          </div>

          <AnalysisContent
            loading={isLoading}
            selectedAnalysisType={selectedAnalysisType}
            analysisTypes={state.analysisTab === ANALYSIS_TABS.BASIC ? firstAnalysisGroup : strategicAnalysisGroup}
            analysisResult={analysisResult}
            onAnalysisTypeSelect={setSelectedAnalysisType}
            onAnalyzeResponses={handleAnalyzeResponses}
            onResetAnalysisResult={resetAnalysisResult}
            onClose={() => { }}
            activeTab={state.analysisTab} // Pass the active tab
          />
        </div>
      );
    },

    renderStepIndicator: () => (
      <div className="step-indicator-container">
        <div className="step-indicator">
          <div className={`step-circle ${state.currentStep >= STEPS.SURVEY ? "active" : ""}`}>
            1<span className="step-label">SURVEY</span>
          </div>
          <div className="step-line"></div>
          <div className={`step-circle ${state.currentStep >= STEPS.ANALYSIS ? "active" : ""}`}>
            2<span className="step-label">ANALYZE</span>
          </div>
        </div>
      </div>
    )
  };

  // Effects
  useEffect(() => {
    if (!redirectIfNotAuthenticated()) {
      return;
    }

    dataLoader.loadQuestionsAndAnswers();
  }, []);

  // Guard clauses
  if (!isAuthenticated()) {
    return null;
  }

  if (state.questionsLoading || state.isCategorizingQuestions) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>
            {state.isCategorizingQuestions
              ? "AI is categorizing your questions..."
              : "Loading survey questions..."
            }
          </p>
          <small className="text-muted">
            {state.isCategorizingQuestions
              ? "Using Groq AI to intelligently sort questions into phases"
              : "Checking for existing responses first, then loading fresh questions if needed"
            }
          </small>
        </div>
      </div>
    );
  }

  if (state.questionsError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Questions</Alert.Heading>
          <p>{state.questionsError}</p>
          <Button variant="outline-danger" onClick={dataLoader.loadQuestionsAndAnswers}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  // Main render
  return (
    <div className="dashboard-layout">
      <MenuBar currentPage={state.currentStep === STEPS.SURVEY ? "SURVEY" : "ANALYSIS"} />

      <Container fluid className="mb-5 px-4 main-content">
        <Row>
          <Col>
            {renderers.renderStepIndicator()}
            {state.currentStep === STEPS.SURVEY
              ? renderers.renderSurveyContent()
              : renderers.renderAnalysisContent()}
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <Modal
        show={state.showPreview}
        onHide={() => updateState({ showPreview: false })}
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
          <PreviewContent
            categories={state.allQuestions}
            answers={state.answers}
            phase1Questions={state.phase1Questions}
            phase2Questions={state.phase2Questions}
            showModal={state.showPreview}
            onHide={() => updateState({ showPreview: false })}
          />
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