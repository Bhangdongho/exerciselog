import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import WorkoutLog from "./pages/workout/WorkoutLog";
import ActivityLog from "./pages/activity/ActivityLog";
import Nav from "./components/Nav";

const App: React.FC = () => {
  return (
    <div className="App">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/workout-log" element={<WorkoutLog />} />
        <Route path="/activity-log" element={<ActivityLog />} />
      </Routes>
    </div>
  );
};

export default App;
