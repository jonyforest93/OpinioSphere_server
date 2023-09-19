const {getStorage} = require('@firebase/storage')
const {initializeApp} = require('firebase/app')

const firebaseConfig = {
    apiKey: "AIzaSyCm3cYGbIRvshhu50aL_pZ77vqBXrPVwJM",
    authDomain: "opiniosphere.firebaseapp.com",
    projectId: "opiniosphere",
    storageBucket: "opiniosphere.appspot.com",
    messagingSenderId: "962090488044",
    appId: "1:962090488044:web:0bf1c80ba08c61506855c9",
    measurementId: "G-Q2G7S7DDKX"
};

const appFirebase = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(appFirebase);

module.exports = firebaseStorage;
