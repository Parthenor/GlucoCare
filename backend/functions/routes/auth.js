const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();


async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken; 
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}
 
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const userRecord = await admin.auth().getUser(uid);

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName || "User",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.delete("/delete", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    await admin.auth().deleteUser(uid);
    await admin.firestore().collection("users").doc(uid).delete();

    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

module.exports = router;
