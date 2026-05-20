import React from 'react';

export default function Sidebar({ selections, onEdit }) {
  const items = [
    { key: 'board', label: 'Board', value: selections.board?.board_name },
    { key: 'class', label: 'Class', value: selections.class?.class_name },
    { key: 'subject', label: 'Subject', value: selections.subject?.subject_name },
    {
      key: 'topics',
      label: 'Topics',
      value: selections.topics?.length
        ? `${selections.topics.length} selected`
        : 'Not selected',
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <h3 className="sidebar-title">Progress Summary</h3>

        <div className="summary-list">
          {items.map((item) => (
            <div
              key={item.key}
              className={`summary-item ${item.value ? 'filled' : ''}`}
            >
              <div className="item-label">{item.label}</div>
              <div className="item-value">{item.value || '—'}</div>
              {item.value && (
                <button
                  onClick={() => onEdit?.(item.key)}
                  className="item-edit"
                >
                  <i className="ti ti-edit"></i>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-hint">
          <i className="ti ti-info-circle"></i>
          <span>Click "Edit" to modify your selections</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e0e0e0;
          padding: 24px;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
          position: sticky;
          top: 80px;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          padding: 12px;
          background: #f9f9f9;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .summary-item:hover {
          border-color: #d0d0d0;
          background: #fafafa;
        }

        .summary-item.filled {
          background: #f0f7ff;
          border-color: #b3d9ff;
        }

        .item-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .item-value {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          word-break: break-word;
          margin-bottom: 6px;
        }

        .item-edit {
          font-size: 14px;
          background: transparent;
          border: none;
          color: #2196f3;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }

        .item-edit:hover {
          color: #1976d2;
        }

        .sidebar-hint {
          padding: 12px;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 3px solid #2196f3;
          font-size: 13px;
          color: #1565c0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .sidebar-hint i {
          flex-shrink: 0;
          font-size: 16px;
          margin-top: 1px;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 240px;
            padding: 20px;
          }

          .sidebar-title {
            font-size: 15px;
          }

          .item-value {
            font-size: 13px;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}