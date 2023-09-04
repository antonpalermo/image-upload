declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      AWS_BUCKET_NAME: string;
      AWS_BUCKET_REGION: string;
      AWS_BUCKET_ACCESSKEY: string;
      AWS_BUCKET_SECRETKEY: string;
      PORT?: number;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
