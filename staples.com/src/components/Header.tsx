import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import PreviewIcon from '@mui/icons-material/Preview'
import logo from '../assets/images/logo.png';
import {
  SignOutButton,
  useAuthentication,
  useOn,
  Hooks
} from "@asgardeo/react";
import Drawer from '@mui/material/Drawer';
import UserProductList from './UserProductList';
import { Product } from '../App';
import UserCreationForm from './UserCreationForm';
import PasswordRecoveryContainer from './PasswordRecoveryContainer';
import SignInBox from './SignInBox';

interface HeaderProps {
  products: Product[];
}

const Header: FunctionComponent<HeaderProps> = ({ products }): ReactElement => {

  const envVariables = import.meta.env;

  const { user, accessToken, setUsername } = useAuthentication();

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isShowSignUp, setShowSignUp] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [impersonateeUsername, setImpersonateeUsername] = useState<string | null>(null);
  const [isImpersonation, setIsImpersonation] = useState<boolean>(false);
  const [showProductsModal, setShowProductsModal] = useState<boolean>(false);
  const [idfAuthCount, setIdfAuthCount] = useState<number>(-1);
  const [isAuthenticatorsAvailable, setIsAuthenticatorsAvailable] = useState<boolean>(true);
  const [showToken, setShowToken] = useState(false);

  const openModal = (): void => {
    setShowProductsModal(true);
  };

  const closeModal = (): void => {
    setShowProductsModal(false);
  };

  useEffect(() => {
    localStorage.setItem('userAccessToken', accessToken);
  }, [accessToken]);

  // Extract info from impersonated access token
  useEffect(() => {

    const impersonatorAccessToken = localStorage.getItem('impersonatorAccessToken');
    const impersonateeUserId = localStorage.getItem('impersonateeUserId');

    if (impersonatorAccessToken && impersonateeUserId && !isImpersonation) {
      try {
        setIsImpersonation(true);
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

  const handleSignInClick = () => {
    setDrawerOpen(true);
    setIdfAuthCount(-1);
    setIsAuthenticatorsAvailable(true);
  }

  const handleSignOutClick = () => {
    console.log('Signing out...');
    localStorage.removeItem('impersonateeUsername');
    localStorage.removeItem('impersonatorAccessToken');
    localStorage.removeItem('impersonateeUserId');
    localStorage.removeItem('userAccessToken');
    window.location.href = envVariables.VITE_SIGN_IN_REDIRECT_URL;
  }

  const toggleSignupOverlay = () => {
    setShowSignUp(true);
    setIsAuthenticatorsAvailable(true);
  }

  const resolveDrawerContent = () => {
    if (isShowSignUp) {
      return (
        <UserCreationForm
          onClose={() => {
            setIdfAuthCount(-1);
            setShowSignUp(false)
          }}
        />
      )
    }

    if (showForgotPassword) {
      return (
        <PasswordRecoveryContainer
          onClose={() => {
            setIdfAuthCount(-1);
            setShowForgotPassword(false)
          }}
        />
      )
    }

    return (
      <SignInBox
        idfAuthCount={idfAuthCount}
        isAuthenticatorsAvailable={isAuthenticatorsAvailable}
        setDrawerOpen={setDrawerOpen}
        setForgotPasswordOpen={setShowForgotPassword}
        setIdfAuthCount={setIdfAuthCount}
        setIsAuthenticatorsAvailable={setIsAuthenticatorsAvailable}
        toggleSignupOverlay={toggleSignupOverlay}
      />
    )
  };

  const toggleShowToken = async () => {
    setShowToken(!showToken);
  };

  return (
    <header>
      { showProductsModal && (
        <div className="popup-box">
          <button type="button" className="close-button" onClick={closeModal}>
            x
          </button>
          <h3>Favourite Products</h3>
          <UserProductList products={products} />

        </div>
      )}

      {showProductsModal && <div className="popup-box-overlay" onClick={closeModal} />}
      {showToken && <div className="popup-box-overlay" onClick={closeModal} />}

      <div className="logo">
        <img src={logo} alt="Staples Logo" className="logo-image" />
      </div>
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="Search..." />
      </div>
      
      { isSignedIn && !isImpersonation &&
        <>
          <h5 style={{ padding: '0px 10px 0px 10px' }}>
            Welcome, {user?.name?.givenName} {user?.name?.familyName}
          </h5>
          <SignOutButton />
        </>
      }
      { isSignedIn && isImpersonation &&
        <>
          <h5 style={{ padding: '0px 10px 0px 10px' }}>
            Welcome, {impersonateeUsername}
          </h5>
          <button className="sign-out-button" onClick={() => { handleSignOutClick(); }}>Sign Out</button>
        </>
      }

      <div className="header-buttons">
        {!isSignedIn &&
          <button className="header-icon-button" onClick={() => { handleSignInClick(); }}><PersonIcon /></button>
        }
        {!isSignedIn &&
          <button className="header-icon-button" onClick={() => { handleSignInClick(); }}><ListIcon /></button>
        }
        { isSignedIn &&
          <button className='header-icon-button' onClick={() => toggleShowToken()}><PreviewIcon/ ></button>
        }
        {isSignedIn &&
          <button className="header-icon-button" onClick={() => { openModal(); }}><ListIcon /></button>
        }
      </div>
      { showToken &&
        <div className="token-box">
          <h3><b>Access Token</b></h3>
          <div className="code">
              <code>
                  <span className="id-token-0">{ localStorage.getItem('userAccessToken') }</span>
              </code>
          </div>
        </div>
      }
      
      <Drawer
        anchor='right'
        open={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setShowSignUp(false);
          setShowForgotPassword(false);
          setUsername("");
          setIdfAuthCount(-1);
        }}
        sx={{
          '& .MuiDrawer-paper': {
            padding: '0px',
            width: '500px'
          },
        }}
      >
        { resolveDrawerContent() }
      </Drawer>
    </header>
  );
};

export default Header;
