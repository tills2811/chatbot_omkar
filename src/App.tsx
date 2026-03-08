import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <header className="main-header glass">
            <nav>
              <Link to="/" className="logo gradient-text">Omkar AI</Link>
              <div className="nav-links">
                <Link to="/">Chat</Link>
                {/* Admin links hidden from main view for recruiters */}
              </div>
            </nav>
          </header>


          <main className="content">
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <footer className="main-footer">
            <div className="footer-content">
              <span>© 2026 Omkar Arali</span>
              <div className="hidden-admin">
                <Link to="/admin">Admin</Link>
              </div>
            </div>
          </footer>


        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
