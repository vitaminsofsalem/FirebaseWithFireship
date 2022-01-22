import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { randPhrase } from "@ngneat/falso";

// import firebase config and initialize it with the provided function ( required before using any other firebase service)
const firebaseConfig = initializeApp({
  apiKey: "AIzaSyBKTDzmJAPUli0WltkPXzq_j-0nPEXQgk0",
  authDomain: "fir-withfireship.firebaseapp.com",
  projectId: "fir-withfireship",
  storageBucket: "fir-withfireship.appspot.com",
  messagingSenderId: "387304577057",
  appId: "1:387304577057:web:62875e0645d449df95ab60",
  measurementId: "G-VD0E7C0T46",
});

// ** Creating the Google OAuth functionality
const auth = getAuth();

// Grab elements from the DOM
const isSignedIn = document.getElementById("isSignedIn");
const isSignedOut = document.getElementById("isSignedOut");
const loginBtn = document.getElementById("loginbtn");
const logoutBtn = document.getElementById("logoutBtn");
const userDetails = document.getElementById("userDetails");

/*
 creating the provider variable initialized with the GoogleAuthProvider() function
 and passing it to an onClick function that essentially creates a popup asking the user
 login.
*/
const provider = new GoogleAuthProvider();

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => {
  signOut(auth);
  window.location.reload();
};

/* 
  Conditionally render content based on the logged in State
  of the user using the onAuthStateChanged() function that
  does what it says in the name.
*/
auth.onAuthStateChanged((user) => {
  if (user) {
    isSignedIn.hidden = false;
    isSignedOut.hidden = true;
    logoutBtn.hidden = false;
    createAlternate.hidden = false;
    userDetails.innerHTML = `<h2>Hello ${user.displayName}!</h2>`;
  } else {
    isSignedIn.hidden = true;
    isSignedOut.hidden = false;
    userDetails.innerHTML = ``;
  }
});
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

/* 
  Below we're creating the logic for a random list that's filled with
  dummy data from falso.js to get introduced to some of the core ideas
  in firebase's firestore service
*/
const db = getFirestore();

const alternateList = document.getElementById("alternateList");
const createAlternate = document.getElementById("createAlternate");

/*
  The code below does the following:
    * Check if user login state
    * if user is logged in, we allow user to access the onClick handler that Creates a random phrase
    * We then query on that created phrase in firestore using a composite query and update onSnapshot to provide realTime update feedback
    * we display the results of the query
    * if User is NOT logged in, we unsub them from listening to the firestore collection bucket.
*/
let unsubscribe;
auth.onAuthStateChanged((user) => {
  if (user) {
    createAlternate.onclick = () => {
      addDoc(collection(db, "Alternates"), {
        uid: user.uid,
        moto: randPhrase(),
        createdAt: serverTimestamp(),
      });
    };

    const q = query(
      collection(db, "Alternates"),
      where("uid", "==", user.uid),
      orderBy("createdAt")
    );
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(`<li>${doc.data().moto}</li>`);
      });
      alternateList.innerHTML = items.join("");
    });
  } else {
    unsubscribe && unsubscribe();
  }
});
