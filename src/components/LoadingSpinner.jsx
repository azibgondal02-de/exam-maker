import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner">
        <div className="spinner-ring"></div>
      </div>
      <p className="spinner-message">{message}</p>

      <style jsx>{`
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin-bottom: 20px;
        }

        .spinner-ring {
          width: 100%;
          height: 100%;
          border: 4px solid #f0f0f0;
          border-top-color: #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .spinner-message {
          font-size: 15px;
          color: #999;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}