import React from 'react';
import '../styles/Dashboard.css';

const PorterMatrixStatic = () => {
  return (
    <div className="porter-container">
      <h4 className="text-center mb-4"><strong>Porter's Five Forces – Static View</strong></h4>

      <div className="porter-forces">
        <div className="force top">Threat of New Entrants<br /><span>Low barriers to entry can increase competition.</span> </div>
        <div className="force left">Bargaining Power of Suppliers<br /><span>High when few suppliers dominate the market.</span></div>
        <div className="force center">Competitive Rivalry<br /><span>Direct competition between existing companies.</span></div>
        <div className="force right">Bargaining Power of Buyers<br /><span>Buyers can demand lower prices or better services.</span></div>
        <div className="force bottom">Threat of Substitutes<br /><span>Alternative products can reduce market share.</span></div>
      </div>
    </div>
  );
};

export default PorterMatrixStatic;
