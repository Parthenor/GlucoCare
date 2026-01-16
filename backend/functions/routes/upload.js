const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../services/storage");
const { db } = require("../firebase-config");

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});


const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    const { auth } = require('../firebase-config');
    req.user = await auth.verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.post("/", verifyAuth, upload.single("file"), async (req, res) => { 
  try {
    const userId = req.user.uid;

    const fileUrl = await uploadFile(req.file, userId); 

    const report = {
      fileUrl,
      extractedData: {
        glucose: 110,
        hba1c: 5.9
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "complete"
    };

    
    await db.collection("users").doc(userId).collection("reports").add(report);

    res.json({ success: true, reportId: report.id, fileUrl }); 
  } catch (err) {
    console.error('Upload error:', err); 
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
