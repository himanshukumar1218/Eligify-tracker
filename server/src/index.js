require('dotenv').config();
const express = require('express')
const cors = require('cors');
const pool = require("./db.js")
const userRoute = require('./routes/userRoutes.js')
const adminRoute = require('./routes/adminRoutes.js')
const examRoutes = require('./routes/examRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const supportRoutes = require('./routes/supportRoutes');

// Initialize background workers
require('./workers/notificationWorker');

const app = express()
app.use(cors()); 
app.use(express.json())

app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        if (res.statusCode >= 400) {
            console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
        }
    });

    next();
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        return res.status(200).json({ ok: true, database: 'connected' });
    } catch (error) {
        console.error('[health] Database check failed:', error);
        return res.status(500).json({ ok: false, database: 'disconnected' });
    }
});

app.use('/api/users' , userRoute)
app.use('/api/admin',adminRoute) 
app.use('/api/exams', examRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/support', supportRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

app.use((err, req, res, next) => {
    console.error('[express] Unhandled error:', err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

process.on('unhandledRejection', (reason) => {
    console.error('[process] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('[process] Uncaught exception:', error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});
