
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
  useOn,
  Hooks
} from "@asgardeo/react";
import { useState } from 'react';

const Header: FunctionComponent = (): ReactElement => {

  const { user } = useAuthentication();
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isSignInOverlayVisible, setSignInOverlayVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setSignInOverlayVisible(false);
      setIsSignedIn(true);
    }    
    
  }, [user]);

  useOn({
    event: Hooks.SignOut,
    callback: () => {
      setIsSignedIn(false);
      window.location.reload();
    },
  });

  const handleSignInClick =  () => {
    toggleOverlay();
  }

  const toggleOverlay = () => {
    setSignInOverlayVisible(!isSignInOverlayVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.id === 'sign-in-box-container') {
      toggleOverlay();
    }
  };

  useEffect(() => {
    if (isSignInOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSignInOverlayVisible]);

  return (
    <header>
      { isSignInOverlayVisible && 
        <div className="signInContainer overlay" id='sign-in-box-container'>
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
        { isSignedIn &&
          <>
            <h5 style={{padding: '0px 10px 0px 10px'}}>Welcome, {user.name.givenName} {user.name.familyName}</h5>
            <SignOutButton />
          </>
        }
      </SignedIn>
      <div className="header-buttons">
        <button className="header-icon-button" onClick={ () => {handleSignInClick();} }><PersonIcon /></button>
        <button className="header-icon-button"><ListIcon /></button>
      </div>
    </header>
  );
};

export default Header;
