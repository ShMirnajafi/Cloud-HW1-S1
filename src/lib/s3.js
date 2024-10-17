import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    endpoint: 'https://storage.c2.liara.space',
    accessKeyId: '6csqpkber0d5e1q9',
    secretAccessKey: '6ac31b2d-c339-4984-bcf7-8406a6c890e3',
    s3ForcePathStyle: true,
});

export const uploadToS3 = (fileBuffer, fileName) => {
    const params = {
        Bucket: 'image-bucket',
        Key: fileName,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
    };

    return s3.upload(params).promise();
};
