import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

let listenersBound = false;
let currentUid = null;

async function persistPushState(uid, data) {
  if (!uid) return;
  await setDoc(doc(db, "users", uid), { push: data }, { merge: true });
}

async function persistPushToken(uid, token) {
  if (!uid || !token) return;
  await setDoc(
    doc(db, "users", uid),
    {
      push: {
        izin: true,
        sonToken: token,
        platform: Capacitor.getPlatform(),
        guncellenme: new Date().toISOString(),
      },
      deviceTokens: arrayUnion(token),
    },
    { merge: true },
  );
}

function bindPushListeners() {
  if (listenersBound) return;
  listenersBound = true;

  PushNotifications.addListener("registration", async (token) => {
    await persistPushToken(currentUid, token.value);
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("Push kayıt hatası:", error);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push bildirimi alındı:", notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
    console.log("Push bildirimi açıldı:", notification);
  });
}

export async function registerPushNotifications(uid) {
  if (!uid || !Capacitor.isNativePlatform()) return { supported: false };
  currentUid = uid;
  bindPushListeners();

  let permissionStatus = await PushNotifications.checkPermissions();
  if (permissionStatus.receive !== "granted") {
    permissionStatus = await PushNotifications.requestPermissions();
  }

  if (permissionStatus.receive !== "granted") {
    await persistPushState(uid, {
      izin: false,
      platform: Capacitor.getPlatform(),
      guncellenme: new Date().toISOString(),
    });
    return { supported: true, granted: false };
  }

  await PushNotifications.register();
  return { supported: true, granted: true };
}
