const { createClient } = require('@supabase/supabase-js');
const pool = require('../db');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT document_type, public_url, status, uploaded_at, file_name FROM user_documents WHERE user_id = $1',
      [userId]
    );
    res.json({ success: true, documents: result.rows });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, customName } = req.body;
    const file = req.file;

    if (!documentType || !file) {
      return res.status(400).json({ success: false, message: 'Document type and file are required' });
    }

    const finalName = customName || file.originalname;

    const fileExt = file.originalname.split('.').pop();
    const fileName = `user_documents/${userId}/${documentType}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(process.env.STORAGE_BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(process.env.STORAGE_BUCKET_NAME)
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    await pool.query(
      `INSERT INTO user_documents (user_id, document_type, public_url, status, file_name)
       VALUES ($1, $2, $3, 'pending', $4)
       ON CONFLICT (user_id, document_type) 
       DO UPDATE SET public_url = EXCLUDED.public_url, status = 'pending', uploaded_at = CURRENT_TIMESTAMP, file_name = EXCLUDED.file_name`,
      [userId, documentType, publicUrl, finalName]
    );

    res.json({ success: true, message: 'Document uploaded successfully', publicUrl, status: 'pending', file_name: finalName });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType } = req.params;

    await pool.query(
      'DELETE FROM user_documents WHERE user_id = $1 AND document_type = $2',
      [userId, documentType]
    );

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
