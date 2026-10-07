import helmet from "helmet";

export const contentSecurityPolicy = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
});

export const crossOriginEmbedderPolicy = helmet.crossOriginEmbedderPolicy({
  policy: "require-corp",
});


export const crossOriginOpenerPolicy = helmet.crossOriginOpenerPolicy({
  policy: "same-origin",
});


export const onSniff = helmet.noSniff();


export const xssFilter = helmet.xssFilter();

export const frameguard = helmet.frameguard({
  action: "deny",
});

export const hsts = helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
});

export const referrerPolicy = helmet.referrerPolicy({
  policy: "no-referrer",
});

export const permitionPolicy = helmet.permittedCrossDomainPolicies({
  permittedPolicies: "none",
});

