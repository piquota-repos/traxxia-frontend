import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Nav,
  Form,
  Collapse,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// Utils & Auth
import { getAuthData } from "../utils/auth";

// Styles
import "../styles/business-detail.css";

const BusinessDetail = ({ businessName, onBack }) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [analysisTab, setAnalysisTab] = useState("analysis");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get auth data and API URL
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const { userName, userId, latestVersion, isAdmin, token } = getAuthData();

  // Add critical CSS to prevent scrolling issues
  useEffect(() => {
    // Create style element
    const styleId = 'business-detail-fixes';
    let style = document.getElementById(styleId);
    
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    style.textContent = `
      /* Critical fixes */
      html, body, * {
        scroll-behavior: auto !important;
      }
      
      .App {
        text-align: left !important;
      }
      
      .business-detail-container,
      .business-detail-container * {
        text-align: left !important;
        scroll-behavior: auto !important;
      }
      
      .answer-textarea {
        width: 100% !important;
        min-height: 80px !important;
        padding: 10px !important;
        border: 1px solid #ced4da !important;
        border-radius: 0.375rem !important;
        font-size: 16px !important;
        font-family: inherit !important;
        resize: vertical !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
        text-align: left !important;
        outline: none !important;
      }
      
      .answer-textarea:focus {
        border-color: #86b7fe !important;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
      }
    `;

    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.post(`${API_BASE_URL}/api/get-user-response`, {
          user_id: userId,
          version: latestVersion || '1.0'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = response.data;
        
        const transformedData = {
          name: data.user?.company || businessName || "Business Name",
          totalQuestions: data.survey?.total_questions || 0,
          categories: data.categories?.map(category => ({
            id: `category-${category.category_id}`,
            name: category.category_name,
            questions: category.questions?.map(question => ({
              id: question.question_id,
              title: question.question_text,
              placeholder: question.nested?.question || question.question_text,
              answer: question.user_answer?.answer || ""
            })) || []
          })) || [],
          analysisItems: [
            {
              id: "swot",
              title: "SWOT",
              subtitle: "Strengths, weaknesses, opportunities, and threats",
              icon: <Target size={20} />,
              category: "analysis"
            },
            {
              id: "porters",
              title: "Porter's Five Forces",
              subtitle: "Industry analysis framework",
              icon: <BarChart3 size={20} />,
              category: "analysis"
            },
            {
              id: "bcg",
              title: "BCG Matrix",
              subtitle: "Portfolio analysis tool for strategic planning",
              icon: <TrendingUp size={20} />,
              category: "analysis"
            },
            {
              id: "value-chain",
              title: "Value Chain",
              subtitle: "Activities that create value in your organization",
              icon: <Zap size={20} />,
              category: "analysis"
            },
            {
              id: "strategic",
              title: "STRATEGIC Framework", 
              subtitle: "Comprehensive strategic analysis",
              icon: <Users size={20} />,
              category: "strategic"
            }
          ]
        };
        
        setBusinessData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching business data:', err);
        
        if (err.response?.status === 404) {
          setError('No survey responses found. Please complete the survey first.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load business data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessName, userId, latestVersion, token, API_BASE_URL]);

  // SIMPLE: Handle answer change with immediate update
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
  }, []);

  // Manual save function
  const saveAnswers = async () => {
    try {
      setIsSaving(true);
      
      const answersArray = [];
      
      businessData.categories.forEach(category => {
        category.questions.forEach(question => {
          answersArray.push({
            question_id: question.id,
            answer: question.answer || '',
            selected_option: '',
            selected_options: [],
            rating: null
          });
        });
      });

      await axios.post(`${API_BASE_URL}/api/survey/submit`, {
        version: latestVersion || '1.0',
        answers: answersArray
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Answers saved successfully!');
      
    } catch (error) {
      console.error('Error saving answers:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate answered questions and progress
  const progressData = useMemo(() => {
    if (!businessData) return { answeredQuestions: 0, totalQuestions: 0, progress: 0 };
    
    let totalAnswered = 0;
    
    businessData.categories.forEach(category => {
      category.questions.forEach(question => {
        if (question.answer && question.answer.trim() !== '') {
          totalAnswered++;
        }
      });
    });
    
    const progress = businessData.totalQuestions > 0 
      ? Math.round((totalAnswered / businessData.totalQuestions) * 100)
      : 0;
    
    return {
      answeredQuestions: totalAnswered,
      totalQuestions: businessData.totalQuestions,
      progress: progress
    };
  }, [businessData]);

  // Check if all questions in a category are answered
  const isCategoryComplete = useCallback((category) => {
    return category.questions.every(question => 
      question.answer && question.answer.trim() !== ''
    );
  }, []);

  // Count answered questions in a category
  const getAnsweredQuestionsInCategory = useCallback((category) => {
    return category.questions.filter(question => 
      question.answer && question.answer.trim() !== ''
    ).length;
  }, []);

  // Check if all questions across all categories are answered
  const areAllQuestionsAnswered = useCallback(() => {
    if (!businessData || !businessData.categories) return false;
    
    return businessData.categories.every(category => 
      category.questions.every(question => 
        question.answer && question.answer.trim() !== ''
      )
    );
  }, [businessData]);

  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="business-detail-container">
        <Card className="text-center p-4">
          <Card.Body>
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading business data...</p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show error message if API call failed
  if (error) {
    return (
      <div className="business-detail-container">
        <Card>
          <Card.Body>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Data</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Alert>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show message if no data available
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

  const { answeredQuestions, totalQuestions, progress } = progressData;

  const OverallProgressSection = () => (
    <div className="progress-section">
      <h6 className="progress-section-title">Information</h6>
      
      <div className="progress-label">
        Progress: {progress}% - {answeredQuestions} of {totalQuestions} questions answered.
      </div>
      
      <ProgressBar 
        now={progress}
        className="progress-bar-custom"
      />
      
      <p className="progress-help-text">
        Please complete the remaining questions to continue. The more questions you answer, the more accurate and personalized your results will be.
      </p>
      
      <div className="mt-3">
        <Button 
          variant="success" 
          onClick={saveAnswers}
          size="sm"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="me-1" />
              Saving...
            </>
          ) : (
            'Save Progress'
          )}
        </Button>
      </div>
    </div>
  );

  const CategoryItem = ({ category }) => {
    const isExpanded = expandedCategories[category.id];
    const isComplete = isCategoryComplete(category);
    const answeredCount = getAnsweredQuestionsInCategory(category);
    
    return (
      <div className="category-accordion-item">
        <div 
          onClick={() => toggleCategory(category.id)}
          className="category-header"
        >
          <div className={`category-chevron ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
          
          <div className="category-name">
            <span className="category-name-text">
              {category.name}
            </span>
          </div>
          
          <div>
            {isComplete ? (
              <CheckCircle size={20} className="category-status-icon completed" />
            ) : (
              <div className="category-status-number">
                {answeredCount}
              </div>
            )}
          </div>
        </div>
        
        <Collapse in={isExpanded}>
          <div>
            <div className="category-content-wrapper">
              {category.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <label className="question-label" htmlFor={`question-${question.id}`}>
                    {question.title}
                  </label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    id={`question-${question.id}`}
                    name={`question-${question.id}`} 
                    value={question.answer || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="answer-textarea"
                    autoComplete="off"
                    spellCheck="true"
                  />
                </div>
              ))}
            </div>
          </div>
        </Collapse>
      </div>
    );
  };

  const AnalysisItem = ({ item }) => (
    <div className="analysis-item">
      <div className="analysis-item-content">
        <div className="analysis-item-left">
          <div className="analysis-icon">
            {item.icon}
          </div>
          <div>
            <h6 className="analysis-item-title">
              {item.title}
            </h6>
            <p className="analysis-item-subtitle">
              {item.subtitle}
            </p>
          </div>
        </div>
        <ChevronDown size={16} className="analysis-chevron" />
      </div>
    </div>
  );

  const MobileTabContent = () => {
    if (activeTab === "questions") {
      return (
        <div className="mobile-tab-content">
          <OverallProgressSection />          
          <div>
            {businessData.categories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        </div>
      );
    } else if (activeTab === "analysis") {
      const analysisItems = businessData.analysisItems.filter(item => item.category === "analysis");
      return (
        <div className="analysis-tab-content">
          <h6 className="analysis-section-title">
            Analysis
          </h6>
          <div>
            {analysisItems.map(item => (
              <AnalysisItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      );
    } else {
      const strategicItems = businessData.analysisItems.filter(item => item.category === "strategic");
      return (
        <div className="analysis-tab-content">
          <h6 className="analysis-section-title">
            STRATEGIC
          </h6>
          <div>
            {strategicItems.map(item => (
              <AnalysisItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      );
    }
  };

  const DesktopLeftSide = () => (
    <div className="desktop-left-side">
      <OverallProgressSection />
       
      <div>
        {businessData.categories.map(category => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </div>
  );

  const DesktopRightSide = () => {
    const allAnswered = areAllQuestionsAnswered();
    
    return (
      <div 
        className={`desktop-right-side ${!allAnswered ? 'blurred-section' : ''}`}
      >
        {!allAnswered && (
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

        <h6 className="analysis-section-title">
          {analysisTab === "analysis" ? "Analysis" : "STRATEGIC"}
        </h6>
        <div>
          {businessData.analysisItems
            .filter(item => item.category === analysisTab)
            .map(item => (
              <AnalysisItem key={item.id} item={item} />
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="business-detail-container">
      {/* Mobile View */}
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
          <MobileTabContent />
        </Card.Body>
      </Card>

      {/* Desktop View */}
      <Card className="desktop-business-detail d-none d-md-block">
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
            <Col md={6} className="desktop-left-column">
              <DesktopLeftSide />
            </Col>
            <Col md={6} className="desktop-right-column">
              <DesktopRightSide />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BusinessDetail;