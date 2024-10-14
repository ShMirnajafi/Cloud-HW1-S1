import axios from 'axios';

export const uploadImage = async (fileBuffer, fileName) => {
    const url = `${process.env.LIARA_OBJECT_STORAGE_URL}/${fileName}`;
    const response = await axios.put(url, fileBuffer, {
        headers: {
            'x-liara-access-key': process.env.LIARA_ACCESS_KEY,
            'x-liara-secret-key': process.env.LIARA_SECRET_KEY,
        },
    });
    return response.status === 200 ? url : null;
};