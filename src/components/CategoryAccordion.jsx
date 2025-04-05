import React from "react";
import { Accordion } from "react-bootstrap";
import { CheckCircle } from "lucide-react";
import QuestionAccordion from "./QuestionAccordion";

const CategoryAccordion = ({
  category,
  answers,
  isQuestionCompleted,
  isCategoryCompleted,
  handleOptionChange,
  handleDescriptionChange,
  handleAccordionChange,
}) => {
  return (
    <Accordion key={category.id} className="mb-4 modern-accordion">
      <Accordion.Item eventKey={category.id}>
        <Accordion.Header
          className={isCategoryCompleted(category) ? "category-completed" : ""}
        >
          <div className="d-flex align-items-center justify-content-between w-100">
            <span>{category.name}</span>
            {isCategoryCompleted(category) && (
              <CheckCircle
                size={20}
                className="ms-2 text-success"
                style={{ marginRight: "10px" }}
              />
            )}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <Accordion className="nested-accordion">
            {category.questions.map((question) => (
              <QuestionAccordion
                key={question.id}
                question={question}
                answer={answers[question.id] || {}}
                isCompleted={isQuestionCompleted(question.id)}
                onOptionChange={(option) => handleOptionChange(question.id, option)}
                onDescriptionChange={(content) => handleDescriptionChange(question.id, content)}
                onAccordionChange={() => handleAccordionChange(question.id)}
              />
            ))}
          </Accordion>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default CategoryAccordion;