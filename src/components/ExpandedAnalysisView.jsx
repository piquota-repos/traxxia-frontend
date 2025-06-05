import React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import AnalysisTypeSelector from './AnalysisTypeSelector';
import AnalysisRenderer from './AnalysisRenderer';
import { getIconComponent } from '../utils/iconUtils';

const ExpandedAnalysisView = ({
  businessData,
  activeAnalysisItem,
  fullScreenAnalysisTab,
  setFullScreenAnalysisTab,
  selectedAnalysisType,
  analysisData,
  analysisLoading,
  onFrameworkTabClick,
  onAnalysisTypeSelect,
  onCloseExpandedView,
  onRegenerateAnalysis
}) => {
  const analysisItems = businessData.analysisItems.filter(item => item.category === "analysis");
  const strategicItems = businessData.analysisItems.filter(item => item.category === "strategic");
  const currentItems = fullScreenAnalysisTab === "analysis" ? analysisItems : strategicItems;

  const getCacheKey = () => {
    return activeAnalysisItem ? `${activeAnalysisItem.id}-${selectedAnalysisType}` : null;
  };

  const analysisResult = getCacheKey() ? analysisData[getCacheKey()] : null;
  const isLoading = getCacheKey() ? analysisLoading[getCacheKey()] : false;

  // Enhanced tab click handler that ALWAYS calls API (force refresh)
  const handleTabClick = async (item) => { 
    
    // ALWAYS force refresh when clicking tabs in expanded view
    await onFrameworkTabClick(item, true); // Pass true to FORCE refresh
     
  };

  return (
    <div className="expanded-analysis-view">
      {/* Menu Bar */}
      <div className="analysis-menu-bar">
        <div className="menu-bar-left">
          <Button 
            variant="outline-secondary" 
            onClick={onCloseExpandedView}
            className="expanded-back-button"
          >
            <ArrowLeft size={18} className="me-2" />
            Back 
          </Button>
          <div className="menu-divider"></div>
          <Button
            variant={fullScreenAnalysisTab === "analysis" ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => setFullScreenAnalysisTab("analysis")}
            className="me-2"
          >
            Analysis
          </Button>
          <Button
            variant={fullScreenAnalysisTab === "strategic" ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => setFullScreenAnalysisTab("strategic")}
          >
            Strategic
          </Button>
        </div>           
      </div>

      {/* Content Area */}
      <div className="expanded-analysis-content">
        {/* Horizontal navigation tabs for current category */}
        <div className="expanded-analysis-nav">
          {currentItems.map((item) => {
            const IconComponent = getIconComponent(item.icon);
            return (
              <button
                key={item.id}
                className={`expanded-analysis-tab ${
                  activeAnalysisItem?.id === item.id ? 'active' : ''
                }`}
                onClick={() => handleTabClick(item)}
              >
                <span className="tab-icon">
                  <IconComponent size={20} />
                </span>
                <span className="tab-text">{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="expanded-analysis-main">
          {activeAnalysisItem ? (
            <>
              {/* Analysis Type Selector - WITHOUT regenerate button */}
              <AnalysisTypeSelector
                analysisTypes={activeAnalysisItem.analysisTypes || []}
                selectedType={selectedAnalysisType}
                onTypeSelect={onAnalysisTypeSelect}
                onRegenerateAnalysis={onRegenerateAnalysis}
                isLoading={isLoading}
                activeAnalysisItem={activeAnalysisItem}
                showRegenerateButton={false} // Hide regenerate button
              />
              
              {/* Analysis Component */}
              <div className="analysis-component-container">
                <AnalysisRenderer
                  selectedAnalysisType={selectedAnalysisType}
                  analysisItem={activeAnalysisItem}
                  analysisResult={analysisResult}
                  isLoading={isLoading}
                />
              </div>
            </>
          ) : (
            <div className="analysis-content-workspace">
              <div className="analysis-content-header centered">
                <h4>Select an Analysis Framework</h4>
                <p>Choose from the tabs above to begin your analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpandedAnalysisView;