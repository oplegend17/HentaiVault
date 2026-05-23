import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HentaiImage } from "@/types";

export async function logUserInteraction(
  userId: string,
  username: string,
  actionType: "click" | "play" | "favorite",
  image: HentaiImage
) {
  if (!userId) return;

  try {
    const logsCollectionRef = collection(db, "users", userId, "logs");
    await addDoc(logsCollectionRef, {
      actionType,
      username,
      imageId: image.id,
      imageUrl: image.url,
      previewUrl: image.previewUrl || image.url,
      videoUrl: image.videoUrl || null,
      fileType: image.fileType || "image",
      source: image.source,
      tags: image.tags || [],
      timestamp: new Date(),
    });
  } catch (error) {
    console.error(`Failed to log user interaction [${actionType}]:`, error);
  }
}
