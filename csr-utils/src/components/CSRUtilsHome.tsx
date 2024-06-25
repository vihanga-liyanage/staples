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

import React, { FunctionComponent, ReactElement, useState } from "react";
import { default as authConfig } from "../config.json";

export interface CSRUtilsHomeInterface {
  
  derivedResponse?: any;
}

export const CSRUtilsHome: FunctionComponent<CSRUtilsHomeInterface> = (
  props: CSRUtilsHomeInterface
): ReactElement => {
  
  const {
    derivedResponse
  } = props;

  const [impersonateeUsername, setImpersonateeUsername] = useState('');

  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    setImpersonateeUsername(value);
};

  const handleImpersonation = () => {

    // window.open(authUrl, '_blank');
    window.location.href = `${authConfig.staplesB2CAppPath}?impersonateeUsername=${impersonateeUsername}`;
  };

  return (
    <>
      <div className="welcome">
        Welcome {derivedResponse?.authenticateResponse?.displayName}!
      </div>
      <div>
        <h2>Please enter the username of the user to impersonate</h2>
        <input 
          type="text" 
          value={impersonateeUsername}
          onChange={handleInputChange}
          placeholder="Enter username..."
          className="text-input username-input"
        />
        <button
          className="btn primary impersonate"
          onClick={ () => {
            handleImpersonation();
          } }
        >
          Impersonate
        </button>
      </div>

    </>
  );

};
