const { bucket } = require("../firebase-config");
const { v4: uuid } = require("uuid");

async function uploadFile(file, userId) {
  const fileName = `reports/${userId}/${uuid()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype
    }
  });

  await fileUpload.makePublic();

  return fileUpload.publicUrl();
}

module.exports = { uploadFile };
