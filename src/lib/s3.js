import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: process.env.LIARA_OBJECT_STORAGE_URL,
    credentials: {
        accessKeyId: process.env.LIARA_ACCESS_KEY,
        secretAccessKey: process.env.LIARA_SECRET_KEY,
    },
    forcePathStyle: true,
});


export async function uploadFile(fileName, fileBuffer) {
    const uploadParams = {
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return `${process.env.LIARA_OBJECT_STORAGE_URL}/${process.env.LIARA_BUCKET_NAME}/${fileName}`;
}
