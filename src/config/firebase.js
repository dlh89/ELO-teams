// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { variables } from './environment_variables';

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
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };