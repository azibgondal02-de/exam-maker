import React from 'react';

export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-alert">
      <div className="error-content">
        <i className="ti ti-alert-circle"></i>
        <p className="error-message">{message}</p>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose}>
          <i className="ti ti-x"></i>
        </button>
      )}

      <style jsx>{`
        .error-alert {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: #ffebee;
          border: 1px solid #ffcdd2;
          border-left: 4px solid #f44336;
          border-radius: 8px;
          margin-bottom: 24px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .error-content i {
          color: #f44336;
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .error-message {
          color: #c62828;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .error-close {
          background: transparent;
          border: none;
          color: #f44336;
          cursor: pointer;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: color 0.2s ease;
          flex-shrink: 0;
        }

        .error-close:hover {
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
}