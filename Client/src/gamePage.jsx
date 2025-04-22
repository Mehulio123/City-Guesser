import React, { useState, useEffect } from 'react';
import './gamePage.scss';

function FallAwayButton({ language }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="fall-container">
      <button
        className={`fall-button ${clicked ? 'fall' : ''}`}
        onClick={() => setClicked(true)}
        disabled={clicked}
      >
        Reveal Language
      </button>
      <p className={`hidden-text ${clicked ? 'show' : ''}`}>{language}</p>
    </div>
  );
}

function GamePage() {
  const [guess, setGuess] = useState('');
  const [riddle, setRiddle] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [cityData, setCityData] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiddle();
  }, []);

  const getRiddle = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/getRandomCity');
      const data = await res.json();
      setCity(data.city_name);
      setLanguage(data.language);
      setCityData(data);

      const riddleRes = await fetch('/api/generateRiddle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: data.city_name })
      });

      const riddleJson = await riddleRes.json();
      setRiddle(riddleJson.riddle);
      setGuess('');
      setGuesses([]);
      setErrorMessage('');
    } catch (err) {
      console.error(err);
      setRiddle('Error loading riddle.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!guess) return;

    try {
      const res = await fetch(`/api/${guess}`);
      if (!res.ok) throw new Error('City not found');

      const guessedCity = await res.json();

      const distRes = await fetch('/api/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city1: guessedCity, city2: cityData })
      });

      const { distance } = await distRes.json();

      const correct = guessedCity.city_name.toLowerCase() === city.toLowerCase();
      setGuesses(prev => [
        ...prev,
        {
          name: guessedCity.city_name,
          distance: distance.toFixed(0),
          correct
        }
      ]);
      setGuess('');
      setErrorMessage('');
    } catch (err) {
      console.error(err);
      setErrorMessage('City not found. Try again!');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Loading City Riddle...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <h1 className="title">City-Guessr</h1>
      <div className="riddle-box">
        <h3 className="riddle-title">Riddle:</h3>
        <p className="riddle-text">"{riddle}"</p>
        <FallAwayButton language={language} />
      </div>

      <div className="input-wrapper">
        <div className="guess-box">
          <span className="guess-label">Guess:</span>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Type here..."
          />
        </div>
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div className="guess-log">
        {guesses.map((g, index) => (
          <div key={index} className={`guess-entry ${g.correct ? 'correct' : 'incorrect'}`}>
            <span className="city-name">{g.name}</span>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${Math.max(5, 100 - g.distance / 100)}%` }}
              ></div>
            </div>
            <span className="distance">{g.distance}km</span>
            <span className="icon">{g.correct ? '✅' : '❌'}</span>
          </div>
        ))}
        {errorMessage && <div className="error-msg">{errorMessage}</div>}
        {guesses.length >= 5 && (
          <div className="reveal-actual">The city was: <strong>{city}</strong></div>
        )}
      </div>
    </div>
  );
}

export default GamePage;
