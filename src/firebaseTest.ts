import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function testFirebaseConnection() {
    try {
        await setDoc(doc(db, "test", "connection"), {
            message: "Firebase bağlantısı başarılı!",
            timestamp: new Date().toISOString(),
        });

        console.log("✅ Firebase bağlantısı başarılı!");
        return true;
    } catch (error) {
        console.error("❌ Firebase bağlantı hatası:", error);
        return false;
    }
}
