import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import EmergencyList from './components/EmergencyList';
import CallLogs from './components/CallLogs';
import EmergencyDetail from './components/EmergencyDetail';

const API_BASE = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('emergencies');
  const [emergencies, setEmergencies] = useState([]);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [emergRes, callsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/emergencies`),
        axios.get(`${API_BASE}/calls`),
        axios.get(`${API_BASE}/stats`)
      ]);

      setEmergencies(emergRes.data.data || []);
      setCalls(callsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/emergencies/${id}/status`, { status });
      fetchData();
      if (selectedEmergency && selectedEmergency._id === id) {
        const res = await axios.get(`${API_BASE}/emergencies/${id}`);
        setSelectedEmergency(res.data.data);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSimulate = async (text) => {
    try {
      await axios.post('/voice/simulate', { text, callerNumber: '+91-DASHBOARD' });
      setTimeout(fetchData, 1000);
    } catch (err) {
      console.error('Simulation failed:', err);
      throw err;
    }
  };

  const pendingCount = emergencies.filter(e => e.status === 'pending' || e.status === 'dispatched').length;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">🚑</div>
          <div>
            <div className="header-title">Sahayak AI</div>
            <div className="header-subtitle">Emergency Response System</div>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot"></span>
          System Active
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card total">
          <div className="stat-label">Total Emergencies</div>
          <div className="stat-value">{stats?.totalEmergencies || 0}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats?.pending || 0}</div>
        </div>
        <div className="stat-card dispatched">
          <div className="stat-label">Dispatched</div>
          <div className="stat-value">{stats?.dispatched || 0}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats?.resolved || 0}</div>
        </div>
        <div className="stat-card calls">
          <div className="stat-label">Total Calls</div>
          <div className="stat-value">{stats?.totalCalls || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'emergencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergencies')}
        >
          🚨 Live Emergencies
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        <button
          className={`tab ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          📞 Call Logs
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading...
          </div>
        ) : activeTab === 'emergencies' ? (
          <EmergencyList
            emergencies={emergencies}
            onSelect={setSelectedEmergency}
            onSimulate={handleSimulate}
          />
        ) : (
          <CallLogs calls={calls} />
        )}
      </div>

      {/* Detail Modal */}
      {selectedEmergency && (
        <EmergencyDetail
          emergency={selectedEmergency}
          onClose={() => setSelectedEmergency(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

export default App;
