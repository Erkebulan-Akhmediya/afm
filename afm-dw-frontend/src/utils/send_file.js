import axios from 'axios';

export default async function sendFile(event) {
    // console.log(event);

    const fromData = new FormData();
    fromData.append('object_id', 1);
    fromData.append('file_type_id', 1);
    fromData.append('fileType', 'test');
    fromData.append('file', event);

    try {
        return await axios.post(
            'http://localhost:8000/api/1.0/file',
            event,
        );
    } catch(err) {
        throw new Error(err);
    }
}