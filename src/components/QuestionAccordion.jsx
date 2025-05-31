import React from "react";
import { Accordion, Form } from "react-bootstrap";
import { CheckCircle } from "lucide-react";

const QuestionAccordion = ({
  question,
  answer,
  isCompleted,
  onOptionChange,
  onDescriptionChange,
  onAccordionChange,
}) => {
  return (
    <Accordion.Item 
      eventKey={question.id}
      className={isCompleted ? "question-completed" : ""}
    >
      <Accordion.Header 
        onClick={onAccordionChange}
        className={isCompleted ? "question-header-completed" : ""}
      >
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="question-title">{question.question}</span>
          {isCompleted && (
            <CheckCircle
              size={18}
              className="ms-2 text-success"
              style={{ marginRight: "10px" }}
            />
          )}
        </div>
      </Accordion.Header>
      
      <Accordion.Body className={isCompleted ? "question-body-completed" : ""}>
        <div className="question-content">
          {/* Multiple Choice Questions */}
          {question.type === "multiple-choice" && question.options && (
            <div className="options-container">
              {question.options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  id={`${question.id}-option-${index}`}
                  name={`question-${question.id}`}
                  label={option}
                  value={option}
                  checked={answer.selectedOption === option}
                  onChange={(e) => onOptionChange(e.target.value)}
                  className="mb-2 custom-radio"
                />
              ))}
            </div>
          )}

          {/* Checkbox Questions */}
          {question.type === "checkbox" && question.options && (
            <div className="options-container">
              {question.options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  id={`${question.id}-checkbox-${index}`}
                  label={option}
                  value={option}
                  checked={answer.selectedOptions?.includes(option) || false}
                  onChange={(e) => {
                    const currentOptions = answer.selectedOptions || [];
                    const updatedOptions = e.target.checked
                      ? [...currentOptions, option]
                      : currentOptions.filter((opt) => opt !== option);
                    onOptionChange(updatedOptions);
                  }}
                  className="mb-2 custom-checkbox"
                />
              ))}
            </div>
          )}

          {/* Open-ended/Text Questions */}
          {(question.type === "open-ended" || question.type === "text") && (
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter your answer..."
              value={answer.answer || ""}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="answer-textarea"
            />
          )}

          {/* Rating Questions */}
          {question.type === "rating" && (
            <div className="rating-container d-flex align-items-center">
              <span className="me-3">Rating:</span>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Form.Check
                  key={rating}
                  type="radio"
                  id={`${question.id}-rating-${rating}`}
                  name={`rating-${question.id}`}
                  label={rating}
                  value={rating}
                  checked={answer.rating === rating}
                  onChange={(e) => onOptionChange(parseInt(e.target.value))}
                  inline
                  className="me-3 custom-radio"
                />
              ))}
            </div>
          )}

          {/* Scale Questions */}
          {question.type === "scale" && (
            <div className="scale-container">
              <Form.Range
                min="1"
                max="10"
                step="1"
                value={answer.rating || 1}
                onChange={(e) => onOptionChange(parseInt(e.target.value))}
                className="custom-range mb-2"
              />
              <div className="d-flex justify-content-between">
                <small>1</small>
                <small className="fw-bold">Current: {answer.rating || 1}</small>
                <small>10</small>
              </div>
            </div>
          )}

          {/* Nested Questions */}
          {question.nested && answer.selectedOption && (
            <div className="nested-question-container mt-4 p-3 bg-light rounded">
              <h6 className="nested-question-title mb-3">
                {question.nested.question}
              </h6>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Please elaborate..."
                value={answer.nestedAnswer || ""}
                onChange={(e) => onDescriptionChange(e.target.value, true)}
                className="nested-answer-textarea"
              />
            </div>
          )}

          {/* Completion Status Indicator */}
          {isCompleted && (
            <div className="completion-indicator mt-3">
              <small className="text-success fw-bold">
                ✓ Question Completed
              </small>
            </div>
          )}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default QuestionAccordion;