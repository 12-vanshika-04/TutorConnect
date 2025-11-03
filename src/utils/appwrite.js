// src/utils/appwrite.js
import { Client, Databases, Account, Storage, ID } from "appwrite";

// Initialize Appwrite Client
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.error("Appwrite env variables are missing!");
}

const client = new Client()
  .setEndpoint(endpoint) // Must not be undefined
  .setProject(projectId);


// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, client };
