function CallLogs({ calls }) {
  if (calls.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📞</div>
        <div className="empty-title">No Call Logs Yet</div>
        <div className="empty-text">
          Call logs will appear here as emergency calls are received and processed.
        </div>
      </div>
    );
  }

  return (
    <table className="call-table">
      <thead>
        <tr>
          <th>Call ID</th>
          <th>Caller</th>
          <th>Direction</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {calls.map((call) => (
          <tr key={call._id}>
            <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {call.callSid?.substring(0, 16) || 'N/A'}
            </td>
            <td>{call.callerNumber || 'Unknown'}</td>
            <td>
              <span style={{ fontSize: '12px' }}>
                {call.direction === 'incoming' ? '📥' : '📤'} {call.direction}
              </span>
            </td>
            <td>
              <span className={`badge badge-${call.status === 'completed' ? 'resolved' : call.status === 'in-progress' ? 'dispatched' : 'pending'}`}>
                {call.status}
              </span>
            </td>
            <td>{call.duration ? `${call.duration}s` : '—'}</td>
            <td style={{ fontSize: '13px' }}>
              {new Date(call.createdAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CallLogs;
