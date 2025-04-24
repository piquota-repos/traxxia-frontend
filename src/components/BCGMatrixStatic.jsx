import React from 'react';
import '../styles/Dashboard.css';  

const BCGMatrixStatic = () => {
  const matrixData = {
    'Stars': [
      'iPhone – High market share and high growth.',
      'Apple Watch – Gaining traction rapidly.'
    ],
    'Cash Cows': [
      'MacBooks – High share but in mature market.',
      'iPads – Strong revenue contributor.'
    ],
    'Question Marks': [
      'Apple Vision Pro – Innovative but uncertain market.',
      'Apple TV+ – Still building market presence.'
    ],
    'Dogs': [
      'iPod – Outdated and phased out.',
      'HomePod – Low adoption rate.'
    ]
  };

  return (
    <div className="bcg-matrix-template">
      <div className="bcg-matrix-header">
        <div></div>
        <div className="matrix-label-y">High Market Growth</div>
        <div></div>
      </div>

      <div className="bcg-matrix-grid">
        <div className="bcg-box stars">
          <h6>Stars</h6>
          {matrixData['Stars'].map((item, i) => (
            <div key={i} className="analysis-box">{item}</div>
          ))}
        </div>
        <div className="bcg-box question-marks">
          <h6>Question Marks</h6>
          {matrixData['Question Marks'].map((item, i) => (
            <div key={i} className="analysis-box">{item}</div>
          ))}
        </div>
        <div className="bcg-box cash-cows">
          <h6>Cash Cows</h6>
          {matrixData['Cash Cows'].map((item, i) => (
            <div key={i} className="analysis-box">{item}</div>
          ))}
        </div>
        <div className="bcg-box dogs">
          <h6>Dogs</h6>
          {matrixData['Dogs'].map((item, i) => (
            <div key={i} className="analysis-box">{item}</div>
          ))}
        </div>
      </div>

      <div className="bcg-matrix-footer">
        <div className="matrix-label-x">Low Market Share</div>
        <div className="matrix-label-x">High Market Share</div>
      </div>
    </div>
  );
};

export default BCGMatrixStatic;
