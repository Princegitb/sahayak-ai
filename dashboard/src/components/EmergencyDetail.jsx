const ACTION_ICONS = {
  ambulance_dispatch: '🚑',
  hospital_notification: '🏥',
  fire_brigade_dispatch: '🚒',
  police_dispatch: '🚔',
  status_update: '🔄'
};

function EmergencyDetail({ emergency, onClose, onStatusUpdate }) {
  const em = emergency;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="detail-title">
              {em.emergencyType?.replace(/_/g, ' ') || 'Emergency Details'}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className={`badge badge-${em.status}`}>{em.status}</span>
              <span className={`badge badge-${em.severity}`}>{em.severity}</span>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>✕ Close</button>
        </div>

        {/* Transcript */}
        <div className="detail-section">
          <div className="detail-section-title">📝 Caller Transcript</div>
          <div className="detail-transcript">
            "{em.transcript || 'No transcript available'}"
          </div>
        </div>

        {/* Emergency Details Grid */}
        <div className="detail-section">
          <div className="detail-section-title">📋 Emergency Details</div>
          <div className="detail-grid">
            <div className="detail-field">
              <div className="detail-field-label">Type</div>
              <div className="detail-field-value">
                {em.emergencyType?.replace(/_/g, ' ') || 'Unknown'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Severity</div>
              <div className="detail-field-value" style={{ color: em.severity === 'critical' ? '#ef4444' : em.severity === 'high' ? '#f97316' : 'inherit' }}>
                {em.severity || 'Unknown'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Location</div>
              <div className="detail-field-value">
                {em.location?.description || 'Unknown'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">People Involved</div>
              <div className="detail-field-value">{em.peopleInvolved || 'Unknown'}</div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Caller</div>
              <div className="detail-field-value" style={{ fontSize: '13px' }}>
                {em.callerNumber || 'Unknown'}
              </div>
            </div>
            <div className="detail-field">
              <div className="detail-field-label">Call SID</div>
              <div className="detail-field-value" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {em.callSid || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Response */}
        <div className="detail-section">
          <div className="detail-section-title">🤖 AI Response</div>
          <div className="detail-ai-response">
            {em.aiResponse || 'No AI response recorded'}
          </div>
        </div>

        {/* Actions Taken */}
        {em.actions && em.actions.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">⚡ Actions Taken</div>
            <div className="detail-actions-list">
              {em.actions.map((action, idx) => (
                <div key={idx} className="action-item">
                  <span className="action-icon">
                    {ACTION_ICONS[action.type] || '📌'}
                  </span>
                  <div>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {action.type?.replace(/_/g, ' ')}
                    </strong>
                    {action.description && (
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {action.description}
                      </div>
                    )}
                  </div>
                  <span className="time-ago" style={{ marginLeft: 'auto' }}>
                    {action.timestamp && new Date(action.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Controls */}
        <div className="detail-section">
          <div className="detail-section-title">🔄 Update Status</div>
          <div className="status-controls">
            {em.status !== 'dispatched' && (
              <button
                className="status-btn dispatched"
                onClick={() => onStatusUpdate(em._id, 'dispatched')}
              >
                🚑 Mark Dispatched
              </button>
            )}
            {em.status !== 'en_route' && (
              <button
                className="status-btn dispatched"
                onClick={() => onStatusUpdate(em._id, 'en_route')}
              >
                🛣️ Mark En Route
              </button>
            )}
            {em.status !== 'resolved' && (
              <button
                className="status-btn resolved"
                onClick={() => onStatusUpdate(em._id, 'resolved')}
              >
                ✅ Mark Resolved
              </button>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          Created: {new Date(em.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </div>
    </div>
  );
}

export default EmergencyDetail;
