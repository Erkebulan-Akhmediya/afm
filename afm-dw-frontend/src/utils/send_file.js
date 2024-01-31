import axios from 'axios';

export default async function sendFile(event) {
    // console.log(event);

    const formData = new FormData();
    formData.append('object_id', 1);
    formData.append('file_type_id', 1);
    formData.append('fileType', 'test');
    formData.append('file', event);

    try {
        console.log('hey')
        return await axios.post(
            'http://localhost:8000/api/1.0/file',
            formData,
        );
    } catch(err) {
        console.log('err sending file', err);
        throw new Error(err);
    }
}