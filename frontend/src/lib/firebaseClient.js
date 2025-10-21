// src/lib/firebaseClient.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "TU_API_KEY",
//   authDomain: "TU_PROJECT_ID.firebaseapp.com",
//   projectId: "TU_PROJECT_ID",
//   storageBucket: "TU_PROJECT_ID.appspot.com",
//   messagingSenderId: "XXX",
//   appId: "1:XXX:web:YYY",
// };
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtbAzhxTjPWPWzsme_yJ-IRzEudqTfG68",
  authDomain: "skillswappbd.firebaseapp.com",
  projectId: "skillswappbd",
  storageBucket: "skillswappbd.firebasestorage.app",
  messagingSenderId: "525655670503",
  appId: "1:525655670503:web:649135fa716a922c76ec42"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
