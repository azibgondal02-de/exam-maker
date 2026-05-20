import React, { useEffect } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step1BoardSelect() {
  const {
    boards,
    selectedBoard,
    isLoading,
    errors,
    loadBoards,
    setSelectedBoard,
    goNext,
    clearError,
  } = useTestMaker();

  useEffect(() => {
    loadBoards();
  }, []);

  const handleSelectBoard = (board) => {
    setSelectedBoard(board);
  };

  const handleNext = () => {
    if (!selectedBoard) {
      alert('Please select a board');
      return;
    }
    localStorage.setItem("board_id", selectedBoard?.board_id); window.location.href = "/test-maker/step-2";
  };

  const boardIcons = {
    default: 'ti-school',
  };

  return (
    <div className="step-page">
      {/* Header */}
      <div className="step-header-section">
        <div className="step-header-content">
          <h1 className="step-heading">
            <span className="step-number">01</span>
            Select Your Board
          </h1>
          <p className="step-description">
            Choose your educational board to begin creating the perfect test for your students
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="step-content">
        {errors.boards && (
          <ErrorAlert
            message={errors.boards}
            onClose={() => clearError('boards')}
          />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading boards..." />
        ) : (
          <>
            {/* Boards Grid */}
            <div className="boards-container">
              {boards.length > 0 ? (
                <div className="boards-grid">
                  {boards.map((board, index) => (
                    <div
                      key={board.board_id}
                      onClick={() => handleSelectBoard(board)}
                      className={`board-tile ${
                        selectedBoard?.board_id === board.board_id ? 'selected' : ''
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="tile-inner">
                        <div className="tile-icon-wrapper">
                          <i className={`ti ${boardIcons.default}`}></i>
                        </div>
                        <h3 className="tile-name">{board.board_name}</h3>
                        <p className="tile-hint">Click to select</p>
                        
                        {selectedBoard?.board_id === board.board_id && (
                          <div className="tile-badge">
                            <i className="ti ti-check"></i>
                          </div>
                        )}
                      </div>
                      <div className="tile-overlay"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="ti ti-inbox"></i>
                  </div>
                  <p className="empty-text">No boards available</p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="step-actions">
              <button disabled className="btn btn-ghost">
                <i className="ti ti-arrow-left"></i>
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedBoard || isLoading}
                className={`btn btn-primary ${!selectedBoard || isLoading ? 'disabled' : ''}`}
              >
                <span>Next</span>
                <i className="ti ti-arrow-right"></i>
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .step-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%);
          padding: 40px 20px;
        }

        .step-header-section {
          max-width: 1200px;
          margin: 0 auto 50px;
        }

        .step-header-content {
          text-align: center;
        }

        .step-heading {
          font-size: 42px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          letter-spacing: -0.5px;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 600;
        }

        .step-description {
          font-size: 16px;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .step-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .boards-container {
          margin-bottom: 50px;
        }

        .boards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 28px;
          margin-bottom: 40px;
        }

        .board-tile {
          position: relative;
          cursor: pointer;
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tile-inner {
          position: relative;
          background: white;
          border-radius: 16px;
          padding: 40px 28px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 2px solid transparent;
          z-index: 2;
        }

        .board-tile:hover .tile-inner {
          transform: translateY(-8px);
          border-color: #2196f3;
          box-shadow: 0 20px 40px rgba(33, 150, 243, 0.15);
        }

        .board-tile.selected .tile-inner {
          background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
          border-color: #2196f3;
          box-shadow: 0 12px 32px rgba(33, 150, 243, 0.2);
        }

        .tile-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0) 100%);
          border-radius: 16px;
          pointer-events: none;
        }

        .tile-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
          color: white;
          transition: all 0.4s ease;
        }

        .board-tile:hover .tile-icon-wrapper {
          transform: scale(1.1);
          box-shadow: 0 12px 28px rgba(33, 150, 243, 0.3);
        }

        .tile-name {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          word-break: break-word;
        }

        .tile-hint {
          font-size: 13px;
          color: #999;
          margin: 0;
          font-weight: 500;
        }

        .tile-badge {
          position: absolute;
          top: -12px;
          right: -12px;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 22px;
          box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #999;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 24px;
          opacity: 0.2;
          display: block;
        }

        .empty-text {
          font-size: 16px;
          margin: 0;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-top: 30px;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .btn {
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: capitalize;
        }

        .btn i {
          font-size: 18px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.3);
        }

        .btn-primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(33, 150, 243, 0.4);
        }

        .btn-primary:active:not(.disabled) {
          transform: translateY(0);
        }

        .btn-ghost {
          background: transparent;
          color: #999;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .btn-ghost:hover:not(.disabled) {
          background: white;
          border-color: rgba(0, 0, 0, 0.2);
        }

        .btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .step-page {
            padding: 24px 16px;
          }

          .step-heading {
            font-size: 28px;
            gap: 12px;
            flex-direction: column;
          }

          .step-number {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .step-description {
            font-size: 14px;
          }

          .boards-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }

          .tile-inner {
            padding: 32px 20px;
          }

          .tile-icon-wrapper {
            width: 64px;
            height: 64px;
            font-size: 32px;
          }

          .tile-name {
            font-size: 16px;
          }

          .step-actions {
            flex-direction: column;
            gap: 12px;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .step-heading {
            font-size: 22px;
          }

          .boards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}