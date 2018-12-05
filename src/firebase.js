// Initialize Firebase
import firebase from 'firebase'
var config = {
    apiKey: "AIzaSyDsKx6Z1ztSwsaLtAua3jgS9cUHrgJOrbA",
    authDomain: "secret-santa-375e2.firebaseapp.com",
    databaseURL: "https://secret-santa-375e2.firebaseio.com",
    projectId: "secret-santa-375e2",
    storageBucket: "",
    messagingSenderId: "680609808863"
};
firebase.initializeApp(config);
export default firebase;