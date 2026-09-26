import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        try {
            cloudinary.uploader
                .upload(file.path)
                .then(result => resolve(result));
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            reject(error);
        }

    });
}