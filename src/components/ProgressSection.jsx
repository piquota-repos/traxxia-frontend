import React, { useState, useEffect } from 'react';
import { Button, ProgressBar, Spinner, Modal } from 'react-bootstrap';
import { Eye, CheckCircle, XCircle, Save } from 'lucide-react';
import PreviewContent from './PreviewContent';

const ProgressSection = ({ 
  progressData, 
  saveAnswers, 
  isSaving, 
  businessData = {}, 
  saveStatus,
  onManualSave, // New prop for manual save
  t // Translation function
}) => {
  const [translations, setTranslations] = useState({});

  // Get translation function
  const getTranslation = (key) => {
    if (window.getTranslation) {
      return window.getTranslation(key);
    }
    return translations[key] || key;
  };

  // Update translations when language changes
  useEffect(() => {
    const updateTranslations = () => {
      const currentLang = window.currentAppLanguage || 'en';
      const currentTranslations = window.appTranslations?.[currentLang] || {};
      setTranslations(currentTranslations);
    };

    updateTranslations();
    window.addEventListener('languageChanged', updateTranslations);

    return () => {
      window.removeEventListener('languageChanged', updateTranslations);
    };
  }, []);

  const {
    answeredQuestions,
    totalQuestions,
    progress,
  } = progressData;

  // Status icon and message logic
  let statusIcon = null;
  let statusMessage = saveStatus;
  let statusColor = '';

  // Translate status messages
  if (saveStatus === 'Save successful!' || saveStatus === '¡Guardado exitoso!' || getTranslation('save_successful') === saveStatus) {
    statusIcon = <CheckCircle size={16} className="text-success me-1" />;
    statusColor = 'text-success';
    statusMessage = getTranslation('save_successful') || t('save_successful') || 'Save successful!';
  } else if (saveStatus === 'Saving...' || saveStatus === 'Guardando...' || getTranslation('saving') === saveStatus) {
    statusIcon = <Spinner size="sm" className="me-1 text-primary" />;
    statusColor = 'text-primary';
    statusMessage = getTranslation('saving') || t('saving') || 'Saving...';
  } else if (saveStatus === 'Save failed' || saveStatus === 'Error al guardar' || getTranslation('save_failed') === saveStatus) {
    statusIcon = <XCircle size={16} className="text-danger me-1" />;
    statusColor = 'text-danger';
    statusMessage = getTranslation('save_failed') || t('save_failed') || 'Save failed';
  }

  const [categories, setCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    setCategories(businessData?.categories || []);
    setAnswers(businessData?.answers || []);
    setShowPreview(true);
  };

  const handleManualSave = () => {
    if (onManualSave) {
      onManualSave();
    }
  };

  return (
    <div className="progress-section">
      {/* Action Buttons Row */}
      <div className="progress-actions d-flex justify-content-between align-items-center">
        <Button 
          className="preview-button" 
          variant="primary"
          onClick={handlePreview}
        >
          <Eye size={16} className="me-1" />
          {getTranslation('preview') || t('preview') || 'Preview'}
        </Button>

         
      </div>

      {/* Preview Modal */}
      <Modal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        centered
        className="preview-modal"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center">
            {getTranslation('response_summary') || t('response_summary') || 'Summary'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PreviewContent 
            categories={businessData.categories}
            answers={businessData.answers}
            t={t || getTranslation}
          />
        </Modal.Body>
      </Modal>

      {/* Info Section */}
      <h6 className="progress-section-title">
        {getTranslation('information') || t('information') || 'Information'}
      </h6>

      <div className="progress-label">
        {getTranslation('progress_label') || t('progress_label') || 'Progress'}: {progress}% – {answeredQuestions} {getTranslation('of') || t('of') || 'of'} {totalQuestions} {getTranslation('questions_answered_label') || t('questions_answered_label') || 'questions answered'}.
      </div>

      <ProgressBar now={progress} className="progress-bar-custom" />

      <p className="progress-help-text">
        {getTranslation('complete_remaining_questions') || t('complete_remaining_questions') || 'Please complete the remaining questions to continue. The more questions you answer, the more accurate and personalized your results will be.'}
      </p>

      {/* Auto-Save Status Section */}
      {saveStatus && (
        <div className={`save-status-section mt-3 p-2 rounded ${statusColor === 'text-success' ? 'bg-success bg-opacity-10' : statusColor === 'text-danger' ? 'bg-danger bg-opacity-10' : 'bg-info bg-opacity-10'}`}>
          <div className={`save-status d-flex align-items-center ${statusColor}`}>
            {statusIcon}
            <span className="ms-1">{statusMessage}</span>
          </div>
          {statusColor === 'text-success' && (
            <small className="text-muted d-block mt-1">
              {getTranslation('auto_save_enabled') || t('auto_save_enabled') || 'Auto-save is enabled. Your progress is saved automatically.'}
            </small>
          )}
        </div>
      )}

      
    </div>
  );
};

export default ProgressSection;