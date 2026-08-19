import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBEeFj0nb1zY_Kpi_FEc0XX54TJuHzyA9Q",
    authDomain: "wordmem-16dd9.firebaseapp.com",
    projectId: "wordmem-16dd9",
    storageBucket: "wordmem-16dd9.firebasestorage.app",
    messagingSenderId: "612159107867",
    appId: "1:612159107867:web:dacfdc733914ebdfe2d9be",
    measurementId: "G-DVK80TMYQY"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);