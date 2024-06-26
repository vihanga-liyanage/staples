
import { FunctionComponent, ReactElement, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import logo from '../assets/images/logo.png';
import {
  SignIn,
  SignOutButton,
  useAuthentication,
  useOn,
  Hooks
} from "@asgardeo/react";
import { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import ProductListSelected from './ProductListSelected';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';

interface DecodedToken {
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

const Header: FunctionComponent = (): ReactElement => {

  const envVariables = import.meta.env;

  const { user, authResponse } = useAuthentication();  

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [impersonatorUserName, setImpersonatorUserName] = useState<string | null>(null);
  const [impersonateeUsername, setImpersonateeUsername] = useState<string | null>(null);
  const [showNonUniqueUsernameError, setShowNonUniqueUsernameError] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const openModal = (): void => {
    setModalVisible(true);
  };

  const closeModal = (): void => {
    setModalVisible(false);
  };

  useEffect(() => {
    const access_token = localStorage.getItem('access_token');
    const impersonateeUserId = localStorage.getItem('impersonateeUserId');

    if (access_token && impersonateeUserId && !impersonatorUserName) {
      try {
        const decoded: DecodedToken = jwtDecode(access_token);
        setImpersonatorUserName(`${decoded.given_name} ${decoded.family_name}`);        
        setIsSignedIn(true);
        setImpersonateeUsername(localStorage.getItem('impersonateeUsername'));
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
      }
    }    
    
  }, []);

  useEffect(() => {
    if (user) {
      setDrawerOpen(false);
      setIsSignedIn(true);
    }    
    
  }, [user]);

  useEffect(() => {
    if (authResponse) {
      checkForNonUniqueUsername(authResponse);      
    }
  }, [authResponse]);

  useOn({
    event: Hooks.SignOut,
    callback: () => {
      setIsSignedIn(false);
      window.location.reload();
    },
  });

  useOn({
    event: Hooks.SignIn,
    callback: () => {
      setIsSignedIn(true);
      setDrawerOpen(false);
    },
  });

  const handleSignInClick =  () => {
    setDrawerOpen(true);
    setShowNonUniqueUsernameError(false);
  }

  const handleSignOutClick =  () => {
    console.log('Signing out...');
    localStorage.removeItem('impersonateeUsername');
    localStorage.removeItem('access_token');
    localStorage.removeItem('impersonateeUserId');
    window.location.href = envVariables.VITE_CSR_APP_PATH;
  }

  const checkForNonUniqueUsername = (authResponse: any) => {
    // Check if the next step stepTyype is of AUTHENTICATOR_PROMPT
    if (authResponse?.nextStep?.stepType === 'AUTHENTICATOR_PROMPT') {
      // Then check if the authenticator array contains an authenticator
      // of type "Identifier First"
      const identifierFirstAuthenticator = authResponse?.nextStep?.authenticators.find(
        (authenticator: any) => authenticator.authenticator === 'Identifier First');
      
      if (identifierFirstAuthenticator) {
        setShowNonUniqueUsernameError(true);
      } else {
        setShowNonUniqueUsernameError(false);
      }
    } else {
      setShowNonUniqueUsernameError(false);
    }
  };

  return (
    <header>
      {modalVisible && (
        <div className="popup-box">
          <button type="button" className="close-button" onClick={closeModal}>
            x
          </button>
          <h3>Favourite Products</h3>
          <ProductListSelected />

        </div>
      )}
      {modalVisible && <div className="popup-box-overlay" onClick={closeModal} />}

      <div className="logo">
        <img src={logo} alt="Staples Logo" className="logo-image" />
      </div>
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="Search..." />
      </div>
      { isSignedIn && !impersonatorUserName &&
        <>
          <h5 style={{padding: '0px 10px 0px 10px'}}>
            Welcome, {user.name.givenName} {user.name.familyName}
          </h5>
          <SignOutButton />
        </>
      }
      { isSignedIn && impersonatorUserName && impersonateeUsername &&
        <>
          <h5 style={{padding: '0px 10px 0px 10px'}}>
            Welcome, {impersonateeUsername} (Impersonator: {impersonatorUserName})
          </h5>
          <button className="sign-out-button" onClick={ () => {handleSignOutClick();} }>End Impersonation Session</button>
        </>
      }
      <div className="header-buttons">
        { !isSignedIn &&
          <button className="header-icon-button" onClick={ () => {handleSignInClick();} }><PersonIcon /></button>
        }
        { !isSignedIn &&
          <button className="header-icon-button" onClick={ () => {handleSignInClick();} }><ListIcon /></button>
        }
        { isSignedIn &&
          <button className="header-icon-button" onClick={ () => {openModal();} }><ListIcon /></button>
        }
      </div>
      <Drawer
        anchor='right'
        open={ isDrawerOpen } 
        onClose={ () => setDrawerOpen(false) }
        sx={{
          '& .MuiDrawer-paper': {
            padding: '0px',
          },
        }}
      >
          <div className="sign-in-box-container">
            <SignIn
              showSignUp={true}
              showFooter={false}
            />
            {
              showNonUniqueUsernameError &&
              <Alert severity="error" sx={{
                margin: '20px 40px',
              }}>
                Email or username used as login identifier leads to an ambiguity. 
                Please provide your mobile number as a login identifier.
              </Alert>
            }
          </div>
      </Drawer>
    </header>
  );
};

export default Header;
