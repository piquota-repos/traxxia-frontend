// CategoryAccordion.js - Fixed spacebar issue
import React from 'react';
import { Accordion, Form } from 'react-bootstrap';

const CategoryAccordion = ({
  category,
  answers,
  isQuestionCompleted,
  isCategoryCompleted,
  handleOptionChange,
  handleDescriptionChange,
  handleAccordionChange
}) => {
  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey={category.id}>
        <Accordion.Header>
          <div className="d-flex justify-content-between w-100">
            <span>{category.name}</span>
            {isCategoryCompleted(category) && (
              <span className="badge bg-success ms-2">Completed</span>
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          {category.questions.map((question) => (
            <div
              key={question.id}
              className={`question-item mb-4 p-3 border rounded ${
                isQuestionCompleted(question.id) ? 'question-completed' : ''
              }`}
              // Remove onClick from the container to prevent interference
            >
              <h6 
                className="question-text mb-3"
                onClick={() => handleAccordionChange(question.id)}
                style={{ cursor: 'pointer' }}
              >
                {question.question}
              </h6>
              
              {/* Render different input types based on question type */}
              {question.type === 'multiple-choice' && question.options && (
                <div className="options-container">
                  {question.options.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      id={`${question.id}-option-${index}`}
                      name={`question-${question.id}`}
                      label={option}
                      value={option}
                      checked={answers[question.id]?.selectedOption === option}
                      onChange={(e) => handleOptionChange(question.id, e.target.value)}
                      className="mb-2"
                    />
                  ))}
                </div>
              )}
              
              {question.type === 'checkbox' && question.options && (
                <div className="options-container">
                  {question.options.map((option, index) => (
                    <Form.Check
                      key={index}
                      type="checkbox"
                      id={`${question.id}-checkbox-${index}`}
                      label={option}
                      value={option}
                      checked={answers[question.id]?.selectedOptions?.includes(option) || false}
                      onChange={(e) => {
                        const currentOptions = answers[question.id]?.selectedOptions || [];
                        const updatedOptions = e.target.checked
                          ? [...currentOptions, option]
                          : currentOptions.filter(opt => opt !== option);
                        handleOptionChange(question.id, updatedOptions);
                      }}
                      className="mb-2"
                    />
                  ))}
                </div>
              )}
              
              {(question.type === 'open-ended' || question.type === 'text') && (
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter your answer..."
                  value={answers[question.id]?.answer || ''}
                  onChange={(e) => handleDescriptionChange(question.id, e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent event propagation for spacebar and other keys
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    // Prevent click event from bubbling up
                    e.stopPropagation();
                  }}
                  onFocus={(e) => {
                    // Ensure the textarea has focus
                    e.target.focus();
                  }}
                  className="answer-textarea"
                  style={{ 
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              )}
              
              {question.type === 'rating' && (
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Form.Check
                      key={rating}
                      type="radio"
                      id={`${question.id}-rating-${rating}`}
                      name={`rating-${question.id}`}
                      label={rating}
                      value={rating}
                      checked={answers[question.id]?.rating === rating}
                      onChange={(e) => handleOptionChange(question.id, parseInt(e.target.value))}
                      inline
                      className="me-3"
                    />
                  ))}
                </div>
              )}
              
              {/* Show completion status */}
              {isQuestionCompleted(question.id) && (
                <div className="mt-2">
                  <small className="text-success">✓ Completed</small>
                </div>
              )}
              
              {/* Handle nested questions if they exist */}
              {question.nested && answers[question.id]?.selectedOption && (
                <div className="nested-question mt-3 p-3 bg-light rounded">
                  <h6 className="nested-question-text">{question.nested.question}</h6>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Please elaborate..."
                    value={answers[question.nested.id]?.answer || ''}
                    onChange={(e) => handleDescriptionChange(question.nested.id, e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent event propagation for nested textarea too
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="nested-answer-textarea"
                    style={{ 
                      resize: 'vertical',
                      minHeight: '60px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default CategoryAccordion;