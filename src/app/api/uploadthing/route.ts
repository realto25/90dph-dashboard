import { ourFileRouter } from '@/lib/uploadthing.config';
import { createRouteHandler } from 'uploadthing/next';

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
});
