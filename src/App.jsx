import { useState, useEffect, useRef } from 'react';
import './App.css';

const PERSONAS = ['storyteller', 'data', 'advisor'];

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Conversational' },
  { value: 'bold', label: 'Provocative' },
  { value: 'humble', label: 'Thought Leader' }
];

const LENGTHS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' }
];

const EMOJI_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const MAX_HISTORY = 5;

function App() {
  const [theme, setTheme] = useState('light');
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('storyteller');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [emojiLevel, setEmojiLevel] = useState('medium');
  const [outputs, setOutputs] = useState({
    storyteller: '',
    data: '',
    advisor: ''
  });
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const toastTimeoutRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Word count
  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;

  // Show toast notification
  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2000);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    const text = outputs[activeTab];
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      showToast('Failed to copy');
    }
  };

  // Save to history
  const saveToHistory = (newInput, newOutputs, settings) => {
    const draft = {
      id: Date.now(),
      input: newInput,
      outputs: { ...newOutputs },
      settings: { ...settings },
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.input !== newInput);
      return [draft, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  // Restore from history
  const restoreHistory = (draft) => {
    setInput(draft.input);
    setOutputs(draft.outputs);
    setTone(draft.settings.tone);
    setLength(draft.settings.length);
    setShowHistory(false);
    showToast('Draft restored!');
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    setError('');
    setLoading({ storyteller: true, data: true, advisor: true });

    // Generate all 3 concurrently
    const promises = PERSONAS.map(async (persona) => {
      try {
        const response = await fetch('http://localhost:3001/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: input, persona, tone, length, emojiLevel })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate');
        }

        return { persona, output: data.output };
      } catch (err) {
        return { persona, error: err.message };
      }
    });

    const results = await Promise.all(promises);

    // Update outputs
    const newOutputs = { ...outputs };
    let hasError = false;

    results.forEach(({ persona, output, error: err }) => {
      if (err) {
        hasError = true;
        newOutputs[persona] = `Error: ${err}`;
      } else {
        newOutputs[persona] = output;
      }
    });

    setOutputs(newOutputs);
    setLoading({ storyteller: false, data: false, advisor: false });

    // Save to history if successful
    if (!hasError) {
      saveToHistory(input, newOutputs, { tone, length, emojiLevel });
    }

    if (hasError) {
      setError('Some personas failed to generate. Check each tab.');
    }
  };

  const handleRegenerate = async (persona) => {
    if (!input.trim()) {
      setError('Please enter some content');
      return;
    }

    setError('');
    setLoading((prev) => ({ ...prev, [persona]: true }));

    try {
      const response = await fetch('http://localhost:3001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input, persona, tone, length, emojiLevel })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      const newOutputs = { ...outputs, [persona]: data.output };
      setOutputs(newOutputs);
      saveToHistory(input, newOutputs, { tone, length, emojiLevel });
    } catch (err) {
      setError(err.message);
      setOutputs((prev) => ({ ...prev, [persona]: `Error: ${err.message}` }));
    } finally {
      setLoading((prev) => ({ ...prev, [persona]: false }));
    }
  };

  const isAnyLoading = Object.values(loading).some(Boolean);
  const activeOutput = outputs[activeTab] || '';

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <img src="/logo.png" alt="Draftly Logo" className="logo-image" />
          </div>
          <h1>Draftly</h1>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {history.length > 0 && (
            <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
              <span className="material-symbols-outlined">history</span>
              <span>{showHistory ? 'Hide' : 'Show'} History</span>
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {/* Page Heading */}
        <div className="page-heading">
          <h2>Draft your next post</h2>
          <p>Transform fragmented ideas into professional LinkedIn content.</p>
        </div>

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="history-panel">
            <h3>Recent Drafts</h3>
            <div className="history-list">
              {history.map((draft) => (
                <div key={draft.id} className="history-item" onClick={() => restoreHistory(draft)}>
                  <div className="history-time">{draft.timestamp}</div>
                  <div className="history-preview">
                    {draft.input.slice(0, 80)}{draft.input.length > 80 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="input-section">
          {/* Input Card */}
          <div className="input-card">
            <div className="input-card-header">
              <span className="input-label">Workspace</span>
              <span className="word-count">{wordCount} words</span>
            </div>
            <div className="textarea-wrapper">
              <textarea
                className="textarea"
                placeholder="Paste your rough thoughts, meeting notes, or raw ideas here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>

          {/* Configuration Row */}
          <div className="config-row">
            {/* Length - Segmented Buttons */}
            <div className="config-group">
              <span className="config-group-label">Length</span>
              <div className="segmented-control">
                {LENGTHS.map((l) => (
                  <button
                    key={l.value}
                    className={`segmented-btn ${length === l.value ? 'active' : ''}`}
                    onClick={() => setLength(l.value)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone - Select Dropdown */}
            <div className="config-group">
              <span className="config-group-label">Tone</span>
              <div className="select-wrapper">
                <select
                  className="control-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span className="select-arrow"></span>
              </div>
            </div>

            {/* Emoji - Segmented Buttons */}
            <div className="config-group">
              <span className="config-group-label">Emojis</span>
              <div className="segmented-control">
                {EMOJI_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    className={`segmented-btn ${emojiLevel === level.value ? 'active' : ''}`}
                    onClick={() => setEmojiLevel(level.value)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isAnyLoading}
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>{isAnyLoading ? 'Refining...' : 'Refine Post'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Output Section */}
        {(outputs.storyteller || outputs.data || outputs.advisor) && (
          <div className="output-section">
            <div className="output-section-header">
              <div className="tabs">
                {PERSONAS.map((persona) => (
                  <button
                    key={persona}
                    className={`tab ${activeTab === persona ? 'active' : ''}`}
                    onClick={() => setActiveTab(persona)}
                  >
                    {persona === 'storyteller' && 'Storyteller'}
                    {persona === 'data' && 'Data-Driven'}
                    {persona === 'advisor' && 'Advisor'}
                    {loading[persona] && <span className="tab-spinner" />}
                  </button>
                ))}
              </div>
              <button className="copy-btn" onClick={handleCopy} disabled={!activeOutput || loading[activeTab]}>
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>

            <div className="output-content">
              <div className="output-card">
                {loading[activeTab] ? (
                  <div className="output-loading">
                    <span className="spinner-large" />
                    <p>Refining content...</p>
                  </div>
                ) : (
                  <>
                    {activeOutput ? (
                      <div className="output">
                        {activeOutput}
                      </div>
                    ) : (
                      <div className="output output-placeholder">
                        Click "Refine Post" to create content.
                      </div>
                    )}
                    <div className="output-decoration">"</div>
                  </>
                )}
              </div>

              <div className="output-header">
                <div className="output-actions">
                  <button
                    className="regenerate-btn"
                    onClick={() => handleRegenerate(activeTab)}
                    disabled={loading[activeTab]}
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    {loading[activeTab] ? 'REFINING' : 'REGENERATE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Draftly © 2026</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
