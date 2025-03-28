import React from 'react'; 
import { Badge, ProgressBar } from 'react-bootstrap'; 
import {    
  Activity,    
  Briefcase,    
  Bell,    
  PieChart,    
  BarChart,
  X  // Added X icon for close button
} from 'lucide-react'; 
import { CheckCircle } from "react-bootstrap-icons";  

const analysisIcons = {   
  swot: Activity,   
  pestle: Briefcase,   
  noise: Bell,   
  vrio: PieChart,   
  bsc: BarChart 
};  

const AnalysisContent = ({    
  loading,    
  selectedAnalysisType,    
  analysisTypes,    
  analysisResult,   
  onAnalysisTypeSelect,   
  onAnalyzeResponses,
  onResetAnalysisResult,
  onClose  // Added onClose prop to handle closing the modal
}) => {   
  const handleAnalysisTypeSelect = (typeId) => {
    onResetAnalysisResult(); // Reset analysis result when a new type is selected
    onAnalysisTypeSelect(typeId);
  };

  return (     
    <div className="analysis-container p-4">
      {/* Added close button at the top */}
      <div className="modal-close-button" style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        cursor: 'pointer',
        zIndex: 10
      }}>
        <X 
          size={24} 
          onClick={onClose} 
          className="text-muted hover:text-gray-700"
        />
      </div>
      
      {loading ? (         
        <div className="text-center analysis-loading">           
          <h5 className="mb-3 text-muted">Analyzing Your Responses</h5>           
          <ProgressBar              
            animated              
            now={75}              
            variant="primary"              
            className="analysis-progress"           
          />         
        </div>       
      ) : (         
        <div className="analysis-results">           
          <div className="analysis-header mb-4">             
            <div className="d-flex justify-content-center align-items-center">               
              {analysisTypes.map((type) => {                 
                const Icon = analysisIcons[type.id];                 
                const isSelected = selectedAnalysisType === type.id;                                  
                return (                   
                  <div                      
                    key={type.id}                      
                    className={`analysis-type-pill ${isSelected ? 'selected' : ''}`}                     
                    title={type.name}                     
                    onClick={() => handleAnalysisTypeSelect(type.id)}                   
                  >                     
                    <div className="icon-wrapper">                       
                      <Icon                          
                        size={20}                          
                        className={`analysis-icon ${isSelected ? 'text-primary' : 'text-muted'}`}                        
                      />
                      <p>{type.name}</p>                     
                    </div>                                       
                  </div>                 
                );               
              })}             
            </div>                       
          </div>                                 
          {selectedAnalysisType && (             
            <div className="text-center mt-3">               
              <button                  
                className="btn btn-primary"                 
                onClick={onAnalyzeResponses}                 
                disabled={loading}               
              >                 
                {loading ? 'Analyzing...' : 'Generate Analysis'}               
              </button>             
            </div>           
          )}
          <br></br>                       
          <div              
            className="analysis-content"              
            style={{                
              whiteSpace: "pre-line",                
              maxHeight: "500px",                
              overflowY: "auto",               
              backgroundColor: "#f8f9fa",               
              borderRadius: "10px",               
              padding: "20px",               
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"             
            }}           
          >              
            {analysisResult || "No analysis results available."}           
          </div>         
        </div>       
      )}     
    </div>   
  ); 
};  

export default AnalysisContent;