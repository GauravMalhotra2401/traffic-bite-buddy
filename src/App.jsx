import React from 'react';
import RouteManager from './components/RouteManager';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <h1>BiteStop</h1>
        </div>
        <nav>
          <ul>
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">Plan Route</a></li>
            <li><a href="#">Food Vendors</a></li>
            <li><a href="#">My Orders</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <RouteManager />
      </main>
    </div>
  );
}

export default App;