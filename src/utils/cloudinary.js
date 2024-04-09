//import {v2 as cloudinary} from 'cloudinary';

const cloudinary = require('cloudinary').v2;
const fs = require('fs')

cloudinary.config({
    cloud_name: 'diukby7ij',
    api_key: '697965173852431',
    api_secret: '***************************'
});

const Cloudinary = async (localFilePath) => {
    try {
        //check is there is lacalfielpath present or not 
        if (!localFilePath) {
            return null
        }
        // upload the file 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file uploaded successdully 
        console.log(response.url)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove local saved temporary file as the upload operation got failed
        return null;
    }

}

module.exports = Cloudinary

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); });