import JSZip from "jszip";
import { saveAs } from "file-saver";
import { LocalVaultEngine } from "./localVaultEngine";

/**
 * Origin Private File System (OPFS) Vault Exporter
 * 
 * Extracts all files from the browser-sandboxed `Svarajya_Nidhi` OPFS directory
 * and packages them into a native ZIP archive for the user to download to their OS.
 */
export const VaultExporter = {
    async exportOPFSToZip(): Promise<boolean> {
        try {
            const vaultDir = await LocalVaultEngine.initVaultDir();
            if (!vaultDir) throw new Error("Could not access local secure storage.");

            const zip = new JSZip();
            let fileCount = 0;

            // Iterate over all entries within the OPFS directory
            // @ts-expect-error - TS does not model async iterators on FileSystemDirectoryHandle entries yet.
            for await (const [name, handle] of vaultDir.entries()) {
                if (handle.kind === 'file') {
                    const file = await (handle as FileSystemFileHandle).getFile();
                    zip.file(name, file);
                    fileCount++;
                }
            }

            if (fileCount === 0) {
                console.warn("OPFS Vault is empty. Nothing to export.");
                return false;
            }

            // Generate the zip archive
            const content = await zip.generateAsync({ type: "blob" });
            
            // Trigger native download using file-saver
            saveAs(content, `Svarajya_Nidhi_Backup_${new Date().toISOString().split('T')[0]}.zip`);
            
            return true;
        } catch (error) {
            console.error("Failed to export OPFS Vault to Zip:", error);
            return false;
        }
    }
};
