import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDzLfKLQtqMZJ3guzkksrKeF6KDP5luzj4",
    authDomain: "banterbox-15967.firebaseapp.com",
    projectId: "banterbox-15967",
    storageBucket: "banterbox-15967.appspot.com",
    messagingSenderId: "307491158984",
    appId: "1:307491158984:web:d2b711220cc497b3d89efd",
    measurementId: "G-5JPNN3PQ59"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);