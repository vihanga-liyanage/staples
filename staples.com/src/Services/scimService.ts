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

// Update user products
export const addUserProduct = async (baseUrl: string, accessToken: string, newProductId: number): Promise<boolean> => {
  
  const url = `${baseUrl}${SCIM2_ME_ENDPOINT}`;

  try {
    // First, get the current products
    const getResponse = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/scim+json',
      },
    });

    let updatedProducts = `${newProductId}`;
    if (getResponse.data['urn:scim:wso2:schema']?.products) {
      const currentProducts = getResponse.data['urn:scim:wso2:schema'].products;
      updatedProducts = `${currentProducts},${newProductId}`;
    }
    
    // Prepare the PATCH request payload
    const data = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
      Operations: [
        {
          op: "replace",
          value: {
            "urn:scim:wso2:schema": {
              products: updatedProducts
            }
          }
        }
      ]
    };

    // Make the PATCH request
    await axios.patch(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/scim+json',
      },
    });
    return true;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.log(err.response?.data?.error_description || err.message);
    } else {
      console.log(err);
    }
    return false;
  }
};
