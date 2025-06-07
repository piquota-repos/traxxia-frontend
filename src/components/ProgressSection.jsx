import React, { useState } from 'react';
import { Button, ProgressBar, Spinner, Modal } from 'react-bootstrap';
import { Eye,CheckCircle,XCircle } from 'lucide-react';
import PreviewContent from './PreviewContent';

const ProgressSection = ({ progressData, saveAnswers, isSaving, businessData = {}, saveStatus }) => {
  const {
    answeredQuestions,
    totalQuestions,
    progress ,
  } = progressData;
  let statusIcon = null;
  let statusMessage = saveStatus;
  let statusColor = '';

  if (saveStatus === 'Saved!') {
    statusIcon = <CheckCircle size={16} className="text-success me-1" />;
    statusColor = 'text-success';
  } else if (saveStatus === 'Saving...') {
    statusIcon = <Spinner size="sm" className="me-1 text-primary" />;
    statusColor = 'text-primary';
  } else if (saveStatus === 'Save Error!') {
    statusIcon = <XCircle size={16} className="text-danger me-1" />;
    statusColor = 'text-danger';
  }
  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  
  const handlePreview = () => {
  setCategories(businessData?.categories || []);
  setAnswers(businessData?.answers || []);
  setShowPreview(true);
};
  return (
    <div className="progress-section">

      <Button className='preview-button' onClick={handlePreview}>Preview</Button>

      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        centered
        className="preview-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">Response Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent categories={businessData.categories} answers={businessData.answers} />
        </Modal.Body>
      </Modal>

      {/* Info Section */}
      <h6 className="progress-section-title">Information</h6>

      <div className="progress-label">
        Progress: {progress}% – {answeredQuestions} of {totalQuestions} questions answered.
      </div>

      <ProgressBar now={progress} className="progress-bar-custom" />

      <p className="progress-help-text">
        Please complete the remaining questions to continue. The more questions you answer, the more accurate and personalized your results will be.
      </p>

      {/*<div className="mt-2 d-flex align-items-center">
        {statusIcon}
        <span className={`fw-bold ${statusColor}`}>{statusMessage}</span>
         The manual save button is still useful as a fallback or for explicit saves 
        <Button
          variant="success"
          onClick={saveAnswers}
          size="sm"
          disabled={isSaving}
          className="ms-auto" // Pushes button to the right
        >
          {isSaving ? (
            <>
              <Spinner size="sm" className="me-1" />
              Saving...
            </>
          ) : (
            'Manual Save' // Changed text to differentiate from auto-save status
          )}
        </Button>
      </div>*/}
    </div>
  );
};

export default ProgressSection;