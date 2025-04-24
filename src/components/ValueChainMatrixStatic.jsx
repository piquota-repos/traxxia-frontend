import React from 'react';
import '../styles/Dashboard.css';

const ValueChainMatrixStatic = () => {
    return (
      <div className="value-chain-static">
        <h4 className="text-center mb-4"><strong>Value Chain Analysis – Walmart</strong></h4>
  
        <div className="support-activities">
          <div className="support-row">
            <div className="support-block infrastructure">Firm Infrastructure<br /><span>Centralized control and cost efficiency through Walmart’s corporate structure.</span></div>
            <div className="support-block hr">Human Resource Management<br /><span>Employee training and retention programs to support store-level performance.</span></div>
            <div className="support-block tech">Technology Development<br /><span>Advanced inventory management and data analytics for demand forecasting.</span></div>
            <div className="support-block procurement">Procurement<br /><span>Strategic vendor relationships and bulk purchasing at low cost.</span></div>
          </div>
        </div>
  
        <div className="primary-activities">
          <div className="primary-block inbound">Inbound Logistics<br /><span>Efficient supply chain and distribution centers for low-cost sourcing.</span></div>
          <div className="primary-block operations">Operations<br /><span>Streamlined retail operations with a focus on cost minimization.</span></div>
          <div className="primary-block outbound">Outbound Logistics<br /><span>Fast product restocking and optimized store layouts.</span></div>
          <div className="primary-block marketing">Marketing & Sales<br /><span>Everyday low pricing strategy and large-scale promotions.</span></div>
          <div className="primary-block services">Services<br /><span>Customer support, satisfaction guarantees, and returns processing.</span></div>
        </div>
      </div>
    );
  };

export default ValueChainMatrixStatic;
