import React from "react";

const SurveyProgressCard = ({ percentage }) => {
  return (
    <div className="progress-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="progress-title mb-0">Survey Progress</h5>
        {/*<span className="progress-percentage">{percentage}%</span>*/}
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default SurveyProgressCard;