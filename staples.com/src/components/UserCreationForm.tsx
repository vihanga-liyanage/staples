import React, { useState } from 'react';

const IDENTITY_SERVER_URL = 'https://sandbox.play.picdemo.cloud'; // Replace with your actual SCIM API URL
function UserCreationForm() {
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
    const clientId = 'CHOG3XKWgpr9UeeN4DpVhxXs1BYa'; // Replace with your client ID
    const clientSecret = 'kshIJ3DL0uYQBMScsYpqdCcXbVrzvT1YtaTSQ3ICgJ0a'; // Replace with your client secret
    const tokenEndpoint = IDENTITY_SERVER_URL+"/oauth2/token"; // Replace with your token endpoint URL
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': "Basic " + credentials, // Base64 encoded credentials
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=internal_user_mgt_create',
    });

    if (response.ok) {
      const tokenData = await response.json();
      setAccessToken(tokenData.access_token); // Store access token in state
    } else {
      console.error('Error fetching access token:', await response.text());
      setError(true);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      // Fetch access token if not already available
      await fetchAccessToken();
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
      const response = await fetch(IDENTITY_SERVER_URL+"/scim2/Users", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${accessToken}`, // Replace with your SCIM API access token
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        console.log('User created successfully!');
        resetForm();
        setSuccess(true);
      } else {
        const errorData = await response.json();
        const errorDetail = errorData?.detail || 'Unknown error creating user'; // Handle missing detail
        setErrorMessage(errorDetail);
        console.error('Error creating user:', errorDetail);
        setSuccess(false);
        setError(true);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSuccess(false);
      setError(true);
    }
  };

  return (

    <form className="user-form" onSubmit={handleSubmit}>
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
      <br />
      <button type="submit">Create User</button>
    </form>
  );
}

export default UserCreationForm;