import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";
import {
  ArrowRight,
} from "lucide-react";

// Components
import MenuBar from "../components/MenuBar";
import BusinessDetail from "../components/BusinessDetail";

// Styles
import "../styles/dashboard.css";

// Constants
const STEPS = {
  WELCOME: 1,
  INSIGHTS: 2,
  BUSINESS_DETAIL: 3
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Simple state
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");

  // Hardcoded business data
  const businesses = [
    { name: "InsightForge Inc", progress: 30, remaining: 43, total: 58 },
  ];

  // Hardcoded insights content
  const hardcodedInsights = `
Business Analysis Results:

1. Market Position:
Your business operates in a competitive technology sector with significant growth potential. The current market share indicates room for expansion through strategic initiatives.

2. Strengths:
- Strong technical foundation
- Experienced team
- Innovative product offerings
- Established customer base

3. Areas for Improvement:
- Marketing reach could be expanded
- Customer acquisition costs need optimization
- Product diversification opportunities exist

4. Recommendations:
- Focus on digital marketing strategies
- Invest in customer retention programs
- Explore partnerships for market expansion
- Consider developing complementary products

5. Growth Projections:
Based on current trends, a 25-30% growth rate is achievable within the next 12 months with proper execution of recommended strategies.
  `;

  // Business List Component
  const BusinessList = ({ businesses, viewType }) => (
    <div className={`business-list ${viewType}`}>
      {businesses.map((business, index) => (
        <div 
          key={index} 
          className="business-item d-flex align-items-center p-3 border-bottom"
          onClick={() => handleBusinessClick(business)}
          style={{ cursor: 'pointer' }}
        >
          <div className="progress-circle me-3">
            <div className="progress-text">{business.progress}%</div>
          </div>
          <div className="flex-grow-1">
            <h6 className="mb-1">{business.name}</h6>
            <small className="text-muted">Questions remaining: {business.remaining} of {business.total}</small>
          </div>
          <ArrowRight size={16} className="text-muted" />
        </div>
      ))}
    </div>
  );

  // Event Handlers
  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    setCurrentStep(STEPS.BUSINESS_DETAIL);
  };

  const goToInsights = () => {
    setCurrentStep(STEPS.INSIGHTS);
  };

  const goBackToWelcome = () => {
    setCurrentStep(STEPS.WELCOME);
    setSelectedBusiness(null);
    setAnalysisResult("");
  };

  const generateInsights = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setAnalysisResult(hardcodedInsights);
      setIsLoading(false);
    }, 2000);
  };

  const clearResults = () => {
    setAnalysisResult("");
  };

  // Component Renderers
  const renderWelcomeLayout = () => {
    return (
      <Row className="h-100 justify-content-center">
        <Col xs={12} className="p-0">
          {/* Mobile View - Shows on mobile screens */}
          <Card className="mobile-view-card d-md-none">
            <Card.Body className="p-0">
              <div className="p-4">
                <h5 className="mb-3">Welcome!</h5>
                <p className="text-muted small mb-4">
                  Create business plans step by step with the
                  S.T.R.A.T.E.G.I.C framework. Activate AI capabilities for
                  analysis, prediction, and decision-making.
                </p>
              </div>
              
              <div className="px-4 mb-4">
                <h6 className="mb-3">My Businesses</h6>
                <BusinessList businesses={businesses} viewType="mobile" />
              </div>

              <div className="px-4 pb-4">
                <Button 
                  variant="primary" 
                  className="w-100 create-business-btn"
                  onClick={goToInsights}
                >
                  Create business
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Desktop View - Shows on desktop screens */}
          <Card className="desktop-view-card d-none d-md-block">
            <Card.Body className="p-0 h-100">
              <Row className="h-100 g-0">
                <Col md={6} className="welcome-section">
                  <div>
                    <h5 className="mb-4">Welcome!</h5>
                    <p className="text-muted mb-4">
                      Create business plans step by step with the
                      S.T.R.A.T.E.G.I.C framework. Activate AI capabilities for
                      analysis, prediction, and decision-making.
                    </p>
                    <div>
                      <Button 
                        variant="primary" 
                        className="create-business-btn"
                        onClick={goToInsights}
                      >
                        Create business
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="businesses-section">
                  <div>
                    <h6 className="mb-4">My Businesses</h6>
                    <BusinessList businesses={businesses} viewType="desktop" />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderInsightsContent = () => {
    return (
      <div className="glass-card p-4">
        <div>
          <Button 
            variant="primary" 
            onClick={goBackToWelcome} 
            className="btn-back mb-4"
          >
            ← Back to Welcome
          </Button>
        </div>

        {/* Single Insights Option */}
        <div className="analysis-section">
          <h5 className="mb-4">Business Insights</h5>
          
          <div className="insights-card p-4 border rounded">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h6 className="mb-1">Generate Insights</h6>
                <p className="text-muted mb-0">Get comprehensive business analysis based on your responses</p>
              </div>
              <Button
                variant="primary"
                onClick={generateInsights}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Insights'
                )}
              </Button>
            </div>

            {analysisResult && (
              <div className="analysis-result mt-4 p-3 bg-light rounded">
                <h6 className="mb-3">Analysis Results</h6>
                <div className="analysis-content">
                  {analysisResult}
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mt-3"
                  onClick={clearResults}
                >
                  Clear Results
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="dashboard-layout">
      <MenuBar />

      <Container fluid className="p-0 main-content">
        {currentStep === STEPS.WELCOME ? (
          // Show welcome layout
          <div className="responsive-view-container">
            {renderWelcomeLayout()}
          </div>
        ) : currentStep === STEPS.BUSINESS_DETAIL ? (
          // Show business detail screen
          <BusinessDetail 
            businessName={selectedBusiness?.name}
            onBack={goBackToWelcome}
          />
        ) : (
          // Show insights content
          <div className="px-4 py-4">
            <Row>
              <Col>
                {renderInsightsContent()}
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;