/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { getAllUsers } from '../services/scimService';
import { default as authConfig } from "../config.json";
import { generateAuthUrl, exchangeToken } from '../services/authService';

export interface CSRUtilsHomeInterface {
  
  derivedResponse?: any;
}

interface User {
  id: string;
  userName: string;
}

export const CSRUtilsHome: FunctionComponent<CSRUtilsHomeInterface> = (
  props: CSRUtilsHomeInterface
): ReactElement => {
  
  const {
    derivedResponse
  } = props;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [picToken, setPicToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers(authConfig?.PICURL, picToken);
        setUsers(result.Resources); // Assuming the response has a Resources array
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    if (picToken) {
      fetchUsers();
    }
    
  }, [picToken]);

  useEffect(() => {

    const getPICToken = async () => {
      const token = await exchangeToken(derivedResponse?.accessToken);
      setPicToken(token);
    }
    
    if (derivedResponse?.accessToken) {
      if (!picToken) {
        getPICToken();
      }
    }
  }, [derivedResponse?.accessToken]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const handleImpersonation = () => {

    const authUrl = generateAuthUrl(
      selectedUserId,
      '',
    );
    window.open(authUrl, '_blank');
    // window.location.href = authUrl;
  };

  return (
    <>
      <div className="welcome">
        Welcome {derivedResponse?.authenticateResponse?.displayName}!
      </div>
      <div>
        <h2>Please enter the username of the user to impersonate</h2>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && users.length > 0 && (
          <div>
            <select id="userSelect" onChange={handleUserChange} className="select-box">
              <option value="">---</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.userName}
                </option>
              ))}
            </select>
            <button
                disabled={!selectedUserId}
                className="btn primary impersonate"
                onClick={ () => {
                  handleImpersonation();
                } }
            >
                Impersonate
            </button>
          </div>
        )}
      </div>

    </>
  );

};
