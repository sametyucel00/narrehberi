// ════════════════════════════════════════════════════════════════
//  SRC/config/firebase.js  —  STUB (Firebase kurulmadan çalışır)
//  Gerçek Firebase için: npm install firebase  ve bu dosyayı
//  aşağıdaki yorumdaki gibi değiştir.
// ════════════════════════════════════════════════════════════════

// ── STUB API ─────────────────────────────────────────────────────
export async function signInWithGoogle() {
  console.info("[Firebase Stub] signInWithGoogle — gerçek Firebase kurulmadı.");
  return null;
}

export async function signOutUser() {
  console.info("[Firebase Stub] signOutUser.");
  return null;
}

export function onAuthChange(callback) {
  callback(null);   // kullanıcı yok
  return () => {};  // unsubscribe
}

// ════════════════════════════════════════════════════════════════
//  GERÇEK FİREBASE KURULUMU (hazır olduğunda aktif et)
// ════════════════════════════════════════════════════════════════
//
//  1) npm install firebase
//
//  2) Firebase Console → Project Settings → Web App → Config
//
//  3) Bu dosyanın tamamını şununla değiştir:
//
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider,
//          signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
//
// const firebaseConfig = {
//   apiKey:            "YOUR_API_KEY",
//   authDomain:        "YOUR_PROJECT.firebaseapp.com",
//   projectId:         "YOUR_PROJECT_ID",
//   storageBucket:     "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId:             "YOUR_APP_ID",
// };
//
// const app      = initializeApp(firebaseConfig);
// const auth     = getAuth(app);
// const provider = new GoogleAuthProvider();
//
// export const signInWithGoogle = () => signInWithPopup(auth, provider);
// export const signOutUser      = () => signOut(auth);
// export const onAuthChange     = (cb) => onAuthStateChanged(auth, cb);
