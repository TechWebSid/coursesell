const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
exports.uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        });

        // Remove file from local storage after upload
        fs.unlinkSync(filePath);

        return result;
    } catch (error) {
        // Remove file from local storage in case of error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Get public ID from URL
        const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0];
        
        // Delete file
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        throw error;
    }
}; 