import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// 1. Import the services you need
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
 apiKey: "AIzaSyCIcn63UTuIUQaByjBjUWkY8ZqgBDUSoxQ",
  authDomain: "findash-f1deb.firebaseapp.com",
  projectId: "findash-f1deb",
  storageBucket: "findash-f1deb.firebasestorage.app",
  messagingSenderId: "756455224203",
  appId: "1:756455224203:web:a439467098bc566253f58e",
  measurementId: "G-Y1KG1GVB43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);

// 2. Initialize services and export them
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


export default app;