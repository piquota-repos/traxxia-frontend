import React from 'react';
import { Button, ProgressBar, Spinner } from 'react-bootstrap';

const ProgressSection = ({ progressData, saveAnswers, isSaving }) => {
  const { answeredQuestions, totalQuestions, progress } = progressData;

  return (
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
};

export default ProgressSection;