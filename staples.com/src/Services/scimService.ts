// src/services/scimService.ts

import axios from 'axios';

const SCIM2_USERS_ENDPOINT = "/scim2/Users";

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

// Function to get all users
export const getUserIDByUsername = async (baseUrl: string, accessToken: string, username: string) => {
  try {
    const response = await axios.get(`${baseUrl}${SCIM2_USERS_ENDPOINT}?attributes=id&filter=username+eq+${username}`, {
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
