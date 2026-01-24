import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/db/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 3,
      minFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // 🔴 If Firebase Admin auth is not initialized
      if (!auth) {
        throw new UploadThingError("Auth service unavailable");
      }

      const cookieToken = req.cookies.get("_SESSION_")?.value;
      const headerToken = req.headers.get("authorization")?.split("Bearer ")[1];
      const token = cookieToken || headerToken;

      if (!token) {
        throw new UploadThingError("Unauthorized");
      }

      try {
        // ✅ Verify Firebase ID token
        const decodedToken = await auth.verifySessionCookie(token, true);

        return {
          userId: decodedToken.uid,
        };
      } catch (error) {
        console.error(error);
        throw new UploadThingError("Invalid or expired token");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
