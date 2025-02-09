export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_CLIENT_ID!,
    authority: `https://simgameplatform.b2clogin.com/${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/${process.env.REACT_APP_POLICY_NAME}`,
    knownAuthorities: ["simgameplatform.b2clogin.com"],
    redirectUri: process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", `https://${process.env.REACT_APP_TENANT_NAME}.onmicrosoft.com/api/appointments.write`]
};