declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
  }
}
