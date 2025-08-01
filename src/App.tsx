import { useState } from 'react';
import CodeAnalyzer from './components/CodeAnalyzer';
import History from './components/History';
import './App.css';

type ActiveTab = 'analyzer' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');

  return (
    <div className="app">
      <nav className="app__nav">
        <div className="app__nav-brand">
          <h1>🔍 Kod Analiz Aracı</h1>
        </div>
        <div className="app__nav-tabs">
          <button
            className={`app__nav-tab ${activeTab === 'analyzer' ? 'app__nav-tab--active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            Kod Analizi
          </button>
          <button
            className={`app__nav-tab ${activeTab === 'history' ? 'app__nav-tab--active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Geçmiş
          </button>
        </div>
      </nav>

      <main className="app__main">
        {activeTab === 'analyzer' && <CodeAnalyzer />}
        {activeTab === 'history' && <History />}
      </main>

      <footer className="app__footer">
        <p>
          Gemini AI ile desteklenen kod analiz aracı. 
          <a 
            href="https://ai.google.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Google AI
          </a> 
          tarafından sağlanmaktadır.
        </p>
      </footer>
    </div>
  );
}

export default App;
