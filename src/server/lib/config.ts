const config = {
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  saltRounds: process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
  node_env: process.env.NODE_ENV,
  // Origins allowed to call /api from another site (extra ones via CORS_ORIGINS, comma separated)
  corsOrigins: [
    "http://localhost:3000",
    "https://my-portfolio-dashboard-one.vercel.app",
    "https://mdabduladud-ui.vercel.app",
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()) : []),
  ],
};

export default config;
