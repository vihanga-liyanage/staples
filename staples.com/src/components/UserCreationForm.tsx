import { Button, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';

const envVariables = import.meta.env;
const IDENTITY_SERVER_URL = envVariables.VITE_BASE_URL; // Replace with your actual SCIM API URL

interface UserCreationFormProps {
  onClose: () => void;
}

const UserCreationForm = (props: UserCreationFormProps) => {

  const { onClose } = props;

  const [username, setUsername] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobilenumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const resetForm = () => {
    setSuccess(false);
    setError(false);
    setUsername('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobileNumber('');
    setPassword('');
  };

  const fetchAccessToken = async () => {
    const clientId = envVariables.VITE_CLIENT_ID; // Replace with your client ID
    const clientSecret = envVariables.VITE_CLIENT_SECRET; // Replace with your client secret
    const tokenEndpoint = IDENTITY_SERVER_URL + "/oauth2/token"; // Replace with your token endpoint URL
  
    const credentials = btoa(`${clientId}:${clientSecret}`);
  
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'internal_user_mgt_create');
  
    try {
      const response = await axios.post(tokenEndpoint, params, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          ContentType: 'application/x-www-form-urlencoded',
        },
      });
  
      return response.data.access_token; // Return the access token
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error; // Re-throw the error for handling in handleSubmit
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    var localAccessToken = accessToken;
    if (!localAccessToken) {
      const fetchedToken = await fetchAccessToken();
      setAccessToken(fetchedToken); // Update state with fetched token
      localAccessToken = fetchedToken; // Update variable for use in the request
    }
    const user = {
      schemas: [],
      name: {
        givenName: firstname,
        familyName: lastname
      },
      userName: username,
      password: password,
      emails: [
        {
          value: email
        }
      ],
      phoneNumbers: [
        {
          type: "mobile",
          value: mobilenumber
        }
      ]
    };

    try {
      const response = await axios.post(`${IDENTITY_SERVER_URL}/scim2/Users`, user, {
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${localAccessToken}`,
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (response.status === 201) { // Success status code for user creation in SCIM is 201
        console.log('User created successfully!');
        resetForm();
        setSuccess(true);
      } else {
        const errorData = response.data;
        const errorDetail = errorData?.detail || 'Unknown error creating user'; // Handle missing detail
        setErrorMessage(errorDetail);
        console.error('Error creating user:', errorDetail);
        setSuccess(false);
        setError(true);
      }
    } catch (error) {
      setErrorMessage((error as any).response?.data?.detail || 'Unknown error creating user');
      console.error('Error creating user:', (error as any).response?.data?.detail || error);
      setSuccess(false);
      setError(true);
    }
  };

  return (
    <div className='sign-up-box-container'>
      <h5 className='sign-up-title'>Create an account</h5>
      <form className="user-form" onSubmit={() => handleSubmit}>
        <div className='form-parent-container'>
          <div className='form-field-container'>
            {error && <p className="error-message">Error creating user: {errorMessage}</p>}
            {success && <p className="success-message">User created successfully!</p>}
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter a unique username"
            />
            <br />
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              id="firstname"
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder='Enter your first name'
            />
            <br />
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder='Enter your last name'
            />
            <br />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder='Enter your email address'
            />
            <br />
            <label htmlFor="mobilenumber">Mobile Number</label>
            <input
              type="mobilenumber"
              id="mobilenumber"
              value={mobilenumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              placeholder='Enter your mobile number'
            />
            <br />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Enter a password'
            />
          </div>
          <div className='button-container bottom-container'>
            <Typography variant='caption'>
              By creating an account, you agree to Staples and 
              Easy Rewards <a href='#'>Terms & Conditions</a>, <a href='#'>Privacy Notice</a>, <a href='#'>California Notice</a>. 
              You also agree to receive Staples promotional 
              communications. You may unsubscribe at any time.
            </Typography>
            <Button
                variant='outlined'
                className='create-account-button'
                onClick={() => { onClose(); }}
            >
                Sign in
            </Button>
            <Button
              variant='contained'
              className='form-primary-button'
              type='submit'
            >
              Create account
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default UserCreationForm;