import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Ingredients from "./components/Ingredients";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/ingredients' element={<Ingredients />} />
      </Routes>
    </Router>
  );
}

export default App;
