const express = require("express");
const admin = require("firebase-admin");
const { db, auth } = require("../firebase-config");

const router = express.Router();
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get("/", verifyAuth, async (req, res) => {  
  try {
    const userId = req.user.uid;
    
    
    const snapshot = await db
      .collection("users")           
      .doc(userId)                   
      .collection("reports")         
      .orderBy("createdAt", "desc")
      .limit(50)                     
      .get();

    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    res.json(data);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
