import React, { useEffect, useState } from 'react';
import styles from './PhotoUpload.module.css';

export interface UploadedPhoto {
    id: number;
    file: File;
    url: string;
    progress: number;
}

interface PhotoUploadProps {
    onPhotosUpload: (photos: UploadedPhoto[]) => void;
    initialPhotos?: UploadedPhoto[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
    onPhotosUpload, 
    initialPhotos = [] 
}) => {
    const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);

    useEffect(() => {
        onPhotosUpload(photos);
    }, [photos]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            if (photos.length + files.length > 10) {
                alert("You can only upload up to 10 images.");
                return;
            }
            /**Didn't change this part to my code --> timi's fix----------------------------------------- */
            const newPhotos = await Promise.all(
                files.map(async (file, index) => {
                    const base64 = await convertToBase64(file);
                    console.log("📸 Converted Base64 Image:", base64.slice(0, 100));  // Print first 100 chars

                    return {
                        id: Date.now() + index,
                        file: file,
                        url: base64, // Store Base64 instead of blob
                        progress: 0,
                    };
                })
            );
            
            setPhotos((prevPhotos) => {
                const updatedPhotos = [...prevPhotos, ...newPhotos];
                onPhotosUpload(updatedPhotos);
                return updatedPhotos;
            });

            newPhotos.forEach(photo => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    setPhotos(prevPhotos => prevPhotos.map(p => p.id === photo.id ? { ...p, progress: progress } : p));
                    if (progress >= 100) clearInterval(interval);
                }, 300);
            });
        }
    };
 /**Didn't change this part to my code --> timi's fix----------------------------------------- */
    const handleDelete = (id: number) => {
        setPhotos((prevPhotos) => {
            const updatedPhotos = prevPhotos.filter(photo => photo.id !== id);
            onPhotosUpload(updatedPhotos);
            return updatedPhotos;
        });
    };

    return (
        <div className={styles.photoUpload}>
            <h2 className={styles.sectionTitle}>Add product photos (max 10)           <br /> <br />Size limit for each picture: 1 MB</h2>
            <div className={styles.dropzone}>
                {Array.from({ length: 10 }).map((_, index) => {
                    const photo = photos[index];
                    return (
                        <div key={index} className={styles.uploadedPhoto}>
                            {photo ? (
                                <div className={styles.imageWrapper}>
                                    {/* <img src={photo.url} alt="Uploaded preview" className={styles.photoPreview} /> */}
                                    <img src={photo.url.startsWith("data:image/") ? photo.url : `data:image/jpeg;base64,${photo.url}`} 
     alt="Uploaded preview" className={styles.photoPreview} />

                                    <button className={styles.deleteButton} onClick={() => handleDelete(photo.id)}> 🗑 </button>
                                </div>
                            ) : (
                                <label className={styles.uploadBox}>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    <div className={styles.uploadContent}>
                                        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/f80b19fd7f23e107f95a6c7dbd29176b25d8e41d0be31ccb99d6010b635551c4?placeholderIfAbsent=true" alt="Upload icon" className={styles.uploadIcon} />
                                        <p className={styles.uploadText}>Upload a photo</p>
                                    </div>
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            if (!result.startsWith("data:image/")) {
                console.error("❌ Invalid Base64 format:", result);
            }
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
    });
};


export default PhotoUpload;