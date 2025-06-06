// BusinessDetail.jsx - Main Component
import React, { useState, useCallback } from "react";
import { Button, Card, Row, Col, Nav, Alert } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";

// Custom Hooks
import { useBusinessData } from "../hooks/useBusinessData";
import { useAnalysisData } from "../hooks/useAnalysisData";
import { useProgressTracking } from "../hooks/useProgressTracking";

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
  // State Management
  const [activeTab, setActiveTab] = useState("questions");
  const [analysisTab, setAnalysisTab] = useState("analysis");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Full-screen analysis state
  const [isFullScreenAnalysis, setIsFullScreenAnalysis] = useState(false);
  const [activeAnalysisItem, setActiveAnalysisItem] = useState(null);
  const [fullScreenAnalysisTab, setFullScreenAnalysisTab] = useState("analysis");
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState(null);

  // Strategic planning books state
  const [strategicBooks, setStrategicBooks] = useState({
    part1: strategicPlanningBook,
    part2: strategicPlanningBook1 // Fixed: was strategicPlanningBook, should be strategicPlanningBook1
  });

  // Custom Hooks
  const { businessData, setBusinessData, loading, error } = useBusinessData(businessName);
  const { analysisData, analysisLoading, generateAnalysis } = useAnalysisData();
  const {
    progressData,
    isCategoryComplete,
    getAnsweredQuestionsInCategory,
    areAllQuestionsAnswered
  } = useProgressTracking(businessData);

  // Event Handlers
  const handleAnswerChange = useCallback((questionId, value) => {
    setBusinessData(prevData => ({
      ...prevData,
      categories: prevData.categories.map(category => ({
        ...category,
        questions: category.questions.map(question =>
          question.id === questionId
            ? { ...question, answer: value }
            : question
        )
      }))
    }));
  }, [setBusinessData]);

  const saveAnswers = useCallback(async () => {
    try {
      setIsSaving(true);
      await apiService.saveAnswers(businessData); 
    } catch (error) {
      console.error('Error saving answers:', error);
    } finally {
      setIsSaving(false);
    }
  }, [businessData]);

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Analysis Handlers
  const handleAnalysisItemClick = useCallback(async (item) => {
    console.log('Analysis item clicked:', item);
    
    setActiveAnalysisItem(item);
    setIsAnimating(true);

    // Set the correct category tab based on the item's category
    console.log('Setting fullScreenAnalysisTab to:', item.category);
    setFullScreenAnalysisTab(item.category);

    const analysisType = getAnalysisType(item.id);
    console.log('Setting selectedAnalysisType to:', analysisType);
    setSelectedAnalysisType(analysisType);

    // Start animation
    setTimeout(() => {
      setIsFullScreenAnalysis(true);
      setIsAnimating(false);
    }, 1000);

    // Auto-generate analysis
    const cacheKey = `${item.id}-${analysisType}`;
    if (!analysisData[cacheKey]) {
      await generateAnalysis(analysisType, item.id, businessData, strategicBooks);
    }
  }, [analysisData, generateAnalysis, businessData, strategicBooks]);

  // Handle framework tab click in expanded view with FORCED refresh
  const handleFrameworkTabClick = useCallback(async (item, forceRefresh = false, overrideAnalysisType = null) => {
    console.log('Framework tab clicked:', item, 'forceRefresh:', forceRefresh, 'overrideAnalysisType:', overrideAnalysisType);
    
    setActiveAnalysisItem(item);

    // Ensure the correct category tab is set
    if (item.category !== fullScreenAnalysisTab) {
      console.log('Correcting fullScreenAnalysisTab from', fullScreenAnalysisTab, 'to', item.category);
      setFullScreenAnalysisTab(item.category);
    }

    const analysisType = overrideAnalysisType || getAnalysisType(item.id);
    console.log('Setting selectedAnalysisType to:', analysisType);
    setSelectedAnalysisType(analysisType);

    // ALWAYS call generateAnalysis when forceRefresh is true, regardless of cache
    if (forceRefresh) { 
      await generateAnalysis(analysisType, item.id, businessData, strategicBooks, true);
    } else {
      // Normal behavior - check cache first
      const cacheKey = `${item.id}-${analysisType}`;
      if (!analysisData[cacheKey]) { 
        await generateAnalysis(analysisType, item.id, businessData, strategicBooks, false);
      }
    }
  }, [analysisData, generateAnalysis, businessData, strategicBooks, fullScreenAnalysisTab]);

  // Handle analysis type selection with FORCED refresh
  const handleAnalysisTypeSelect = useCallback(async (analysisType, forceRefresh = false) => {
    if (!activeAnalysisItem) return;

    console.log('Analysis type selected:', analysisType, 'forceRefresh:', forceRefresh);
    setSelectedAnalysisType(analysisType);

    // ALWAYS call generateAnalysis when forceRefresh is true, regardless of cache
    if (forceRefresh) { 
      await generateAnalysis(analysisType, activeAnalysisItem.id, businessData, strategicBooks, true);
    } else {
      // Normal behavior - check cache first
      const cacheKey = `${activeAnalysisItem.id}-${analysisType}`;
      if (!analysisData[cacheKey]) { 
        await generateAnalysis(analysisType, activeAnalysisItem.id, businessData, strategicBooks, false);
      }
    }
  }, [activeAnalysisItem, analysisData, generateAnalysis, businessData, strategicBooks]);

  // Handle close expanded view
  const handleCloseExpandedView = useCallback(() => { 
    console.log('Closing expanded view');
    setIsAnimating(true);
    setIsFullScreenAnalysis(false);

    // Reset after animation
    setTimeout(() => {
      setActiveAnalysisItem(null);
      setSelectedAnalysisType(null);
      setIsAnimating(false); 
    }, 1000);
  }, []);

  // Handle regenerate analysis
  const handleRegenerateAnalysis = useCallback(async (analysisType, frameworkId) => { 
    console.log('Regenerating analysis:', analysisType, frameworkId);
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
              <Alert.Heading>No Data Available</Alert.Heading>
              <p>No business data found.</p>
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
    isSaving
  };

  const categoryItemProps = (category) => ({
    category,
    isExpanded: expandedCategories[category.id],
    isComplete: isCategoryComplete(category),
    answeredCount: getAnsweredQuestionsInCategory(category),
    onToggle: () => toggleCategory(category.id),
    onAnswerChange: handleAnswerChange
  });

  const analysisItemProps = (item) => ({
    item,
    onClick: () => handleAnalysisItemClick(item)
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
    onRegenerateAnalysis: handleRegenerateAnalysis
  };

  return (
    <>
      <div className="business-detail-container">
        {/* Mobile View */}
        <MobileView
          businessData={businessData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBack={onBack}
          progressSectionProps={progressSectionProps}
          categoryItemProps={categoryItemProps}
          analysisItemProps={analysisItemProps}
        />

        {/* Desktop View */}
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
        />
      </div>

      {/* Expanded Analysis View - Shows on both mobile and desktop */}
      <ExpandedAnalysisViewContainer 
        isFullScreenAnalysis={isFullScreenAnalysis}
        expandedAnalysisProps={expandedAnalysisProps}
      />
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
  analysisItemProps
}) => (
  <Card className="mobile-business-detail d-md-none">
    <Card.Header className="mobile-business-header">
      <Button
        variant="link"
        onClick={onBack}
        className="back-button"
      >
        <ArrowLeft size={20} />
      </Button>
      <h6 className="business-name">
        {businessData.name}
      </h6>
    </Card.Header>

    <div className="mobile-tabs-container">
      <Nav variant="tabs" className="mobile-tabs">
        <Nav.Item>
          <Nav.Link
            active={activeTab === "questions"}
            onClick={() => setActiveTab("questions")}
            className={`mobile-tab ${activeTab === "questions" ? "active" : ""}`}
          >
            Questions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "analysis"}
            onClick={() => setActiveTab("analysis")}
            className={`mobile-tab ${activeTab === "analysis" ? "active" : ""}`}
          >
            Analysis
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === "strategic"}
            onClick={() => setActiveTab("strategic")}
            className={`mobile-tab ${activeTab === "strategic" ? "active" : ""}`}
          >
            STRATEGIC
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
  analysisItemProps
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
    const analysisItems = businessData.analysisItems.filter(item => item.category === "analysis");
    return (
      <div className="analysis-tab-content">
        <h6 className="analysis-section-title">Analysis</h6>
        <div>
          {analysisItems.map(item => (
            <AnalysisItem key={item.id} {...analysisItemProps(item)} />
          ))}
        </div>
      </div>
    );
  } else {
    const strategicItems = businessData.analysisItems.filter(item => item.category === "strategic");
    return (
      <div className="analysis-tab-content">
        <h6 className="analysis-section-title">STRATEGIC</h6>
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
  expandedAnalysisProps
}) => (
  <Card className="desktop-business-detail d-none d-md-block">
    {!isFullScreenAnalysis ? (
      <>
        <Card.Header className="desktop-business-header">
          <Button
            variant="link"
            onClick={onBack}
            className="back-button"
          >
            <ArrowLeft size={20} />
          </Button>
          <h5 className="business-name">
            {businessData.name}
          </h5>
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
              />
            </Col>
            <Col
              md={6}
              className="desktop-right-column"
            >
              <DesktopRightSide
                businessData={businessData}
                analysisTab={analysisTab}
                setAnalysisTab={setAnalysisTab}
                areAllQuestionsAnswered={areAllQuestionsAnswered}
                analysisItemProps={analysisItemProps}
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

// Expanded Analysis View Component (shows on both mobile and desktop when active)
const ExpandedAnalysisViewContainer = ({ 
  isFullScreenAnalysis, 
  expandedAnalysisProps 
}) => {
  if (!isFullScreenAnalysis) return null;
  
  return (
    <div className="expanded-analysis-container">
      <ExpandedAnalysisView {...expandedAnalysisProps} />
    </div>
  );
};

// Desktop Left Side Component
const DesktopLeftSide = ({
  businessData,
  progressSectionProps,
  categoryItemProps
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

// Desktop Right Side Component
const DesktopRightSide = ({
  businessData,
  analysisTab,
  setAnalysisTab,
  areAllQuestionsAnswered,
  analysisItemProps
}) => (
  <div
    className={`desktop-right-side ${!areAllQuestionsAnswered ? 'blurred-section' : ''}`}
  >
    {!areAllQuestionsAnswered && (
      <div className="completion-overlay">
        <h6 className="completion-overlay-title">
          Complete All Questions
        </h6>
        <p className="completion-overlay-text">
          Please answer all questions to unlock the analysis section
        </p>
      </div>
    )}

    <div className="d-flex justify-content-center mb-3">
      <Button
        variant={analysisTab === "analysis" ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => setAnalysisTab("analysis")}
      >
        Analysis
      </Button>
      <Button
        variant={analysisTab === "strategic" ? "primary" : "outline-primary"}
        className="mx-2"
        onClick={() => setAnalysisTab("strategic")}
      >
        STRATEGIC
      </Button>
    </div>

    {/* <h6 className="analysis-section-title">
      {analysisTab === "analysis" ? "Analysis" : "STRATEGIC"}
    </h6> */}
    <div>
      {businessData.analysisItems
        .filter(item => item.category === analysisTab)
        .map(item => (
          <AnalysisItem key={item.id} {...analysisItemProps(item)} />
        ))
      }
    </div>
  </div>
);

export default BusinessDetail;