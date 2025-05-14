import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './views/Dashboard';
import Footer from './components/Footer';
import './index.css';

const AppWrapper = () => {
const location = useLocation();
const isLoginPage = location.pathname === '/';

return (
<div className={isLoginPage ? 'login-wrapper' : 'dashboard-wrapper'}>
{isLoginPage ? (
<>
<header className="header">
<h1>Diversión Infinita 🐴</h1>
</header>
<main className="layout-wrapper">
<div className="login-section">
<Login />
</div>
</main>
<Footer />
</>
) : (
<Dashboard />
)}
</div>
);
};

function App() {
return (
<Router>
<Routes>
<Route path="/*" element={<AppWrapper />} />
</Routes>
</Router>
);
}

export default App;