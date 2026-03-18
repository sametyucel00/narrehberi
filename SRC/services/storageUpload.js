import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

function sanitizeName(name = "") {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadFileToStorage(file, folder = "uploads") {
  if (!file) return "";
  const safeName = sanitizeName(file.name || "file");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || undefined });
  return getDownloadURL(fileRef);
}

export async function uploadFilesToStorage(files, folder = "uploads") {
  const list = Array.from(files || []).filter(Boolean);
  const urls = [];
  for (const file of list) {
    urls.push(await uploadFileToStorage(file, folder));
  }
  return urls;
}
