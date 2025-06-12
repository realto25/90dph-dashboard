// app/api/uploadthing/route.ts
import { ourFileRouter } from '@/lib/uploadthing.config';
import { createRouteHandler } from 'uploadthing/next';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
});
