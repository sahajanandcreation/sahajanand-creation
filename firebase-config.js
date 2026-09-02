const firebaseConfig = {
  apiKey: "AIzaSyCn9WrfyZTynIKh3mQlUpCuNnehcuG4KdM",
  authDomain: "sahajanand-creation-a0c92.firebaseapp.com",
  projectId: "sahajanand-creation-a0c92",
  storageBucket: "sahajanand-creation-a0c92.firebasestorage.app",
  messagingSenderId: "1083502948231",
  appId: "1:1083502948231:web:a3a4fce474788e23bbad22",
  measurementId: "G-L9EFJWRH51"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Points earned per rupee spent (1 point per ₹100)
const POINTS_PER_RUPEE = 1 / 100;

// Shared helper: reflect login state in the header "મારું એકાઉન્ટ" link
function reflectAuthUI(){
  const accountLink = document.getElementById("accountLink");
  auth.onAuthStateChanged(function(user){
    window.currentUser = user;
    if(!accountLink) return;
    if(user){
      accountLink.textContent = "Settings";
      accountLink.href = "account.html";
    } else {
      accountLink.textContent = "Login";
      accountLink.href = "login.html";
    }
  });
}
document.addEventListener("DOMContentLoaded", reflectAuthUI);
