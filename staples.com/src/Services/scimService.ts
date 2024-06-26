// src/services/scimService.ts

import axios from 'axios';

const SCIM2_USERS_ENDPOINT = "/scim2/Users";
const SCIM2_ME_ENDPOINT = "/scim2/Me";

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

// Get products of a user through SCIM Me
export const getUserProductIds = async (baseUrl: string, accessToken: string) => {

  const url = `${baseUrl}${SCIM2_ME_ENDPOINT}?attributes=urn:scim:wso2:schema.products`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const productIdsString = response.data['urn:scim:wso2:schema'].products;    
    return productIdsString.split(',').map(Number);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.error_description || err.message);
    } else {
      console.log('An unexpected error occurred');
    }
  }
  return [];
};
