import React from 'react';
import { useState } from 'react';
import './gamePage.scss';

function GamePage() {
    const [guess, setGuess] = useState('');//we make a variable for the users guess
    const [riddle, setRiddle] = useState('');//we make a variable to store the riddle
    const [city, setCity] = useState('New York');//can change this dynamically 
    const [status, setStatus] = useState('');

    const getRiddle = async () => {
        try {
            const response = await fetch('');
            const data = await response.json();
            setRiddle(data.riddle);
            setStatus('');
            setGuess('');
        } catch (err) {
            console.error('Error fetching riddle', err);
            setRiddle('Error loading riddle.');
        }
    };

    const handleSubmit = () => {
        if(guess.toLowerCase() === city.toLowerCase()) {
            setStatus('✅ Correct!');
        } else {
            setStatus('❌ Try again!');
        }
    };
    return (
        <div className = "game">
            <h2> Welcome to City Riddler</h2>
            <button onClick={getRiddle}>Generate Riddle</button>
            {riddle && (
                <div className="riddle-section">
                <p><strong>Riddle:</strong> {riddle}</p>
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Your guess here..."
                />
                <button onClick={handleSubmit}>Submit Guess</button>
                <p className="status">{status}</p>
                </div>
            )}
        </div>
    );
}

export default GamePage;