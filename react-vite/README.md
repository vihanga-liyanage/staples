# React + TypeScript + Vite Sample Application

This is a sample application that demonstrates how to use API based authentication using a React application with TypeScript and Vite.

## Configuration

1. Create a new traditional web application with OIDC protocol. Add `https://localhost:5173` as the authorized redirect URI.

2. In application settings, go to **Advanced** tab and enable **app-native authentication API**.

3. In application settings, go to **Protocol** tab and enable **Public client** authentication.

4. Create a `.env` file in the root of the project and add the following configuration:

```
VITE_BASE_URL=https://api.asgardeo.io/t/org_name
VITE_CLIENT_ID=your_client_id
VITE_SCOPE=openid,profile
VITE_SIGN_IN_REDIRECT_URL=https://localhost:5173
```

5. Install the dependencies using the following command:

```bash
pnpm install
```

6. Start the application using the following command:

```bash
pnpm dev
```

7. Navigate to `https://localhost:5173` in your browser to view the application.
