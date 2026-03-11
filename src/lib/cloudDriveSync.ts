/**
 * Cloud Drive Sync Utility
 * 
 * Specifically designed to sync Svarajya_Nidhi OPFS Vault files to the user's
 * personal Google Drive in a dedicated `Svarajya_Nidhi` folder.
 */

export const CloudDriveSync = {
    /**
     * Uploads a File or Blob to Google Drive.
     * Uses the `https://www.googleapis.com/upload/drive/v3/files` REST API.
     * 
     * @param file The literal JS File or Blob instance
     * @param filename Desired name in Google Drive
     * @param accessToken Provider access token from Supabase OAuth
     */
    async uploadToGoogleDrive(file: File | Blob, filename: string, accessToken: string): Promise<boolean> {
        try {
            // 1. Create the Svarajya_Nidhi folder if it doesn't already exist
            let folderId = await this.getOrCreateDriveFolder(accessToken, "Svarajya_Nidhi");
            
            // 2. Upload file directly into that metadata folder via multipart/related
            let metadata = {
                name: filename,
                parents: [folderId],
            };

            let form = new FormData();
            form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
            form.append("file", file);

            const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: form,
            });

            if (!uploadRes.ok) {
                 const errText = await uploadRes.text();
                 console.error("Drive Upload Failed:", errText);
                 return false;
            }

            return true;
        } catch (error) {
            console.error("Failed to sync to Google Drive:", error);
            return false;
        }
    },

    /**
     * Finds the 'Svarajya_Nidhi' folder or creates it if missing.
     */
    async getOrCreateDriveFolder(accessToken: string, folderName: string): Promise<string> {
        // Search
        const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await searchRes.json();
        
        if (data && data.files && data.files.length > 0) {
            return data.files[0].id;
        }

        // Create
        const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
            }),
        });

        const created = await createRes.json();
        return created.id;
    }
};
