import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
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
import { jwtDecode } from "jwt-decode";
import Drawer from '@mui/material/Drawer';
import UserProductList from './UserProductList';
import { Product } from '../App';
import UserCreationForm from './UserCreationForm';
import { Alert, AlertTitle, Button, Typography } from '@mui/material';
import PasswordRecoveryContainer from './PasswordRecoveryContainer';
import SignInChildren from './SignInChildren';

interface DecodedToken {
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

interface HeaderProps {
  products: Product[];
}

const Header: FunctionComponent<HeaderProps> = ({ products }): ReactElement => {

  const envVariables = import.meta.env;

  const { user, accessToken, authResponse, setUsername } = useAuthentication();

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isSignUpOverlayVisible, setSignUpOverlayVisible] = useState(false);
  const [impersonatorUserName, setImpersonatorUserName] = useState<string | null>(null);
  const [impersonateeUsername, setImpersonateeUsername] = useState<string | null>(null);
  const [showNonUniqueUsernameError, setShowNonUniqueUsernameError] = useState<boolean>(false);
  const [isAuthenticatorsAvailable, setIsAuthenticatorsAvailable] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [idfAuthCount, setIdfAuthCount] = useState<number>(0);

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
      setIsAuthenticatorsAvailable(authResponse?.nextStep?.authenticators?.length > 0);   
    }
  }, [authResponse]);

  useEffect(() => {    
    if (idfAuthCount === 2) {
      setUsername("")
      setShowNonUniqueUsernameError(true);
    }
  }, [idfAuthCount, setUsername]);

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
    // Check if the authenticator array contains an authenticator
    // of type "Identifier First"
    const identifierFirstAuthenticator = authResponse?.nextStep?.authenticators?.find(
      (authenticator: any) => authenticator.authenticator === 'Identifier First');
    
    if (identifierFirstAuthenticator) {
      setIdfAuthCount((prevCount) => prevCount + 1);
    } else {
      setShowNonUniqueUsernameError(false);
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
        onClose={ () => {
          setDrawerOpen(false)
          setIdfAuthCount(0)
          setShowNonUniqueUsernameError(false)
          setUsername("")
        }}
        sx={{
          '& .MuiDrawer-paper': {
            padding: '0px',
          },
        }}
      >
        { !isAuthenticatorsAvailable && (
          <Alert severity="error" sx={{ padding: "20px", margin: "50px 10px"}}>
            <AlertTitle>Error has occured!</AlertTitle>
            Something went wrong... Authenticators are not available!
          </Alert>
        )}
        <div className="sign-in-box-container">
          <SignIn
            showSignUp={false}
            showFooter={false}
            identifierFirstChildren={
              <SignInChildren 
                setForgotPasswordOpen={setForgotPasswordOpen}
                showNonUniqueUsernameError={showNonUniqueUsernameError}
              />
            }
          />
          {
            isAuthenticatorsAvailable && (
              <div className='sign-in-box-bottom-content'>
                <Typography variant="body2" sx={{ marginTop: "10px" }}>
                  By signing in, you agree to Staples Easy Rewards
                </Typography>
                <Typography variant="body2">
                  <a href="#" style={{ color: "black" }}>Terms and Conditions</a>
                </Typography>
                <Typography variant="body2" sx={{ marginTop: "20px" }}>
                  Federal Government Customers <a href="#" style={{ color: "black" }}>click here</a>
                </Typography>
                <Typography variant="subtitle1" sx={{ marginTop: "20px", marginBottom: "10px", fontWeight: 600, color: "rgb(77, 77, 79)" }}>
                  Don't have an account?
                </Typography>
                <Button
                  variant='outlined'
                  className='create-account-button'
                >
                  Create account
                </Button>
                <div className='privacy-notice-container'>
                  <Typography variant="caption" sx={{ color: "rgb(77, 77, 79)" }}>
                    <a href="#" style={{ color: "black" }}>Privacy Notice</a>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "rgb(77, 77, 79)" }}>
                    <a href="#" style={{ color: "black" }}>California Notice</a>
                  </Typography>
                </div>
              </div>
            )
          }
        </div>
      </Drawer>
      <Drawer
        anchor='right'
        open={ isForgotPasswordOpen } 
        onClose={ () => setForgotPasswordOpen(false) }
        sx={{
          '& .MuiDrawer-paper': {
            padding: '0px',
          },
        }}
      >
        <PasswordRecoveryContainer
          baseUrl={envVariables.VITE_API_BASE_URL}
          accessToken={accessToken}
          onClose={() => setForgotPasswordOpen(false)}
        />
      </Drawer>
    </header>
  );
};

export default Header;
