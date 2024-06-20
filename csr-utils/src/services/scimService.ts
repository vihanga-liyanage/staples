// src/services/scimService.ts

import axios from 'axios';

const SCIM2_USERS_ENDPOINT = "/scim2/Users?filter=username+sw+j";

// Replace with your authorization token

// Function to get all users
export const getAllUsers = async (baseUrl: string, accessToken: string) => {
  try {
    const response = await axios.get(`${baseUrl}${SCIM2_USERS_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/scim+json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users', error);
    throw error;
  }
};
