import aws from "aws-sdk";

const S3_BUCKET = "khalidkhan";
const S3_ACCESKEY_ID = "AKIATCOHKQAF3AOCBT7T";
const S3_SECRET_KEY = "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";
const S3_REGION = "ap-south-1";

aws.config.update({
  accessKeyId: S3_ACCESKEY_ID,
  secretAccessKey: S3_SECRET_KEY,
  region: S3_REGION,
});

export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const s3 = new aws.S3({ apiVersion: "2006-03-01" });
    const unique = Math.random().toString(36).slice(2, 7);

    const uploadParams = {
      ACL: "public-read",
      Bucket: S3_BUCKET,
      Key: "qs/" + unique + "-" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, (err, res) => {
      if (err) {
        console.error("❌ S3 Upload Error:", err);
        return reject({ error: err });
      }
      console.log("✅ File uploaded successfully:", res.Location);
      resolve(res.Location);
    });
  });
};
