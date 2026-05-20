import React, { useEffect } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step2ClassSelect() {
  const {
    selectedBoard,
    classes,
    selectedClass,
    isLoading,
    errors,
    loadClasses,
    setSelectedClass,
    goNext,
    goBack,
    clearError,
  } = useTestMaker();

  useEffect(() => {
    const boardId = selectedBoard?.board_id || localStorage.getItem("board_id"); if (boardId) {
      loadClasses(boardId);
    }
  }, [selectedBoard]);

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
  };

  const handleNext = () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }
    localStorage.setItem("class_id", selectedClass?.class_id); window.location.href = "/test-maker/step-3";
  };

  return (
    <div className="step-page">
      {/* Header */}
      <div className="step-header-section">
        <div className="step-header-content">
          <div className="breadcrumb">
            <span className="breadcrumb-item">{selectedBoard?.board_name}</span>
            <i className="ti ti-chevron-right"></i>
            <span className="breadcrumb-item active">Select Class</span>
          </div>
          <h1 className="step-heading">
            <span className="step-number">02</span>
            Choose Your Class
          </h1>
          <p className="step-description">
            Select the class level to filter the curriculum and content
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="step-content">
        {errors.classes && (
          <ErrorAlert
            message={errors.classes}
            onClose={() => clearError('classes')}
          />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading classes..." />
        ) : (
          <>
            {/* Classes Horizontal Scroll */}
            <div className="classes-section">
              {classes.length > 0 ? (
                <>
                  <div className="classes-wrapper">
                    <div className="classes-scroll">
                      {classes.map((cls) => (
                        <div
                          key={cls.class_id}
                          onClick={() => handleSelectClass(cls)}
                          className={`class-button ${
                            selectedClass?.class_id === cls.class_id ? 'active' : ''
                          }`}
                        >
                          <div className="button-content">
                            <i className="ti ti-book-2"></i>
                            <span className="class-text">{cls.class_name}</span>
                          </div>
                          {selectedClass?.class_id === cls.class_id && (
                            <div className="active-indicator">
                              <i className="ti ti-check"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Class Info Card */}
                  {selectedClass && (
                    <div className="selected-info">
                      <div className="info-content">
                        <h3>Selected Class</h3>
                        <p className="selected-name">{selectedClass.class_name}</p>
                        <p className="info-text">Ready to proceed to the next step</p>
                      </div>
                      <i className="ti ti-check-circle"></i>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="ti ti-inbox"></i>
                  </div>
                  <p className="empty-text">No classes available</p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="step-actions">
              <button onClick={goBack} className="btn btn-ghost">
                <i className="ti ti-arrow-left"></i>
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedClass || isLoading}
                className={`btn btn-primary ${!selectedClass || isLoading ? 'disabled' : ''}`}
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

        .breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #999;
        }

        .breadcrumb-item {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .breadcrumb-item:hover {
          background: white;
          color: #00bcd4;
        }

        .breadcrumb-item.active {
          color: #00bcd4;
          font-weight: 600;
          background: white;
        }

        .breadcrumb i {
          font-size: 16px;
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
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
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

        .classes-section {
          background: white;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .classes-wrapper {
          position: relative;
          margin-bottom: 30px;
        }

        .classes-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 0;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #00bcd4 #f0f0f0;
        }

        .classes-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .classes-scroll::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }

        .classes-scroll::-webkit-scrollbar-thumb {
          background: #00bcd4;
          border-radius: 3px;
        }

        .classes-scroll::-webkit-scrollbar-thumb:hover {
          background: #0097a7;
        }

        .class-button {
          flex-shrink: 0;
          min-width: 160px;
          height: 120px;
          background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .class-button:hover {
          border-color: #00bcd4;
          background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
          box-shadow: 0 8px 24px rgba(0, 188, 212, 0.15);
          transform: translateY(-4px);
        }

        .class-button.active {
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
          border-color: #00bcd4;
          color: white;
          box-shadow: 0 12px 32px rgba(0, 188, 212, 0.3);
          transform: translateY(-6px);
        }

        .button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .button-content i {
          font-size: 28px;
          color: #00bcd4;
        }

        .class-button.active .button-content i {
          color: white;
        }

        .class-text {
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          color: #333;
          word-wrap: break-word;
          line-height: 1.3;
        }

        .class-button.active .class-text {
          color: white;
        }

        .active-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

        .selected-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 2px solid #4caf50;
          border-radius: 12px;
          padding: 20px 24px;
          animation: slideIn 0.4s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .info-content h3 {
          font-size: 14px;
          font-weight: 600;
          color: #2e7d32;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .selected-name {
          font-size: 18px;
          font-weight: 700;
          color: #1b5e20;
          margin: 0 0 4px 0;
        }

        .info-text {
          font-size: 13px;
          color: #558b2f;
          margin: 0;
        }

        .selected-info i {
          font-size: 32px;
          color: #4caf50;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
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
          max-width: 1200px;
          margin: 0 auto;
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
          background: linear-gradient(135deg, #00bcd4 0%, #0097a7 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(0, 188, 212, 0.3);
        }

        .btn-primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 188, 212, 0.4);
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
          color: #00bcd4;
        }

        .btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .step-page {
            padding: 24px 16px;
          }

          .breadcrumb {
            font-size: 13px;
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

          .classes-section {
            padding: 24px;
          }

          .class-button {
            min-width: 140px;
            height: 110px;
            padding: 12px;
          }

          .class-text {
            font-size: 12px;
          }

          .button-content i {
            font-size: 24px;
          }

          .selected-info {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .selected-info i {
            font-size: 28px;
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

          .class-button {
            min-width: 120px;
            height: 100px;
          }

          .classes-section {
            padding: 20px;
            margin-bottom: 30px;
          }
        }
      `}</style>
    </div>
  );
}