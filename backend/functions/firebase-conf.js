const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();
module.exports = { admin, db, bucket, auth };
