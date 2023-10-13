import React, { useState, useEffect } from "react";
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './RegistrationSelection.css'; 
import RegistrationTutors from './RegistrationTutors'
import Registration from './Registration'
import Logout from './Logout'
import HomePage from './Homepage'
import Login from './Login'
import BottomNav from './BottomNav'
import SelectionHero from "./SelectionHero";

function RegistrationSelection() {
    return (
      <div className="registration-selection">
        <div className="selectionhero">
          <SelectionHero />
        </div>

      </div>
      
    );
}

export default RegistrationSelection;
