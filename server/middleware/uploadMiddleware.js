const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
    } else if (file.fieldname === 'video') {
        // Accept video files
        if (!file.originalname.match(/\.(mp4|MP4|mov|MOV|avi|AVI|mkv|MKV)$/)) {
            req.fileValidationError = 'Only video files are allowed!';
            return cb(new Error('Only video files are allowed!'), false);
        }
    } else if (file.fieldname === 'materials') {
        // Accept documents and PDFs
        if (!file.originalname.match(/\.(pdf|PDF|doc|DOC|docx|DOCX|ppt|PPT|pptx|PPTX|zip|ZIP)$/)) {
            req.fileValidationError = 'Only document files are allowed!';
            return cb(new Error('Only document files are allowed!'), false);
        }
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    }
});

module.exports = upload; 