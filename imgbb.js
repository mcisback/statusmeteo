const fs = require('fs');
const request = require('request');

const imgbbFileUploader = async function(apiKey, pathToFile){
  var formData = {
    image : fs.createReadStream(pathToFile)
  }
  return new Promise((resolve, reject) => {
    request.post({
        url: `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData: formData
    },
    function cb(err, httpResponse, body) {
        if (err) {
            console.error('Upload failed:', err)  
            reject(err);
        }
        resolve(body)
    })
  })
}

const imgbbBase64Uploader = async function(apiKey, base64Data){
    var formData = {
      image : base64Data
    }
    return new Promise((resolve, reject) => {
        request.post({
        url: `https://api.imgbb.com/1/upload?key=${apiKey}`,
        formData: formData
        },
        function cb(err, httpResponse, body) {
            if (err) {
                console.error('Upload failed:', err)  
                reject(err);
            }
            resolve(body)
        })
    })
  }

async function uploadFileToImgbb(apiKey, pathToFile) {
    const result = await imgbbFileUploader(apiKey, pathToFile);
    return JSON.parse(result).data;
}

async function uploadBase64DataToImgbb(apiKey, base64Data) {
    const result = await imgbbBase64Uploader(apiKey, base64Data);
    return JSON.parse(result).data;
}

module.exports = {
    uploadFileToImgbb,
    uploadBase64DataToImgbb
};