// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { variables } from './environment_variables';
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: variables.apiKey,
  authDomain: variables.authDomain,
  projectId: variables.projectId,
  storageBucket: variables.storageBucket,
  messagingSenderId: variables.messagingSenderId,
  appId: variables.appId,
  measurementId: variables.measurementId,
  databaseURL: 'https://elo-teams-default-rtdb.europe-west1.firebasedatabase.app',
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { app, database };