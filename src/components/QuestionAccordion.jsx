import React from "react";
import { Accordion } from "react-bootstrap";
import { CheckCircle } from "lucide-react";
import QuestionOptions from "./QuestionOptions";
import FormattedContentViewer from "./FormattedContentViewer";

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
      key={question.id}
      eventKey={question.id}
      className={isCompleted ? "question-completed" : ""}
    >
      <Accordion.Header onClick={onAccordionChange}>
        <div className="d-flex align-items-center justify-content-between w-100">
          <span>{question.nested?.question}</span>
          {isCompleted && (
            <CheckCircle
              size={20}
              className="ms-2 text-success"
              style={{ marginRight: "10px" }}
            />
          )}
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <span className="fw-bold">{question.question}</span>

        <div className="question-container">
          {question.type === "options" ? (
            <div className="flex-container">
              <div className="options-wrapper">
                <QuestionOptions
                  question={question}
                  value={answer.selectedOption || ""}
                  onChange={onOptionChange}
                />
              </div>
              <FormattedContentViewer
                value={answer.description || ""}
                onChange={onDescriptionChange}
              />
            </div>
          ) : (
            <FormattedContentViewer
              value={answer.description || ""}
              onChange={onDescriptionChange}
            />
          )}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default QuestionAccordion;