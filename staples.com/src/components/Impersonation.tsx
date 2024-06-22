import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Impersonation: FunctionComponent = (): ReactElement => {

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [subjectToken, setSubjectToken] = useState<string>("");
  const [impersonateAccessToken, setImpersonateAccessToken] = useState<string>("");
  
  interface TokenExchangeParams {
    subjectToken: string;
    idToken: string;
  }

  const envVariables = import.meta.env;

  const parseUrlFragment = (url: string): { [key: string]: string } => {
    
    const fragmentIndex = url.indexOf('#');
    if (fragmentIndex === -1) {
      return {};
    }
  
    const fragment = url.substring(fragmentIndex + 1);
    const params = fragment.split('&');
    const result: { [key: string]: string } = {};
  
    params.forEach(param => {
      const [key, value] = param.split('=');
      result[key] = decodeURIComponent(value);
    });
    
    return result;
  };

  const exchangeToken = async ({ subjectToken, idToken }: TokenExchangeParams) => {

    const encodedCredentials = btoa(`${envVariables.VITE_CLIENT_ID}:${envVariables.VITE_CLIENT_SECRET}`);
  
    const params = new URLSearchParams();
    params.append('subject_token', subjectToken);
    params.append('subject_token_type', 'urn:ietf:params:oauth:token-type:jwt');
    params.append('requested_token_type', 'urn:ietf:params:oauth:token-type:access_token');
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
    params.append('actor_token', idToken);
    params.append('actor_token_type', 'urn:ietf:params:oauth:token-type:id_token');
  
    const TOKEN_EXCHANGE_URL = `${envVariables.VITE_BASE_URL}/oauth2/token`;

    try {
      const response = await axios.post(TOKEN_EXCHANGE_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error exchanging token', error);
      throw error;
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      const fragments = parseUrlFragment(window.location.href);
      setIdToken(fragments.id_token);
      setSubjectToken(fragments.subject_token);      
    }
  }, []);
  
  useEffect(() => {
    const fetchImpersonationAccessToken = async () => {
      if (subjectToken && idToken) {
        try {
          const response = await exchangeToken({
            subjectToken,
            idToken
          });
          
          console.log(response.access_token);
          
          setImpersonateAccessToken(response.access_token);
          
        } catch (err) {
          console.log('Failed to exchange token');
        }
      }
    };

    fetchImpersonationAccessToken();
  }, [subjectToken, idToken]);

  useEffect(() => {
    if (impersonateAccessToken) {

      try {
        const decodedToken = jwtDecode(impersonateAccessToken);
        if (decodedToken?.sub)
          setSelectedUserId(decodedToken?.sub);
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
      }
    }
    
  }, [impersonateAccessToken]);

  return (
    <>
      { impersonateAccessToken && 
        <div className="impersonated-token">
          <h3><b>Impersonated Access Token for <strong>{selectedUserId}</strong></b></h3>
          <div className="code">
              <code>
                  <span className="id-token-0">{ impersonateAccessToken }</span>
              </code>
          </div>
        </div>
      }
    </>
  );
};

export default Impersonation;
