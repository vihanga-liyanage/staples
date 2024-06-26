
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
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';

interface DecodedToken {
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}
import UserProductList from './UserProductList';
import { Product } from '../App';
import UserCreationForm from './UserCreationForm';

interface HeaderProps {
  products: Product[];
}

const Header: FunctionComponent<HeaderProps> = ({ products }): ReactElement => {

  const envVariables = import.meta.env;

  const { user, accessToken, authResponse } = useAuthentication();  

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSignUpOverlayVisible, setSignUpOverlayVisible] = useState(false);
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
    localStorage.setItem('userAccessToken', accessToken);
    
  }, [accessToken]);

  // Extract info from impersonated access token
  useEffect(() => {
    
    const impersonatorAccessToken = localStorage.getItem('impersonatorAccessToken');
    const impersonateeUserId = localStorage.getItem('impersonateeUserId');

    if (impersonatorAccessToken && impersonateeUserId && !impersonatorUserName) {
      try {
        const decoded: DecodedToken = jwtDecode(impersonatorAccessToken);
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
      setSignUpOverlayVisible(false);
      setIsSignedIn(true);
    }    
    
  }, [user]);

  useEffect(() => {
    if (authResponse) {
      checkForNonUniqueUsername(authResponse);      
    }
  }, [authResponse]);

  useEffect(() => {
    if (isSignUpOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSignUpOverlayVisible]);

  useOn({
    event: Hooks.SignOut,
    callback: () => {
      setIsSignedIn(false);
      localStorage.removeItem('userAccessToken');
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

  const handleSignUpClick = () => {
    setDrawerOpen(false);
    toggleSignupOverlay();
  };

  const handleSignOutClick =  () => {
    console.log('Signing out...');
    localStorage.removeItem('impersonateeUsername');
    localStorage.removeItem('impersonatorAccessToken');
    localStorage.removeItem('impersonateeUserId');
    localStorage.removeItem('userAccessToken');
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
    }
  };

  const toggleSignupOverlay = () => {
    setSignUpOverlayVisible(!isSignUpOverlayVisible);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.id === 'sign-up-box-container') {
      toggleSignupOverlay();
    }
  };

  return (
    <header>
      { isSignUpOverlayVisible && 
        <div className="signUpContainer overlay" id='sign-up-box-container'>
        <div className="signup-box">
          <h5>Sign Up</h5>
          <UserCreationForm />
        </div>
      </div>}

      { modalVisible && (
        <div className="popup-box">
          <button type="button" className="close-button" onClick={closeModal}>
            x
          </button>
          <h3>Favourite Products</h3>
          <UserProductList products={products}/>

        </div>
      )}
      { modalVisible && <div className="popup-box-overlay" onClick={closeModal} /> }

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
            Welcome, {user?.name?.givenName} {user?.name?.familyName}
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
          <button className="header-icon-button signup" onClick={() => { handleSignUpClick(); }}>Sign Up</button>
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
