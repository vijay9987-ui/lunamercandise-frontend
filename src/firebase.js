// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBPArwbnEYCGcfS5JERRy9UBcrODMEQAgg",
    authDomain: "sample-firebase-ai-app-c1d18.firebaseapp.com",
    projectId: "sample-firebase-ai-app-c1d18",
    storageBucket: "sample-firebase-ai-app-c1d18.firebasestorage.app",
    messagingSenderId: "608249759418",
    appId: "1:608249759418:web:542b58fc950c5d3c69a483"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };