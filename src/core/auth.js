// Това автоматично скрива/показва UI елементи.

auth.onAuthStateChanged(user => {
//   console.log("Auth state:", user);

  const loggedIn = document.querySelectorAll(".requires-auth");
  const guestOnly = document.querySelectorAll(".guest-only");

  if (user) {
    document.body.classList.add("logged-in");

    loggedIn.forEach(el => el.style.display = "block");
    guestOnly.forEach(el => el.style.display = "none");
  } else {
    document.body.classList.remove("logged-in");

    loggedIn.forEach(el => el.style.display = "none");
    guestOnly.forEach(el => el.style.display = "block");

  }
  loadUniversalObjects();
});
// -----------------------------
//  START LOGOUT
// -----------------------------
function logout() {
    auth.signOut() 
    .then(() => { 
        console.log("User logged out"); 
    }) .catch(error => { 
        console.error("Logout error:", error); 
    });
    document.body.classList.remove("logged-in");
    showHomeView();
}
// -----------------------------
//  END LOGOUT
// -----------------------------

/* START OF LOGIN VIEW */
function login() {
    let loginData = {
        email : $('#loginEmail').val(),
        password : $('#loginPassword').val()
    };
    // alert('IN LOGIN');
   firebase.auth().signInWithEmailAndPassword(loginData.email, loginData.password) 
       .then((userCredential) => { 
           const user = userCredential.user; 
           
           // mimic your old Kinvey session behavior 
           sessionStorage.username = user.email; 
           sessionStorage.authToken = user.accessToken || ""; // Firebase doesn't use authtoken the same way 
           console.log(user);
           loginSuccess(user); // call your existing success handler 
       }) 
       .catch((error) => { 
          console.log(error);
       });

    function loginSuccess(data, status) {
        document.body.classList.add("logged-in");
        showHomeView();
        showInfo('Login successful');
    }
}
/* END OF LOGIN VIEW */

/* START OF REGISTRATION VIEW */
const emailInput = document.getElementById('email'); 
const passInput = document.getElementById('password'); 
const termsCheck = document.getElementById('terms'); 
const registerBtn = document.getElementById('registerBtn'); 

function updateRegisterButton() { 
    const ready = emailInput.value.trim() !== "" && passInput.value.trim() !== "" && terms.checked; 
    if (ready) { 
        registerBtn.disabled = false; 
        registerBtn.classList.remove('btn-primary'); 
        registerBtn.classList.add('btn-success'); 
    } else { 
        registerBtn.disabled = true; 
        registerBtn.classList.remove('btn-success'); 
        registerBtn.classList.add('btn-primary'); 
    } 
} 
emailInput.addEventListener('input', updateRegisterButton); 
passInput.addEventListener('input', updateRegisterButton); 
termsCheck.addEventListener('change', updateRegisterButton);

function registerUser() {
    let registerData = {
        username : $('#email').val(),
        password : $('#password').val()
    };

   firebase.auth().createUserWithEmailAndPassword(registerData.username, registerData.password) 
       .then((userCredential) => { 
           const user = userCredential.user; 
           console.log(user);
           // Firebase doesn't use authtoken the same way Kinvey did, 
           // but you can store the ID token if you need it later. 
           user.getIdToken().then((token) => { 
               sessionStorage.authToken = token; 
           }); 
           registerSuccess(user); 
       }) 
       .catch((error) => { 
           showAJAXError(error); 
       });

    function registerSuccess(data, status) {
        showInfo('Register completed successfully.');
    }
}
/* END OF REGISTRATION VIEW */




