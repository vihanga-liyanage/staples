import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import logo from '../assets/images/logo.png';

const Header = () => {
  return (
    <header>
      <div className="logo"><img src={logo} alt="Staples Logo" className="logo-image" /></div>
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="Search..." />
      </div>
      <div className="header-buttons">
        <button className="header-icon-button"><PersonIcon /></button>
        <button className="header-icon-button"><ListIcon /></button>
      </div>
    </header>
  );
};

export default Header;
