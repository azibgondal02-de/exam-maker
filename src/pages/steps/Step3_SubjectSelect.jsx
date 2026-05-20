import React, { useEffect, useMemo } from 'react';
import { useTestMaker } from '../../hooks/useTestMaker';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';

export default function Step3SubjectSelect() {
  const {
    selectedClass,
    subjects,
    selectedSubject,
    isLoading,
    errors,
    loadSubjects,
    setSelectedSubject,
    goNext,
    goBack,
    clearError,
  } = useTestMaker();

  useEffect(() => {
    const classId = selectedClass?.class_id || localStorage.getItem("class_id"); if (classId) {
      loadSubjects(classId);
    }
  }, [selectedClass]);

  // Separate old and new subjects
  const { oldSubjects, newSubjects } = useMemo(() => {
    return {
      newSubjects: subjects.filter(s => s.old_subject === 0),
      oldSubjects: subjects.filter(s => s.old_subject === 1),
    };
  }, [subjects]);

  // Random color palette for subject buttons
  const colorPalette = [
    { bg: '#fce4ec', border: '#e91e63', icon: '#c2185b', text: '#880e4f' },
    { bg: '#f3e5f5', border: '#9c27b0', icon: '#7b1fa2', text: '#4a148c' },
    { bg: '#ede7f6', border: '#673ab7', icon: '#512da8', text: '#311b92' },
    { bg: '#e8eaf6', border: '#3f51b5', icon: '#283593', text: '#1a237e' },
    { bg: '#e3f2fd', border: '#2196f3', icon: '#1565c0', text: '#0d47a1' },
    { bg: '#e0f2f1', border: '#009688', icon: '#00695c', text: '#004d40' },
    { bg: '#e8f5e9', border: '#4caf50', icon: '#2e7d32', text: '#1b5e20' },
    { bg: '#f1f8e9', border: '#8bc34a', icon: '#558b2f', text: '#33691e' },
    { bg: '#fffde7', border: '#cddc39', icon: '#9e9d24', text: '#6d6d00' },
    { bg: '#fff3e0', border: '#ff9800', icon: '#e65100', text: '#bf360c' },
    { bg: '#ffe0b2', border: '#ff9800', icon: '#e65100', text: '#bf360c' },
    { bg: '#ffebee', border: '#f44336', icon: '#d32f2f', text: '#b71c1c' },
  ];

  const getRandomColor = (index) => {
    return colorPalette[index % colorPalette.length];
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject); localStorage.setItem("subject_id", subject.subject_id);
  };

  const handleNext = () => {
    if (!selectedSubject) {
      alert('Please select a subject');
      return;
    }
    localStorage.setItem("subject_id", selectedSubject?.subject_id); window.location.href = "/test-maker/step-4";
  };

  const SubjectButton = ({ subject, isSelected, colorIndex }) => {
    const color = getRandomColor(colorIndex);
    return (
      <button
        onClick={() => handleSelectSubject(subject)}
        className={`subject-btn ${isSelected ? 'active' : ''}`}
        style={isSelected ? {
          background: `linear-gradient(135deg, ${color.border} 0%, ${color.icon} 100%)`,
          borderColor: color.border,
          color: 'white',
        } : {
          background: color.bg,
          borderColor: color.border,
        }}
        title={subject.subject_name}
      >
        <div className="btn-content">
          <i className="ti ti-book" style={isSelected ? { color: 'white' } : { color: color.border }}></i>
          <span className="btn-text">{subject.subject_name}</span>
        </div>
        {isSelected && (
          <div className="btn-check">
            <i className="ti ti-check"></i>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="step-page">
      {/* Header */}
      <div className="step-header-section">
        <div className="breadcrumb">
          <span className="breadcrumb-item">{selectedClass?.class_name}</span>
          <i className="ti ti-chevron-right"></i>
          <span className="breadcrumb-item active">Select Subject</span>
        </div>
        <h1 className="step-heading">
          <span className="step-number">03</span>
          Choose Your Subject
        </h1>
        <p className="step-description">
          Select from new or old curriculum subjects
        </p>
      </div>

      {/* Content */}
      <div className="step-content">
        {errors.subjects && (
          <ErrorAlert
            message={errors.subjects}
            onClose={() => clearError('subjects')}
          />
        )}

        {isLoading ? (
          <LoadingSpinner message="Loading subjects..." />
        ) : (
          <>
            {subjects.length > 0 ? (
              <>
                {/* New Curriculum Section */}
                {newSubjects.length > 0 && (
                  <div className="section-container">
                    <div className="section-header">
                      <div className="badge new-badge">⭐ NEW</div>
                      <h2 className="section-title">Latest Curriculum</h2>
                      <span className="section-count">{newSubjects.length} subjects</span>
                    </div>
                    <div className="subjects-grid">
                      {newSubjects.map((subject, index) => (
                        <SubjectButton
                          key={subject.subject_id}
                          subject={subject}
                          isSelected={selectedSubject?.subject_id === subject.subject_id}
                          colorIndex={index}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Old Curriculum Section */}
                {oldSubjects.length > 0 && (
                  <div className="section-container">
                    <div className="section-header">
                      <div className="badge old-badge">📚 OLD</div>
                      <h2 className="section-title">Previous Curriculum</h2>
                      <span className="section-count">{oldSubjects.length} subjects</span>
                    </div>
                    <div className="subjects-grid">
                      {oldSubjects.map((subject, index) => (
                        <SubjectButton
                          key={subject.subject_id}
                          subject={subject}
                          isSelected={selectedSubject?.subject_id === subject.subject_id}
                          colorIndex={index + newSubjects.length}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <i className="ti ti-inbox"></i>
                <p className="empty-text">No subjects available for this class</p>
              </div>
            )}

            {/* Selected Subject Info */}
            {selectedSubject && (
              <div className="selected-info">
                <div className="info-left">
                  <p className="info-label">Selected Subject</p>
                  <h3 className="info-name">{selectedSubject.subject_name}</h3>
                  <p className="info-type">
                    {selectedSubject.old_subject === 1 ? '📚 Old Curriculum' : '⭐ New Curriculum'}
                  </p>
                </div>
                <i className="ti ti-check-circle"></i>
              </div>
            )}

            {/* Action Footer */}
            <div className="step-actions">
              <button onClick={goBack} className="btn btn-ghost">
                <i className="ti ti-arrow-left"></i>
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedSubject || isLoading}
                className={`btn btn-primary ${!selectedSubject || isLoading ? 'disabled' : ''}`}
              >
                Next
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
          max-width: 1000px;
          margin: 0 auto 40px;
          text-align: center;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #999;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .breadcrumb-item.active {
          color: #673ab7;
          font-weight: 600;
          background: white;
        }

        .step-heading {
          font-size: 40px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
          color: white;
          border-radius: 50%;
          font-size: 24px;
          font-weight: 600;
        }

        .step-description {
          font-size: 16px;
          color: #666;
          margin: 0;
        }

        .step-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-container {
          background: white;
          border-radius: 14px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          animation: fadeInUp 0.5s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
          flex-shrink: 0;
          color: white;
        }

        .badge.new-badge {
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .badge.old-badge {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        .section-count {
          font-size: 13px;
          color: #999;
          background: #f5f5f5;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 500;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 14px;
        }

        .subject-btn {
          position: relative;
          border: 2px solid;
          border-radius: 12px;
          padding: 18px 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-family: inherit;
          min-height: 110px;
          justify-content: center;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .subject-btn i {
          font-size: 28px;
        }

        .btn-text {
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          line-height: 1.3;
          color: inherit;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          word-break: break-word;
        }

        .subject-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .subject-btn.active {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
          transform: translateY(-6px);
        }

        .btn-check {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
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

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-state i {
          font-size: 80px;
          margin-bottom: 16px;
          opacity: 0.2;
        }

        .empty-text {
          margin: 0;
          font-size: 16px;
        }

        .selected-info {
          background: linear-gradient(135deg, #f3e5f5 0%, #ede7f6 100%);
          border: 2px solid #673ab7;
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 32px;
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

        .info-left {
          flex: 1;
        }

        .info-label {
          font-size: 12px;
          font-weight: 700;
          color: #512da8;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-name {
          font-size: 18px;
          font-weight: 700;
          color: #4a148c;
          margin: 0 0 4px 0;
        }

        .info-type {
          font-size: 13px;
          color: #7b1fa2;
          margin: 0;
        }

        .selected-info i {
          font-size: 32px;
          color: #673ab7;
          flex-shrink: 0;
        }

        .step-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .btn {
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }

        .btn i {
          font-size: 16px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(103, 58, 183, 0.25);
        }

        .btn-primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(103, 58, 183, 0.3);
        }

        .btn-ghost {
          background: transparent;
          color: #999;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .btn-ghost:hover:not(.disabled) {
          background: white;
          color: #673ab7;
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
          }

          .step-number {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }

          .section-container {
            padding: 24px;
            margin-bottom: 24px;
          }

          .section-header {
            margin-bottom: 20px;
            gap: 12px;
          }

          .badge {
            width: 44px;
            height: 44px;
            font-size: 18px;
          }

          .section-title {
            font-size: 16px;
          }

          .subjects-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }

          .subject-btn {
            padding: 14px 10px;
            min-height: 100px;
          }

          .subject-btn i {
            font-size: 24px;
          }

          .btn-text {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .step-heading {
            font-size: 22px;
          }

          .section-container {
            padding: 20px;
            margin-bottom: 20px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .section-title {
            font-size: 14px;
          }

          .subjects-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }

          .subject-btn {
            padding: 12px 8px;
            min-height: 90px;
          }

          .btn-text {
            font-size: 11px;
          }

          .selected-info {
            padding: 16px;
            flex-direction: column;
            text-align: center;
          }

          .selected-info i {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}