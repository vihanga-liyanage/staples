import { FunctionComponent, ReactElement, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import logo from '../assets/images/logo.png';
import {
  SignIn,
  SignedIn,
  SignOutButton,
  useAuthentication,
} from "@asgardeo/react";
import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const Header: FunctionComponent = (): ReactElement => {

  interface DecodedToken {
    given_name?: string;
    [key: string]: any;
  }

  const getGivenNameFromToken = (token: string): string | null => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      return decoded.given_name || null;
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  };

  const { user, accessToken } = useAuthentication();
  const [showSignInBox, setShowSignInBox] = useState<boolean>(false);
  const [loggedInUserGivenName, setLoggedInUserGivenName] = useState<string|null>(null);

  useEffect(() => {
    if (accessToken) {
      const givenName = getGivenNameFromToken(accessToken);
      setLoggedInUserGivenName(givenName);
      setShowSignInBox(false);
    }
    
  }, [accessToken]);

  const handleSignInClick =  () => {
    const signInButtonStatus = showSignInBox;
    setShowSignInBox(!signInButtonStatus);
  }

  return (
    <header>
      { showSignInBox && 
        <div className="signInContainer overlay">
          <SignIn 
            showSignUp={true}
            showFooter={false}
          />
          
        </div>
      }
      <div className="logo">
        <img src={logo} alt="Staples Logo" className="logo-image" />
      </div>
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="Search..." />
      </div>
      <SignedIn>
        { loggedInUserGivenName &&
          <h5 style={{padding: '0px 10px 0px 10px'}}>Welcome, {loggedInUserGivenName}</h5>
        }
        <SignOutButton />
      </SignedIn>
      <div className="header-buttons">
        <button className="header-icon-button" onClick={ () => {handleSignInClick();} }><PersonIcon /></button>
        <button className="header-icon-button"><ListIcon /></button>
      </div>
    </header>
  );
};

export default Header;
