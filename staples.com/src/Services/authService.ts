
import axios from 'axios';

interface TokenExchangeParams {
  subjectToken: string;
  idToken: string;
}

const envVariables = import.meta.env;

// Generate OAuth2 authorize request
export const generateAuthUrl = (): string => {
  const baseUrl = `${envVariables.VITE_BASE_URL}/oauth2/authorize`;
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: envVariables.VITE_SIGN_IN_REDIRECT_URL,
    client_id: envVariables.VITE_CLIENT_ID,
    state: 'sample_state',
    scope: 'openid openid groups email profile internal_user_mgt_list internal_user_mgt_view internal_user_mgt_update internal_user_mgt_create internal_user_mgt_delete internal_user_impersonate',
    nonce: 'asdfwe34',
    response_mode: 'query',
    fidp: 'staplesCorporateIDP'
  });
    
  return `${baseUrl}?${params.toString()}`;
};

export const generateImpersonationAuthUrl = (
  selectedUserId: string,
  otherRequiredScopes: string,
  nonce: string = "asdfwe34",
  state: string = "sample_state"
): string => {
  const baseUrl = `${envVariables.VITE_BASE_URL}/oauth2/authorize`;
  const params = new URLSearchParams({
    response_type: "id_token subject_token",
    redirect_uri: envVariables.VITE_SIGN_IN_REDIRECT_URL,
    client_id: envVariables.VITE_CLIENT_ID,
    state: state,
    scope: `internal_user_impersonate internal_login openid ${otherRequiredScopes}`,
    requested_subject: selectedUserId,
    nonce: nonce,
    fidp: 'staplesCorporateIDP'
  });
    
  return `${baseUrl}?${params.toString()}`;
};

export const parseUrlFragment = (url: string): { [key: string]: string } => {
    
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

export const exchangeToken = async ({ subjectToken, idToken }: TokenExchangeParams) => {

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
