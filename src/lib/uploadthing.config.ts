// lib/uploadthing.config.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(
    async ({ file }) => {
      console.log('Upload complete:', file.url);
      return { url: file.url }; // returned to client
    }
  )
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
