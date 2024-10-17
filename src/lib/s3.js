import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

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

    // Upload the file using AWS SDK v3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Return the generated file URL
    return `${process.env.LIARA_OBJECT_STORAGE_URL}/${process.env.LIARA_BUCKET_NAME}/${fileName}`;
}

export async function getSignedUrl(fileName, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: fileName,
    });

    // Generate a signed URL for the file
    const url = await s3Client.getSignedUrl(command, { expiresIn });

    return url;
}
