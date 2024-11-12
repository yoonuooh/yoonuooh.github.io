import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJDxxFl-LiT_aGKYULn6gNvpNfIfrUvxA",
  authDomain: "notice-board-1fb34.firebaseapp.com",
  projectId: "notice-board-1fb34",
  storageBucket: "notice-board-1fb34.firebasestorage.app",
  messagingSenderId: "70906713459",
  appId: "1:70906713459:web:76603ec50da53c906f2106"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);