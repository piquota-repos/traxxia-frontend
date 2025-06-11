// BusinessDetail.jsx - Complete Updated Version with Separated Save Status
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button, Card, Row, Col, Nav, Alert, Spinner, Form } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";

// Custom Hooks
import { useBusinessData } from "../hooks/useBusinessData";
import { useAnalysisData } from "../hooks/useAnalysisData";
import { useProgressTracking } from "../hooks/useProgressTracking";
import { useTranslation } from "../hooks/useTranslation";

// Components
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import ProgressSection from "../components/ProgressSection";
import SaveStatus from "../components/SaveStatus"; // NEW IMPORT
import AnalysisItem from "../components/AnalysisItem";
import ExpandedAnalysisView from "../components/ExpandedAnalysisView";
import CategoryItem from "../components/CategoryItem";

// Utils
import { getAnalysisType } from "../utils/analysisHelpers";
import { apiService } from "../utils/apiService";
import { categorizeQuestionsWithGroq } from "../utils/groqUtils";
import strategicPlanningBook from "../utils/strategicPlanningBook.js";
import strategicPlanningBook1 from "../utils/strategicPlanningBook1.js";

// Styles
import "../styles/business-detail.css";
import "../styles/analysis-components.css";

// Constants
const QUESTION_TABS = {
  BASIC: "basic",
  ADVANCED: "advanced"
};

const BusinessDetail = ({ businessName, onBack }) => {
  // Use the centralized translation hook
  const { t } = useTranslation();

  // State Management
  const [activeTab, setActiveTab] = useState("questions");
  const [analysisTab, setAnalysisTab] = useState("analysis");
  const [questionTab, setQuestionTab] = useState(QUESTION_TABS.BASIC);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const hasCategorizationRun = useRef(false);
  // Question categorization state
  const [basicQuestions, setBasicQuestions] = useState([]);
  const [advancedQuestions, setAdvancedQuestions] = useState([]);
  const [isCategorizingQuestions, setIsCategorizingQuestions] = useState(false);
  const [categorizationError, setCategorizationError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  // Full-screen analysis state
  const [isFullScreenAnalysis, setIsFullScreenAnalysis] = useState(false);
  const [activeAnalysisItem, setActiveAnalysisItem] = useState(null);
  const [fullScreenAnalysisTab, setFullScreenAnalysisTab] = useState("analysis");
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);

  // Strategic planning books state
  const [strategicBooks, setStrategicBooks] = useState({
    part1: strategicPlanningBook,
    part2: strategicPlanningBook1
  });

  // Auto-save optimization refs
  const saveTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isUserTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Custom Hooks
  const { businessData, setBusinessData, loading, error } = useBusinessData(businessName);
  const { analysisData, analysisLoading, generateAnalysis } = useAnalysisData();

  // Progress tracking
  const {
    progressData,
    isCategoryComplete,
    getAnsweredQuestionsInCategory,
    areAllQuestionsAnswered
  } = useProgressTracking(businessData);

  const toggleCategory = useCallback((categoryId) => { 
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Question Processing Functions
  const questionProcessor = {
    normalizeQuestion(question) {
      return {
        id: question.question_id || question.id,
        question: question.question_text || question.question,
        type: question.question_type || question.type || 'open-ended',
        options: question.options || [],
        answer: question.answer || '',
        category_id: question.category_id,
        category_name: question.category_name
      };
    },

    async categorizeWithGroq(categories) {
      setIsCategorizingQuestions(true);
      setCategorizationError('');

      try {
        const categorization = await categorizeQuestionsWithGroq(categories);
        const { basic, advanced } = this.applyCategorization(categories, categorization);

        setBasicQuestions(basic);
        setAdvancedQuestions(advanced);

      } catch (error) {
        console.error('Error categorizing questions with Groq:', error);
        setCategorizationError('AI categorization failed, using fallback method');
        this.categorizeWithKeywords(categories);
      } finally {
        setIsCategorizingQuestions(false);
      }
    },

    categorizeWithKeywords(categories) {
      const basicKeywords = [
        'industry', 'business model', 'customer segment', 'pain points',
        'main competitors', 'short-term objectives', 'margins', 'target demographics',
        'niche', 'competitive landscape', 'differentiate', 'competitors',
        'value proposition', 'profit margins'
      ];

      const { basic, advanced } = this.applyCategorization(categories, null, basicKeywords);
      setBasicQuestions(basic);
      setAdvancedQuestions(advanced);
    },

    applyCategorization(categories, groqCategorization = null, keywords = null) {
      const basic = [];
      const advanced = [];

      if (groqCategorization) {
        // Prepare questions list for indexing
        const questionsForAnalysis = categories.flatMap(category =>
          category.questions.map(question => ({
            id: question.question_id || question.id,
            text: question.question_text || question.question,
            category: category.category_name || category.name
          }))
        );

        categories.forEach(category => {
          const basicQuestionsInCategory = [];
          const advancedQuestionsInCategory = [];

          category.questions.forEach(question => {
            const globalIndex = questionsForAnalysis.findIndex(q =>
              q.id === (question.question_id || question.id)
            ) + 1;

            const normalizedQuestion = {
              ...this.normalizeQuestion(question),
              category_name: category.category_name || category.name
            };

            if (groqCategorization.basic && groqCategorization.basic.includes(globalIndex)) {
              basicQuestionsInCategory.push(normalizedQuestion);
            } else if (groqCategorization.phase1 && groqCategorization.phase1.includes(globalIndex)) {
              // Backward compatibility
              basicQuestionsInCategory.push(normalizedQuestion);
            } else {
              advancedQuestionsInCategory.push(normalizedQuestion);
            }
          });

          if (basicQuestionsInCategory.length > 0) {
            basic.push(...basicQuestionsInCategory);
          }

          if (advancedQuestionsInCategory.length > 0) {
            advanced.push(...advancedQuestionsInCategory);
          }
        });
      } else if (keywords) {
        // Keyword-based categorization
        categories.forEach(category => {
          category.questions.forEach(question => {
            const questionText = (question.question_text || question.question || '').toLowerCase();
            const isBasic = keywords.some(keyword =>
              questionText.includes(keyword.toLowerCase())
            );

            const normalizedQuestion = {
              ...this.normalizeQuestion(question),
              category_name: category.category_name || category.name
            };

            if (isBasic) {
              basic.push(normalizedQuestion);
            } else {
              advanced.push(normalizedQuestion);
            }
          });
        });
      }

      return { basic, advanced };
    }
  };

  // Utility Functions
  const utils = {
    isQuestionCompleted: (questionId) => {
      if (!businessData || !businessData.categories) return false;

      for (const category of businessData.categories) {
        for (const question of category.questions) {
          if ((question.id === questionId || question.question_id === questionId)) {
            const answer = question.answer || '';
            return answer.trim().length > 0;
          }
        }
      }
      return false;
    },

    allBasicAnswered: () => {
      return basicQuestions.every(q => utils.isQuestionCompleted(q.id));
    },

    getProgressPercentage: () => {
      const totalQuestions = basicQuestions.length + advancedQuestions.length;
      const completedBasic = basicQuestions.filter(q => utils.isQuestionCompleted(q.id)).length;
      const completedAdvanced = advancedQuestions.filter(q => utils.isQuestionCompleted(q.id)).length;
      const totalCompleted = completedBasic + completedAdvanced;

      return totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;
    }
  };

  // Effect to categorize questions when businessData changes
  useEffect(() => {
    if (businessData &&
      businessData.categories &&
      businessData.categories.length > 0 &&
      !hasCategorizationRun.current) {

      hasCategorizationRun.current = true;
      questionProcessor.categorizeWithGroq(businessData.categories);
    }
  }, [businessData]);
  // Optimized save function
  const saveAnswers = useCallback(async (forceUpdate = false) => {
    if (!businessData || isSaving) return;

    const currentDataString = JSON.stringify(businessData);
    if (!forceUpdate && lastSavedDataRef.current === currentDataString) { 
      return;
    }

    setIsSaving(true);
    setSaveStatus(t('saving') || 'Saving...');

    try { 
      await apiService.saveAnswers(businessData);
      lastSavedDataRef.current = currentDataString;
      setSaveStatus(t('save_successful') || 'Save successful!'); 
    } catch (error) { 
      setSaveStatus(t('save_failed') || 'Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, [businessData, isSaving, t]);

  // Manual save function
  const handleManualSave = useCallback(async () => {
    isUserTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await saveAnswers(true);
  }, [saveAnswers]);

  // Answer change handler
  const handleAnswerChange = useCallback((questionId, value) => { 

    // Mark that user is typing
    isUserTypingRef.current = true;

    // Clear existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set user as not typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      isUserTypingRef.current = false;
    }, 2000);

    setBusinessData(prevData => {
      if (!prevData || !prevData.categories) {
        console.warn('⚠️ Invalid business data structure');
        return prevData;
      } 

      const updatedData = {
        ...prevData,
        categories: prevData.categories.map(category => ({
          ...category,
          questions: category.questions.map(question => {
            // Check both possible ID fields
            const matchesId = question.id === questionId || question.question_id === questionId;

            if (matchesId) { 
              return {
                ...question,
                answer: value,
                // Update answered status
                answered: value.trim() !== "",
                // Update user_answer structure for API compatibility
                user_answer: {
                  ...question.user_answer,
                  answer: value
                }
              };
            }
            return question;
          })
        }))
      };
      return updatedData;
    });
  }, [setBusinessData]);

  // Auto-save effect
  useEffect(() => {
    if (!businessData || loading || error) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const delay = isUserTypingRef.current ? 3000 : 1500;

    saveTimerRef.current = setTimeout(() => {
      if (!isUserTypingRef.current) {
        saveAnswers();
      }
    }, delay);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [businessData, loading, error, saveAnswers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getCategoryItemProps = (category) => ({
    category,
    isExpanded: expandedCategories[category.id],
    isComplete: isCategoryComplete(category),
    answeredCount: getAnsweredQuestionsInCategory(category),
    onToggle: () => toggleCategory(category.id),
    onAnswerChange: handleAnswerChange,
    t
  });

  // Analysis Handlers
  const handleAnalysisItemClick = useCallback(async (item) => {
    setActiveAnalysisItem(item);
    setIsAnimating(true);
    setFullScreenAnalysisTab(item.category);

    const analysisType = getAnalysisType(item.id);
    setSelectedAnalysisType(analysisType);

    setTimeout(() => {
      setIsFullScreenAnalysis(true);
      setIsAnimating(false);
    }, 300);

    const cacheKey = `${item.id}-${analysisType}`;
    if (!analysisData[cacheKey]) {
      await generateAnalysis(analysisType, item.id, businessData, strategicBooks);
    }
  }, [analysisData, generateAnalysis, businessData, strategicBooks]);

  const handleFrameworkTabClick = useCallback(async (item, forceRefresh = false, overrideAnalysisType = null) => {
    setActiveAnalysisItem(item);

    if (item.category !== fullScreenAnalysisTab) {
      setFullScreenAnalysisTab(item.category);
    }

    const analysisType = overrideAnalysisType || getAnalysisType(item.id);
    setSelectedAnalysisType(analysisType);

    if (forceRefresh) {
      await generateAnalysis(analysisType, item.id, businessData, strategicBooks, true);
    } else {
      const cacheKey = `${item.id}-${analysisType}`;
      if (!analysisData[cacheKey]) {
        await generateAnalysis(analysisType, item.id, businessData, strategicBooks, false);
      }
    }
  }, [analysisData, generateAnalysis, businessData, strategicBooks, fullScreenAnalysisTab]);

  const handleAnalysisTypeSelect = useCallback(async (analysisType, forceRefresh = false) => {
    if (!activeAnalysisItem) return;

    setSelectedAnalysisType(analysisType);

    if (forceRefresh) {
      await generateAnalysis(analysisType, activeAnalysisItem.id, businessData, strategicBooks, true);
    } else {
      const cacheKey = `${activeAnalysisItem.id}-${analysisType}`;
      if (!analysisData[cacheKey]) {
        await generateAnalysis(analysisType, activeAnalysisItem.id, businessData, strategicBooks, false);
      }
    }
  }, [activeAnalysisItem, analysisData, generateAnalysis, businessData, strategicBooks]);

  const handleCloseExpandedView = useCallback(() => {
    setIsAnimating(true);
    setIsFullScreenAnalysis(false);

    setTimeout(() => {
      setActiveAnalysisItem(null);
      setSelectedAnalysisType(null);
      setIsAnimating(false);
    }, 300);
  }, []);

  const handleRegenerateAnalysis = useCallback(async (analysisType, frameworkId) => {
    await generateAnalysis(analysisType, frameworkId, businessData, strategicBooks, true);
  }, [generateAnalysis, businessData, strategicBooks]);

  // Render States
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  if (!businessData) {
    return (
      <div className="business-detail-container">
        <Card>
          <Card.Body>
            <Alert variant="info">
              <Alert.Heading>{t('no_data_available') || 'No Data Available'}</Alert.Heading>
              <p>{t('no_business_data_found') || 'No business data found.'}</p>
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (isCategorizingQuestions) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>AI is categorizing your questions...</p>
          <small className="text-muted">
            Using Groq AI to intelligently sort questions into Basic and Advanced
          </small>
        </div>
      </div>
    );
  }

  // Validate data structure
  if (!businessData.categories || !Array.isArray(businessData.categories)) {
    console.error('❌ Invalid categories structure:', businessData.categories);
    return (
      <div className="business-detail-container">
        <Card>
          <Card.Body>
            <Alert variant="warning">
              <Alert.Heading>{t('data_structure_error') || 'Data Structure Error'}</Alert.Heading>
              <p>{t('invalid_data_format') || 'The business data format is invalid. Please refresh the page.'}</p>
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Component Props
  const progressSectionProps = {
    progressData,
    saveAnswers,
    isSaving,
    businessData,
    saveStatus,
    onManualSave: handleManualSave,
    t
  };

  // NEW: Save Status Props
  const saveStatusProps = {
    saveStatus,
    isSaving,
    t
  };

  const analysisItemProps = (item) => ({
    item,
    onClick: () => handleAnalysisItemClick(item),
    t
  });

  const expandedAnalysisProps = {
    businessData,
    activeAnalysisItem,
    fullScreenAnalysisTab,
    setFullScreenAnalysisTab,
    selectedAnalysisType,
    analysisData,
    analysisLoading,
    onFrameworkTabClick: handleFrameworkTabClick,
    onAnalysisTypeSelect: handleAnalysisTypeSelect,
    onCloseExpandedView: handleCloseExpandedView,
    onRegenerateAnalysis: handleRegenerateAnalysis,
    t
  };

  // Simple Question Item Component
  const QuestionItem = ({ question }) => (
    <div className="question-item mb-3 p-3 border rounded">
      <div className="question-header mb-2">
        <small className="text-muted">{question.category_name}</small>
        <h6 className="mb-1">{question.question}</h6>
      </div>
      <Form.Group>
        <Form.Control
          as="textarea"
          rows={3}
          value={question.answer || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer..."
          className="answer-textarea"
        />
      </Form.Group>
      {utils.isQuestionCompleted(question.id) && (
        <small className="text-success">✓ Completed</small>
      )}
    </div>
  );

  return (
    <>
      {/* Main Container - Hidden when expanded view is active */}
      {!isFullScreenAnalysis && (
        <div className="business-detail-container">

          {/* Mobile View */}
          <div className="d-md-none">
            <MobileView
              businessData={businessData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              questionTab={questionTab}
              setQuestionTab={setQuestionTab}
              basicQuestions={basicQuestions}
              advancedQuestions={advancedQuestions}
              onBack={onBack}
              progressSectionProps={progressSectionProps}
              saveStatusProps={saveStatusProps} // NEW PROP
              categoryItemProps={getCategoryItemProps}
              analysisItemProps={analysisItemProps}
              QuestionItem={QuestionItem}
              utils={utils}
              categorizationError={categorizationError}
              t={t}
            />
          </div>

          {/* Desktop View */}
          <div className="d-none d-md-block">
            <DesktopView
              businessData={businessData}
              analysisTab={analysisTab}
              setAnalysisTab={setAnalysisTab}
              questionTab={questionTab}
              setQuestionTab={setQuestionTab}
              basicQuestions={basicQuestions}
              advancedQuestions={advancedQuestions}
              onBack={onBack}
              isFullScreenAnalysis={isFullScreenAnalysis}
              isAnimating={isAnimating}
              areAllQuestionsAnswered={areAllQuestionsAnswered()}
              progressSectionProps={progressSectionProps}
              saveStatusProps={saveStatusProps} // NEW PROP
              categoryItemProps={getCategoryItemProps}
              analysisItemProps={analysisItemProps}
              expandedAnalysisProps={expandedAnalysisProps}
              QuestionItem={QuestionItem}
              utils={utils}
              categorizationError={categorizationError}
              t={t}
            />

          </div>
        </div>
      )}

      {/* Expanded Analysis View - Full Screen Overlay */}
      {isFullScreenAnalysis && (
        <div className="expanded-analysis-fullscreen-overlay">
          <ExpandedAnalysisView {...expandedAnalysisProps} />
        </div>
      )}
    </>
  );
};

// Mobile View Component
const MobileView = ({
  businessData,
  activeTab,
  setActiveTab,
  questionTab,
  setQuestionTab,
  basicQuestions,
  advancedQuestions,
  onBack,
  progressSectionProps,
  saveStatusProps, // NEW PROP
  categoryItemProps,
  analysisItemProps,
  QuestionItem,
  utils,
  categorizationError,
  t
}) => (
  <Card className="mobile-business-detail">
    <Card.Header className="mobile-business-header">
      <Button variant="link" onClick={onBack} className="back-button">
        <ArrowLeft size={20} />
      </Button>
      <h6 className="business-name">{businessData.name}</h6>
    </Card.Header>

    <div className="mobile-tabs-container">
      <Nav variant="tabs" className="mobile-tabs">
        <Nav.Item>
          <Nav.Link
            active={activeTab === "questions"}
            onClick={() => setActiveTab("questions")}
            className={`mobile-tab ${activeTab === "questions" ? "active" : ""}`}
          >
            {t('questions') || 'Questions'} ({basicQuestions.length + advancedQuestions.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "analysis"}
            onClick={() => setActiveTab("analysis")}
            className={`mobile-tab ${activeTab === "analysis" ? "active" : ""}`}
          >
            {t('analysis') || 'Analysis'}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "strategic"}
            onClick={() => setActiveTab("strategic")}
            className={`mobile-tab ${activeTab === "strategic" ? "active" : ""}`}
          >
            {t('strategic') || 'STRATEGIC'}
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>

    <Card.Body className="mobile-tab-body">
      <MobileTabContent
        activeTab={activeTab}
        questionTab={questionTab}
        setQuestionTab={setQuestionTab}
        basicQuestions={basicQuestions}
        advancedQuestions={advancedQuestions}
        businessData={businessData}
        progressSectionProps={progressSectionProps}
        saveStatusProps={saveStatusProps} // NEW PROP
        categoryItemProps={categoryItemProps}
        analysisItemProps={analysisItemProps}
        QuestionItem={QuestionItem}
        utils={utils}
        categorizationError={categorizationError}
        t={t}
      />
    </Card.Body>
  </Card>
);

// Mobile Tab Content Component
const MobileTabContent = ({
  activeTab,
  questionTab,
  setQuestionTab,
  basicQuestions,
  advancedQuestions,
  businessData,
  progressSectionProps,
  saveStatusProps, // NEW PROP
  categoryItemProps,
  analysisItemProps,
  QuestionItem,
  utils,
  categorizationError,
  t
}) => {
  if (activeTab === "questions") {
    return (
      <div className="mobile-tab-content">
        {/* Question Tabs */}
        <div className="d-flex justify-content-center mb-3">
          <Button
            variant={questionTab === QUESTION_TABS.BASIC ? "primary" : "outline-primary"}
            className="mx-2"
            onClick={() => setQuestionTab(QUESTION_TABS.BASIC)}
            size="sm"
          >
            Basic
          </Button>
          <Button
            variant={questionTab === QUESTION_TABS.ADVANCED ? "primary" : "outline-primary"}
            className="mx-2"
            onClick={() => {
              if (questionTab === QUESTION_TABS.ADVANCED || utils.allBasicAnswered()) {
                setQuestionTab(QUESTION_TABS.ADVANCED);
              }
            }}
            disabled={questionTab !== QUESTION_TABS.ADVANCED && !utils.allBasicAnswered()}
            size="sm"
          >
            Advanced 
          </Button>
        </div> 


        {/* Show full ProgressSection only for Advanced tab */}
        {questionTab === QUESTION_TABS.ADVANCED && (
          <ProgressSection {...progressSectionProps} />
        )}


        {/* Show Save Status for BOTH tabs */}
        <SaveStatus {...saveStatusProps} />
        
        {/* Questions */}
        <div>
          {questionTab === QUESTION_TABS.BASIC ? (
            <div>
              {/* Group basic questions by category */}
              {businessData.categories
                .filter(category =>
                  category.questions.some(q =>
                    basicQuestions.find(bq => bq.id === (q.id || q.question_id))
                  )
                )
                .map(category => {
                  // Create filtered category with only basic questions
                  const filteredCategory = {
                    ...category,
                    id: category.id || category.category_id,
                    name: category.name || category.category_name,
                    questions: category.questions
                      .filter(q =>
                        basicQuestions.find(bq => bq.id === (q.id || q.question_id))
                      )
                      .map(q => ({
                        ...q,
                        id: q.id || q.question_id,
                        title: q.title || q.question_text || q.question,
                        answer: q.answer || ''
                      }))
                  };
                  return (
                    <CategoryItem key={filteredCategory.id} {...categoryItemProps(filteredCategory)} />
                  );
                })
              }
            </div>
          ) : (
            <div>
              <div className="mb-3 p-2 bg-light rounded">
                <small className="text-muted">
                  <strong>Advanced Questions:</strong> Strategic deep dive questions
                </small>
              </div>
              {/* Group advanced questions by category */}
              {businessData.categories
                .filter(category =>
                  category.questions.some(q =>
                    advancedQuestions.find(aq => aq.id === (q.id || q.question_id))
                  )
                )
                .map(category => {
                  // Create filtered category with only advanced questions
                  const filteredCategory = {
                    ...category,
                    id: category.id || category.category_id,
                    name: category.name || category.category_name,
                    questions: category.questions
                      .filter(q =>
                        advancedQuestions.find(aq => aq.id === (q.id || q.question_id))
                      )
                      .map(q => ({
                        ...q,
                        id: q.id || q.question_id,
                        title: q.title || q.question_text || q.question,
                        answer: q.answer || ''
                      }))
                  };
                  return (
                    <CategoryItem key={filteredCategory.id} {...categoryItemProps(filteredCategory)} />
                  );
                })
              }
            </div>
          )}
        </div>
      </div>
    );
  } else if (activeTab === "analysis") {
    const analysisItems = businessData.analysisItems?.filter(item => item.category === "analysis") || [];
    return (
      <div className="analysis-tab-content">
        <h6 className="analysis-section-title">{t('analysis') || 'Analysis'}</h6>
        <div>
          {analysisItems.map(item => (
            <AnalysisItem key={item.id} {...analysisItemProps(item)} />
          ))}
        </div>
      </div>
    );
  } else {
    const strategicItems = businessData.analysisItems?.filter(item => item.category === "strategic") || [];
    return (
      <div className="analysis-tab-content">
        <h6 className="analysis-section-title">{t('strategic') || 'STRATEGIC'}</h6>
        <div>
          {strategicItems.map(item => (
            <AnalysisItem key={item.id} {...analysisItemProps(item)} />
          ))}
        </div>
      </div>
    );
  }
};

// Desktop View Component
const DesktopView = ({
  businessData,
  analysisTab,
  setAnalysisTab,
  questionTab,
  setQuestionTab,
  basicQuestions,
  advancedQuestions,
  onBack,
  isFullScreenAnalysis,
  isAnimating,
  areAllQuestionsAnswered,
  progressSectionProps,
  saveStatusProps, // NEW PROP
  categoryItemProps,
  analysisItemProps,
  expandedAnalysisProps,
  QuestionItem,
  utils,
  categorizationError,
  t
}) => (
  <Card className="desktop-business-detail">
    {!isFullScreenAnalysis ? (
      <>
        <Card.Header className="desktop-business-header">
          <Button variant="link" onClick={onBack} className="back-button">
            <ArrowLeft size={20} />
          </Button>
          <h5 className="business-name">{businessData.name}</h5>
        </Card.Header>

        <Card.Body className="desktop-business-body">
          <Row className="desktop-business-row">
            <Col
              md={6}
              className={`desktop-left-column ${isAnimating && !isFullScreenAnalysis ? 'slide-out-left' : ''} ${isAnimating && isFullScreenAnalysis ? 'slide-in-left' : ''}`}
            >
              <DesktopLeftSide
                questionTab={questionTab}
                setQuestionTab={setQuestionTab}
                basicQuestions={basicQuestions}
                advancedQuestions={advancedQuestions}
                businessData={businessData}
                progressSectionProps={progressSectionProps}
                saveStatusProps={saveStatusProps} // NEW PROP
                categoryItemProps={categoryItemProps}
                QuestionItem={QuestionItem}
                utils={utils}
                categorizationError={categorizationError}
                t={t}
              />
            </Col>
            <Col md={6} className="desktop-right-column">
              <DesktopRightSide
                businessData={businessData}
                analysisTab={analysisTab}
                setAnalysisTab={setAnalysisTab}
                areAllQuestionsAnswered={areAllQuestionsAnswered}
                analysisItemProps={analysisItemProps}
                t={t}
              />
            </Col>
          </Row>
        </Card.Body>
      </>
    ) : (
      <div className="desktop-expanded-analysis">
        <ExpandedAnalysisView {...expandedAnalysisProps} />
      </div>
    )}
  </Card>
);

// Desktop Right Side Component
const DesktopRightSide = ({
  businessData,
  analysisTab,
  setAnalysisTab,
  areAllQuestionsAnswered,
  analysisItemProps,
  t
}) => (
  <div
    className={`desktop-right-side ${!areAllQuestionsAnswered ? 'blurred-section' : ''}`}
  >
    {!areAllQuestionsAnswered && (
      <div className="completion-overlay">
        <h6 className="completion-overlay-title">
          {t('complete_all_questions') || 'Complete All Questions'}
        </h6>
        <p className="completion-overlay-text">
          {t('complete_questions_to_unlock') || 'Please answer all questions to unlock the analysis section'}
        </p>
      </div>
    )}

    <div className="d-flex justify-content-center mb-3">
      <Button
        variant={analysisTab === "analysis" ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => setAnalysisTab("analysis")}
      >
        {t('analysis') || 'Analysis'}
      </Button>
      <Button
        variant={analysisTab === "strategic" ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => setAnalysisTab("strategic")}
      >
        {t('strategic') || 'STRATEGIC'}
      </Button>
    </div>

    <div>
      {(businessData.analysisItems || [])
        .filter(item => item.category === analysisTab)
        .map(item => (
          <AnalysisItem key={item.id} {...analysisItemProps(item)} />
        ))
      }
    </div>
  </div>
);

// Desktop Left Side Component
const DesktopLeftSide = ({
  questionTab,
  setQuestionTab,
  basicQuestions,
  advancedQuestions,
  businessData,
  progressSectionProps,
  saveStatusProps, // NEW PROP
  categoryItemProps,
  QuestionItem,
  utils,
  categorizationError,
  t
}) => (
  <div className="desktop-left-side">
    {/* Question Tabs */}
    <div className="d-flex justify-content-center mb-3">
      <Button
        variant={questionTab === QUESTION_TABS.BASIC ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => setQuestionTab(QUESTION_TABS.BASIC)}
        size="sm"
      >
        Basic
      </Button>
      <Button
        variant={questionTab === QUESTION_TABS.ADVANCED ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => {
          if (questionTab === QUESTION_TABS.ADVANCED || utils.allBasicAnswered()) {
            setQuestionTab(QUESTION_TABS.ADVANCED);
          }
        }}
        disabled={questionTab !== QUESTION_TABS.ADVANCED && !utils.allBasicAnswered()}
        size="sm"
        style={{
          opacity: questionTab === QUESTION_TABS.ADVANCED || utils.allBasicAnswered() ? 1 : 0.65,
          cursor: questionTab === QUESTION_TABS.ADVANCED || utils.allBasicAnswered() ? "pointer" : "not-allowed",
        }}
      >
        Advanced 
      </Button>
    </div>
    
    {/* Show Save Status for BOTH tabs */}
    <SaveStatus {...saveStatusProps} />

    {/* Show full ProgressSection only for Advanced tab */}
    {questionTab === QUESTION_TABS.ADVANCED && (
      <ProgressSection {...progressSectionProps} />
    )}

    <div>
      {questionTab === QUESTION_TABS.BASIC ? (
        <div>
          {/* Group basic questions by category */}
          {businessData.categories
            .filter(category =>
              category.questions.some(q =>
                basicQuestions.find(bq => bq.id === (q.id || q.question_id))
              )
            )
            .map(category => {
              // Create filtered category with only basic questions
              const filteredCategory = {
                ...category,
                id: category.id || category.category_id,
                name: category.name || category.category_name,
                questions: category.questions
                  .filter(q =>
                    basicQuestions.find(bq => bq.id === (q.id || q.question_id))
                  )
                  .map(q => ({
                    ...q,
                    id: q.id || q.question_id,
                    title: q.title || q.question_text || q.question,
                    answer: q.answer || ''
                  }))
              };
              return (
                <CategoryItem key={filteredCategory.id} {...categoryItemProps(filteredCategory)} />
              );
            })
          }
          {basicQuestions.length === 0 && (
            <div className="text-center text-muted py-4">
              <p>No basic questions available</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Group advanced questions by category */}
          {businessData.categories
            .filter(category =>
              category.questions.some(q =>
                advancedQuestions.find(aq => aq.id === (q.id || q.question_id))
              )
            )
            .map(category => {
              // Create filtered category with only advanced questions
              const filteredCategory = {
                ...category,
                id: category.id || category.category_id,
                name: category.name || category.category_name,
                questions: category.questions
                  .filter(q =>
                    advancedQuestions.find(aq => aq.id === (q.id || q.question_id))
                  )
                  .map(q => ({
                    ...q,
                    id: q.id || q.question_id,
                    title: q.title || q.question_text || q.question,
                    answer: q.answer || ''
                  }))
              };
              return (
                <CategoryItem key={filteredCategory.id} {...categoryItemProps(filteredCategory)} />
              );
            })
          }
          {advancedQuestions.length === 0 && (
            <div className="text-center text-muted py-4">
              <p>No advanced questions available</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default BusinessDetail;