import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { getUserIDByUsername } from '../Services/scimService';
import { exchangeToken, generateAuthUrl, generateImpersonationAuthUrl, parseUrlFragment } from '../Services/authService';

const Impersonation: FunctionComponent = (): ReactElement => {

  const [idToken, setIdToken] = useState<string>("");
  const [subjectToken, setSubjectToken] = useState<string>("");
  const [impersonatedAccessToken, setImpersonateAccessToken] = useState<string>("");
  const [impersonateeUserId, setImpersonateeUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const envVariables = import.meta.env;

  // Fetch impersonatee user ID for the username
  const fetchImpersonateeUser = async (accessToken: string, impersonateeUsername: string) => {
    try {
      const response = await getUserIDByUsername(envVariables.VITE_BASE_URL, accessToken, impersonateeUsername);
      
      if (response.totalResults !== 1) {        
        setError("Couldn't find a user with the username: " + impersonateeUsername);
      } else {
        const id = response.Resources[0].id;
        setImpersonateeUserId(id);
        localStorage.setItem('impersonateeUserId', id);
        setError(null);
      }
    } catch (err) {
      console.log('Failed to fetch user');
    }
  };

  // Fetch access token
  const fetchToken = async (code: string) => {

    const tokenEndpoint = `${envVariables.VITE_BASE_URL}/oauth2/token`;

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: envVariables.VITE_SIGN_IN_REDIRECT_URL,
        client_id: envVariables.VITE_CLIENT_ID,
    });

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });

        if (!response.ok) {
            throw new Error('Token request failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
  }

  useEffect(() => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const impersonateeUsernameQueryParam = urlParams.get('impersonateeUsername');
    const impersonateeUsernameFromLocalStorage = localStorage.getItem('impersonateeUsername');
    const impersonatorAccessToken = localStorage.getItem('impersonatorAccessToken');

    if (impersonateeUsernameQueryParam) {

      // If impersonateeUsernameQueryParam is present in the URL, save it and trigger auth
      setIsLoading(true);
      localStorage.setItem('impersonateeUsername', impersonateeUsernameQueryParam);
      localStorage.removeItem('impersonateeUserId');
      localStorage.removeItem('impersonatorAccessToken');
      localStorage.removeItem('userAccessToken');
      setError(null);
      window.location.href = generateAuthUrl();
    } else if (code) {

      // If auth code is present in the URL, request token
      setIsLoading(true);
      fetchToken(code)
        .then(data => {          
          localStorage.setItem('impersonatorAccessToken', data.access_token);
          window.location.href = envVariables.VITE_SIGN_IN_REDIRECT_URL;
        })
        .catch(error => {
          console.error('Error fetching access token:', error);
        });
    } else if (window.location.hash) {

      // If # is present in the URL, extract and save idToken and subjectToken
      setIsLoading(true);
      const fragments = parseUrlFragment(window.location.href);
      setIdToken(fragments.id_token);
      setSubjectToken(fragments.subject_token);
      setError(null);
    } else if (!impersonateeUserId && impersonateeUsernameFromLocalStorage && impersonatorAccessToken) {
      
      // If impersonateeUsername and impersonatorAccessToken is found in the localstorage, get impersonatee user ID
      setIsLoading(true);
      if (localStorage.getItem('impersonateeUserId')) {
        setImpersonateeUserId(localStorage.getItem('impersonateeUserId'));
      } else {
        fetchImpersonateeUser(impersonatorAccessToken, impersonateeUsernameFromLocalStorage);
      }
    }
    
  }, []);

  // If impersonateeUserId is present and impersonateAccessToken is not, trigger impersonation auth request
  useEffect(() => {
    
    if (impersonateeUserId && !impersonatedAccessToken)
      window.location.href = generateImpersonationAuthUrl(impersonateeUserId, '');
    
  }, [impersonateeUserId]);
  
  // If subjectToken and idToken is present, trigger impersonation
  useEffect(() => {
    
    const fetchImpersonationAccessToken = async () => {
      if (subjectToken && idToken) {
        setIsLoading(true);
        try {
          const response = await exchangeToken({
            subjectToken,
            idToken
          });
                    
          setImpersonateAccessToken(response.access_token);
          localStorage.setItem('userAccessToken', response.access_token);
          setIsLoading(false);
          
        } catch (err) {
          console.log('Failed to exchange token');
        }
      }
    };

    fetchImpersonationAccessToken();
  }, [subjectToken, idToken]);

  return (
    <>
      { isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      { impersonatedAccessToken && 
        <div className="impersonated-token">
          <h3><b>Impersonated Access Token for <strong>{localStorage.getItem('impersonateeUsername')}</strong></b></h3>
          <div className="code">
              <code>
                  <span className="id-token-0">{ impersonatedAccessToken }</span>
              </code>
          </div>
        </div>
      }
      { error &&
        <div className='overlay'>
          <div className='errorBox'>
            <h2>{error}</h2>
          </div>
        </div>
      }
    </>
  );
};

export default Impersonation;
