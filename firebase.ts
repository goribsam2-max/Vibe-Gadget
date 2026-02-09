
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1vnVFbzezdpqAxjU5GXgAxu63DN05eyE",
  authDomain: "vibegadgets-ae9d1.firebaseapp.com",
  projectId: "vibegadgets-ae9d1",
  storageBucket: "vibegadgets-ae9d1.firebasestorage.app",
  messagingSenderId: "50155075863",
  appId: "1:50155075863:web:469bb97fffbd37767bdf52",
  measurementId: "G-64DGWNB9MZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
