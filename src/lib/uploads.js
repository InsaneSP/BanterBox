import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async (image) => {
    try {
        const date = new Date().toISOString();
        const storage = getStorage();
        const storageRef = ref(storage, `images/${date}_${image.name}`);

        const uploadTask = uploadBytesResumable(storageRef, image);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    reject("Something went wrong! " + error.message);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    } catch (error) {
        throw new Error("Failed to upload image: " + error.message);
    }
};

export default upload;