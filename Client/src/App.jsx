import React from 'react';
import GamePage from './gamePage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route index path='/' element={<GamePage />} />
                </Routes>
                <div className="App__overlay"></div>
            </div>
        </Router>
    );
}

export default App;
