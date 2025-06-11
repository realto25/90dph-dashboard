// app/api/uploadthing/route.ts
import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing.config";

export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
