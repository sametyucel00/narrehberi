import { Capacitor } from "@capacitor/core";
import { OAuthProvider, getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function ensureAppleUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : {};
  const fallbackName =
    current.ad_soyad ||
    current.firma_adi ||
    user.displayName ||
    normalizeEmail(user.email).split("@")[0] ||
    "Nar Kullanıcısı";

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: normalizeEmail(user.email),
      rol: current.rol || "USER",
      ad_soyad: fallbackName,
      aktif: true,
      appleSignIn: true,
      provider: "apple",
      olusturma_tarihi: current.olusturma_tarihi || new Date().toISOString(),
      son_giris: new Date().toISOString(),
    },
    { merge: true },
  );

  const finalSnap = await getDoc(ref);
  return { uid: user.uid, id: user.uid, ...finalSnap.data() };
}

function mapAppleError(error) {
  switch (error?.code) {
    case "auth/account-exists-with-different-credential":
      return "Bu e-posta başka bir giriş yöntemiyle kayıtlı.";
    case "auth/popup-closed-by-user":
      return "Apple giriş penceresi kapatıldı.";
    case "auth/cancelled-popup-request":
      return "Apple giriş isteği iptal edildi.";
    case "auth/popup-blocked":
      return "Açılır pencere engellendi. Lütfen yeniden deneyin.";
    default:
      return "Apple ile giriş sırasında bir hata oluştu.";
  }
}

export async function signInWithApple() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");

  try {
    const shouldRedirect = Capacitor.isNativePlatform() || Capacitor.getPlatform() === "ios";
    if (shouldRedirect) {
      await signInWithRedirect(auth, provider);
      return { redirected: true };
    }

    const result = await signInWithPopup(auth, provider);
    const session = await ensureAppleUserDoc(result.user);
    return { redirected: false, session };
  } catch (error) {
    throw new Error(mapAppleError(error));
  }
}

export async function resolveAppleRedirectSession() {
  try {
    const result = await getRedirectResult(auth);
    if (!result?.user) return null;
    return await ensureAppleUserDoc(result.user);
  } catch (error) {
    throw new Error(mapAppleError(error));
  }
}
