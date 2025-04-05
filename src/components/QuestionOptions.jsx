import React from "react";

const QuestionOptions = ({ question, value, onChange }) => {
  if (question.type !== "options") return null;
  
  return (
    <div className="mb-3">
      {question.options.map((option, idx) => (
        <div key={idx} className="form-check">
          <input
            type="radio"
            id={`${question.id}-${idx}`}
            name={`question-${question.id}`}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="form-check-input"
          />
          <label
            htmlFor={`${question.id}-${idx}`}
            className="form-check-label"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default QuestionOptions;