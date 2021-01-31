
import 'babel-polyfill'
import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

var AWS = require('aws-sdk');

const storage = multer.memoryStorage();
const multerFileONs3 = multer({
    storage
}).single('attachment');

var s3BucketName = "";
var AWS_ACCESS_KEY = '';
var AWS_SECRET_KEY = '';

AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    signatureVersion: 'v4'
});

AWS.config.region = 'us-west-2';

const app = express ();

const port = process.env.PORT || 3000;

app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(cors());

app.listen(port, () => {
  console.log (
    `s3-Nodejs-upload Application listening on port ${port} !`
  );
});

app.post('/api/uploadFile', multerFileONs3, async function (req, res) {
  const detailsFile = req.file;
  
  const uploadFileAwsBuckets3 = await uploadFileONs3AwsBucket(detailsFile);
  if (!uploadFileAwsBuckets3) {
    return res.status(200).send({
      statusCode: 200,
      message: "uploaded successfully.",
      data: uploadFileAwsBuckets3
    });
  } else {
    return res.status(400).send({
      statusCode: 400,
      message: "Something went wrong please try again later.",
      data: []
    });
  }

})

function uploadFileONs3AwsBucket(detailsFile) {
  return new Promise(async (resolve, reject) => {
    try {
            const exe = detailsFile.originalname.split('.');
            const name = path.basename(detailsFile.originalname, "." + exe[exe.length - 1]);
            detailsFile.originalname = Date.now() + '-' + name + '.' + exe[exe.length - 1];
            const param = {
                fileName: new Buffer(detailsFile.buffer, "base64"),
                originalname: detailsFile.originalname
            }

            await s3uploadFile(param).then(async urlFileONs3 => {
                var response = {
                    imageUrl: urlFileONs3
                }
                resolve(response);
            }).catch(err => {
                throw err;
            })
        } catch (err) {
            reject(err);
        }
    });
}

function s3uploadFile(params) {
    return new Promise( async (resolve, reject) => {
        try {
            var s3 = new AWS.S3();
            var FileDetailsUploadOns3 = {
                Bucket: s3BucketName,
                Body: params.fileName,
                Key: params.originalname
            };
           await s3.upload(FileDetailsUploadOns3, (error, res) => {
                if (error) {
                    reject(error);
                }
                resolve(res.Location);
            });
        } catch (err) {
            reject(err);
        }
    });

}
