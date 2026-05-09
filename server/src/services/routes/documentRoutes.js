const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.get('/', protect, getDocuments);
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.delete('/:documentType', protect, deleteDocument);

module.exports = router;
