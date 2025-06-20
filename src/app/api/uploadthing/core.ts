import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(
    async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for file:', file);

      // Return the URL to be used in your application
      return { url: file.url };
    }
  )
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
