import aws from "aws-sdk"
import dotenv from "dotenv"
dotenv.config();

aws.config.update({
    accessKeyId: process.env.S3_ACCESKEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION
})

// console.log(process.env.S3_ACCESKEY_ID)

export const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const s3 = new aws.S3({ apiVersion: '2006-03-01' });
        const unique = Math.random().toString(36).slice(2,7)

        const uploadParams = {
            ACL: "public-read",
            Bucket: process.env.S3_BUCKET,
            Key: "qs/" + unique + file.originalname,
            Body: file.buffer 
        }

        s3.upload(uploadParams, (err, res) => {
            if (err) {
                console.log(err)
                return reject({ "error": err })
            }
            console.log("file uploaded succesfully")
            return resolve(res.Location)
        })

    })
}