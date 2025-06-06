import React from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import AnalysisTypeSelector from './AnalysisTypeSelector';
import AnalysisRenderer from './AnalysisRenderer';
import { getIconComponent } from '../utils/iconUtils';

// Helper function to get default analysis type for a category
const getDefaultAnalysisType = (category, analysisItems) => {
  const categoryItems = analysisItems.filter(item => item.category === category);
  
  if (category === 'analysis') {
    // Look for SWOT analysis item first
    const swotItem = categoryItems.find(item => item.id === 'swot');
    if (swotItem) return 'swot';
    
    // Fallback to first item and get its analysis type
    const firstItem = categoryItems[0];
    return firstItem ? getAnalysisTypeFromItemId(firstItem.id) : null;
  } else if (category === 'strategic') {
    // Look for strategic analysis item first
    const strategicItem = categoryItems.find(item => item.id === 'strategic');
    if (strategicItem) return 'strategic';
    
    // Fallback to first item and get its analysis type
    const firstItem = categoryItems[0];
    return firstItem ? getAnalysisTypeFromItemId(firstItem.id) : null;
  }
  
  return null;
};

// Helper function to get default analysis item for a category
const getDefaultAnalysisItem = (category, analysisItems) => {
  const categoryItems = analysisItems.filter(item => item.category === category);
  
  if (category === 'analysis') {
    // Look for SWOT analysis item first
    const swotItem = categoryItems.find(item => item.id === 'swot');
    return swotItem || categoryItems[0];
  } else if (category === 'strategic') {
    // Look for strategic analysis item first
    const strategicItem = categoryItems.find(item => item.id === 'strategic');
    return strategicItem || categoryItems[0];
  }
  
  return categoryItems[0];
};

// Helper function to convert item ID to analysis type (same logic as getAnalysisType)
const getAnalysisTypeFromItemId = (itemId) => {
  return itemId === 'porters' ? 'porter' : 
         itemId === 'value-chain' ? 'valuechain' : 
         itemId;
};

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

  // Ensure the correct tab is selected based on the active analysis item
  React.useEffect(() => {
    if (activeAnalysisItem && activeAnalysisItem.category !== fullScreenAnalysisTab) {
      setFullScreenAnalysisTab(activeAnalysisItem.category);
    }
  }, [activeAnalysisItem, fullScreenAnalysisTab, setFullScreenAnalysisTab]);

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

  // Handle Analysis/Strategic button clicks with default selection
  const handleCategoryTabClick = async (category) => {
    console.log('Category clicked:', category);
    setFullScreenAnalysisTab(category);
    
    // Only auto-select if there's no active analysis item or if switching categories
    if (!activeAnalysisItem || activeAnalysisItem.category !== category) {
      // Get default analysis type and item for this category
      const defaultAnalysisType = getDefaultAnalysisType(category, businessData.analysisItems);
      const defaultAnalysisItem = getDefaultAnalysisItem(category, businessData.analysisItems);
      
      console.log('Default analysis type:', defaultAnalysisType);
      console.log('Default analysis item:', defaultAnalysisItem);
      
      if (defaultAnalysisType && defaultAnalysisItem) {
        // Call onFrameworkTabClick with the override analysis type
        await onFrameworkTabClick(defaultAnalysisItem, false, defaultAnalysisType);
      } else {
        console.log('No default analysis type or item found for category:', category);
        console.log('Available items:', businessData.analysisItems.filter(item => item.category === category));
      }
    }
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
            onClick={() => handleCategoryTabClick("analysis")}
            className="me-2"
          >
            Analysis
          </Button>
          <Button
            variant={fullScreenAnalysisTab === "strategic" ? "primary" : "outline-primary"}
            size="sm"
            onClick={() => handleCategoryTabClick("strategic")}
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
              {/* Only show AnalysisTypeSelector if the item has multiple analysis types */}
              {activeAnalysisItem.analysisTypes && activeAnalysisItem.analysisTypes.length > 1 ? (
                <AnalysisTypeSelector
                  analysisTypes={activeAnalysisItem.analysisTypes || []}
                  selectedType={selectedAnalysisType}
                  onTypeSelect={onAnalysisTypeSelect}
                  onRegenerateAnalysis={onRegenerateAnalysis}
                  isLoading={isLoading}
                  activeAnalysisItem={activeAnalysisItem}
                  showRegenerateButton={false} // Hide regenerate button
                />
              ) : ( 
                <></>
              )}
              
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