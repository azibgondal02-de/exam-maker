import React from 'react';

const steps = [
  { num: 1, label: 'Board' },
  { num: 2, label: 'Class' },
  { num: 3, label: 'Subject' },
  { num: 4, label: 'Topics' },
  { num: 5, label: 'Config' },
  { num: 6, label: 'Questions' },
  { num: 7, label: 'Review' },
];

export default function ProgressBar({ currentStep, onStepClick }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar-wrapper">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <React.Fragment key={step.num}>
              <div
                onClick={() => onStepClick?.(step.num)}
                className={`progress-step ${currentStep >= step.num ? 'active' : ''} ${
                  currentStep === step.num ? 'current' : ''
                }`}
              >
                <div className="step-circle">
                  {currentStep > step.num ? (
                    <i className="ti ti-check"></i>
                  ) : (
                    <span>{step.num}</span>
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`progress-line ${
                    currentStep > step.num ? 'completed' : ''
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style jsx>{`
        .progress-bar-container {
          background: white;
          border-bottom: 1px solid #e0e0e0;
          padding: 24px 20px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .progress-bar-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .progress-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: opacity 0.3s ease;
          opacity: 0.4;
        }

        .progress-step.active {
          opacity: 1;
        }

        .step-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f5f5f5;
          border: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .progress-step.current .step-circle {
          background: #2196f3;
          border-color: #2196f3;
          color: white;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
        }

        .progress-step.active:not(.current) .step-circle {
          background: #4caf50;
          border-color: #4caf50;
          color: white;
          font-size: 18px;
        }

        .step-label {
          font-size: 12px;
          font-weight: 500;
          color: #999;
          text-align: center;
          white-space: nowrap;
        }

        .progress-step.current .step-label {
          color: #2196f3;
          font-weight: 600;
        }

        .progress-step.active:not(.current) .step-label {
          color: #4caf50;
        }

        .progress-line {
          height: 2px;
          background: #e0e0e0;
          flex: 0.8;
          margin: 0 -4px;
          transition: background 0.3s ease;
        }

        .progress-line.completed {
          background: #4caf50;
        }

        @media (max-width: 768px) {
          .progress-bar-container {
            padding: 16px 12px;
          }

          .progress-steps {
            gap: 4px;
          }

          .step-circle {
            width: 36px;
            height: 36px;
            font-size: 13px;
            margin-bottom: 6px;
          }

          .step-label {
            font-size: 10px;
          }

          .progress-line {
            flex: 0.5;
            margin: 0 -2px;
          }
        }
      `}</style>
    </div>
  );
}