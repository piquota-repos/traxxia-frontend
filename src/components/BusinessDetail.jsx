// BusinessDetail.jsx - Complete Fixed Version with Mobile Expanded View
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button, Card, Row, Col, Nav, Alert } from "react-bootstrap";
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
import CategoryItem from "../components/CategoryItem";
import AnalysisItem from "../components/AnalysisItem";
import ExpandedAnalysisView from "../components/ExpandedAnalysisView";

// Utils
import { getAnalysisType } from "../utils/analysisHelpers";
import { apiService } from "../utils/apiService";
import strategicPlanningBook from "../utils/strategicPlanningBook.js";
import strategicPlanningBook1 from "../utils/strategicPlanningBook1.js";

// Styles
import "../styles/business-detail.css";
import "../styles/analysis-components.css";

const BusinessDetail = ({ businessName, onBack }) => {
  // Use the centralized translation hook
  const { t } = useTranslation();

  // State Management
  const [activeTab, setActiveTab] = useState("questions");
  const [analysisTab, setAnalysisTab] = useState("analysis");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

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

  // Custom Hooks - businessData should already be transformed by useBusinessData
  const { businessData, setBusinessData, loading, error } = useBusinessData(businessName);
  const { analysisData, analysisLoading, generateAnalysis } = useAnalysisData();

  // Debug logging for data from hook
  useEffect(() => {
    console.log('🔍 businessData from useBusinessData hook:', businessData);
    if (businessData) {
      console.log('📊 BusinessData structure:', businessData);
      console.log('📋 Categories:', businessData.categories);
      if (businessData.categories?.[0]) {
        console.log('📝 First category:', businessData.categories[0]);
        console.log('❓ First question:', businessData.categories[0].questions?.[0]);
      }
    }
  }, [businessData]);

  // Progress tracking
  const {
    progressData,
    isCategoryComplete,
    getAnsweredQuestionsInCategory,
    areAllQuestionsAnswered
  } = useProgressTracking(businessData);

  // Optimized save function
  const saveAnswers = useCallback(async (forceUpdate = false) => {
    if (!businessData || isSaving) return;

    const currentDataString = JSON.stringify(businessData);
    if (!forceUpdate && lastSavedDataRef.current === currentDataString) {
      console.log('💾 No changes detected, skipping save');
      return;
    }

    setIsSaving(true);
    setSaveStatus(t('saving') || 'Saving...');
    
    try {
      console.log('💾 Saving answers...', businessData);
      await apiService.saveAnswers(businessData);
      lastSavedDataRef.current = currentDataString;
      setSaveStatus(t('save_successful') || 'Save successful!');
      console.log('✅ Progress saved successfully!');
    } catch (error) {
      console.error('❌ Error saving answers:', error);
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
    console.log('📝 Answer change:', { questionId, value });
    
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

      console.log('🔄 Updating business data...');
      
      const updatedData = {
        ...prevData,
        categories: prevData.categories.map(category => ({
          ...category,
          questions: category.questions.map(question => {
            // Check both possible ID fields
            const matchesId = question.id === questionId || question.question_id === questionId;
            
            if (matchesId) {
              console.log('✅ Found matching question:', question);
              console.log('🔄 Updating answer from', question.answer, 'to', value);
              
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

      console.log('📊 Final updated data:', updatedData);
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

  const toggleCategory = useCallback((categoryId) => {
    console.log('🔄 Toggling category:', categoryId);
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Analysis Handlers
  const handleAnalysisItemClick = useCallback(async (item) => {
    console.log('🔍 Analysis item clicked:', item);
    
    setActiveAnalysisItem(item);
    setIsAnimating(true);
    setFullScreenAnalysisTab(item.category);

    const analysisType = getAnalysisType(item.id);
    setSelectedAnalysisType(analysisType);

    setTimeout(() => {
      setIsFullScreenAnalysis(true);
      setIsAnimating(false);
    }, 300); // Reduced animation time for mobile

    const cacheKey = `${item.id}-${analysisType}`;
    if (!analysisData[cacheKey]) {
      await generateAnalysis(analysisType, item.id, businessData, strategicBooks);
    }
  }, [analysisData, generateAnalysis, businessData, strategicBooks]);

  const handleFrameworkTabClick = useCallback(async (item, forceRefresh = false, overrideAnalysisType = null) => {
    console.log('🎯 Framework tab clicked:', item);
    
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
    }, 300); // Reduced animation time for mobile
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
              <details>
                <summary>Debug Information</summary>
                <pre>{JSON.stringify(businessData, null, 2)}</pre>
              </details>
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

  const categoryItemProps = (category) => ({
    category,
    isExpanded: expandedCategories[category.id],
    isComplete: isCategoryComplete(category),
    answeredCount: getAnsweredQuestionsInCategory(category),
    onToggle: () => toggleCategory(category.id),
    onAnswerChange: handleAnswerChange,
    t
  });

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
              onBack={onBack}
              progressSectionProps={progressSectionProps}
              categoryItemProps={categoryItemProps}
              analysisItemProps={analysisItemProps}
              t={t}
            />
          </div>

          {/* Desktop View */}
          <div className="d-none d-md-block">
            <DesktopView
              businessData={businessData}
              analysisTab={analysisTab}
              setAnalysisTab={setAnalysisTab}
              onBack={onBack}
              isFullScreenAnalysis={isFullScreenAnalysis}
              isAnimating={isAnimating}
              areAllQuestionsAnswered={areAllQuestionsAnswered()}
              progressSectionProps={progressSectionProps}
              categoryItemProps={categoryItemProps}
              analysisItemProps={analysisItemProps}
              expandedAnalysisProps={expandedAnalysisProps}
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
  onBack,
  progressSectionProps,
  categoryItemProps,
  analysisItemProps,
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
            {t('questions') || 'Questions'}
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
        businessData={businessData}
        progressSectionProps={progressSectionProps}
        categoryItemProps={categoryItemProps}
        analysisItemProps={analysisItemProps}
        t={t}
      />
    </Card.Body>
  </Card>
);

// Mobile Tab Content Component
const MobileTabContent = ({
  activeTab,
  businessData,
  progressSectionProps,
  categoryItemProps,
  analysisItemProps,
  t
}) => {
  if (activeTab === "questions") {
    return (
      <div className="mobile-tab-content">
        <ProgressSection {...progressSectionProps} />
        <div>
          {businessData.categories.map(category => (
            <CategoryItem key={category.id} {...categoryItemProps(category)} />
          ))}
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
  onBack,
  isFullScreenAnalysis,
  isAnimating,
  areAllQuestionsAnswered,
  progressSectionProps,
  categoryItemProps,
  analysisItemProps,
  expandedAnalysisProps,
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
                businessData={businessData}
                progressSectionProps={progressSectionProps}
                categoryItemProps={categoryItemProps}
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
  businessData,
  progressSectionProps,
  categoryItemProps,
  t
}) => (
  <div className="desktop-left-side">
    <ProgressSection {...progressSectionProps} />
    <div>
      {businessData.categories.map(category => (
        <CategoryItem key={category.id} {...categoryItemProps(category)} />
      ))}
    </div>
  </div>
);

export default BusinessDetail;