// src/services/authService.ts

import axios from 'axios';
import { default as authConfig } from "../config.json";

const TOKEN_EXCHANGE_URL = `${authConfig.baseUrl}/oauth2/token`;

interface TokenExchangeParams {
  subjectToken: string;
  idToken: string;
}
export const generateAuthUrl = (
  selectedUserId: string,
  otherRequiredScopes: string,
  nonce: string = "asdfwe34",
  state: string = "sample_state"
): string => {
  const baseUrl = `${authConfig.baseUrl}/oauth2/authorize`;
  const params = new URLSearchParams({
    response_type: "id_token subject_token",
    redirect_uri: authConfig.signInRedirectURL,
    client_id: authConfig.clientID,
    state: state,
    scope: `internal_user_impersonate openid ${otherRequiredScopes}`,
    requested_subject: selectedUserId,
    nonce: nonce
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

  const encodedCredentials = btoa(`${authConfig.clientID}:${authConfig.clientSecret}`);

  const params = new URLSearchParams();
  params.append('subject_token', subjectToken);
  params.append('subject_token_type', 'urn:ietf:params:oauth:token-type:jwt');
  params.append('requested_token_type', 'urn:ietf:params:oauth:token-type:access_token');
  params.append('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
  params.append('actor_token', idToken);
  params.append('actor_token_type', 'urn:ietf:params:oauth:token-type:id_token');

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
