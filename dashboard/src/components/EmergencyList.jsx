import { useState } from 'react';

const EMERGENCY_ICONS = {
  accident: '🚗',
  cardiac_arrest: '❤️',
  fire: '🔥',
  natural_disaster: '🌊',
  crime: '🚔',
  breathing_difficulty: '😮‍💨',
  injury: '🩹',
  other: '🆘',
  unknown: '❓'
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function EmergencyList({ emergencies, onSelect, onSimulate }) {
  const [simText, setSimText] = useState('');
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!simText.trim()) return;

    setSimulating(true);
    try {
      await onSimulate(simText);
      setSimText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div>
      {/* Call Simulator */}
      <div className="simulator">
        <div className="simulator-title">
          🧪 Emergency Call Simulator
        </div>
        <form className="simulator-form" onSubmit={handleSimulate}>
          <input
            className="simulator-input"
            type="text"
            placeholder='Type emergency text e.g. "Mera accident ho gaya hai, MG Road pe"'
            value={simText}
            onChange={(e) => setSimText(e.target.value)}
            disabled={simulating}
          />
          <button
            className="simulator-btn"
            type="submit"
            disabled={simulating || !simText.trim()}
          >
            {simulating ? '⏳ Processing...' : '📞 Simulate Call'}
          </button>
        </form>
      </div>

      {/* Emergency List */}
      {emergencies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <div className="empty-title">No Emergencies Yet</div>
          <div className="empty-text">
            Use the simulator above to send a test emergency call, or wait for incoming calls from Exotel.
          </div>
        </div>
      ) : (
        <div className="emergency-list">
          {emergencies.map((em) => (
            <div
              key={em._id}
              className={`emergency-card severity-${em.severity}`}
              onClick={() => onSelect(em)}
            >
              <div className="emergency-icon">
                {EMERGENCY_ICONS[em.emergencyType] || '🆘'}
              </div>

              <div className="emergency-info">
                <div className="emergency-type">
                  {em.emergencyType?.replace(/_/g, ' ') || 'Unknown Emergency'}
                </div>
                <div className="emergency-meta">
                  <span className="meta-item">
                    <span className="icon">📍</span>
                    {em.location?.description || 'Unknown Location'}
                  </span>
                  <span className="meta-item">
                    <span className="icon">👥</span>
                    {em.peopleInvolved || '?'} people
                  </span>
                  <span className="meta-item">
                    <span className="icon">📱</span>
                    {em.callerNumber || 'Unknown'}
                  </span>
                  <span className="meta-item time-ago">
                    {timeAgo(em.createdAt)}
                  </span>
                </div>
              </div>

              <div className="emergency-actions">
                <span className={`badge badge-${em.status}`}>
                  {em.status}
                </span>
                <span className={`badge badge-${em.severity}`}>
                  {em.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmergencyList;
