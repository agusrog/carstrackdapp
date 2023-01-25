import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './views/Home';
import Header from './views/Header';
import MyTokens from './views/MyTokens';
import Admin from './views/Admin';
import Attributes from './views/Attributes';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Header/>
      </header>
      <main className="App-container">
        <Routes>
          <Route path="/" exact element={<Home/>} />
          <Route path="/:tokenId" exact element={<Attributes/>} />
          <Route path="/mytokens" exact element={<MyTokens/>} />
          <Route path="/admin" exact element={<Admin/>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
