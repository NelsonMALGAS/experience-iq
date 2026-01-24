import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/db/server"; // Firebase Admin auth (possibly undefined)

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // 🔴 If Firebase Admin auth is not initialized
      if (!auth) {
        throw new UploadThingError("Auth service unavailable");
      }

      // 🔐 Get Authorization header
      const authHeader = req.headers.get("authorization");

      if (!authHeader?.startsWith("Bearer ")) {
        throw new UploadThingError("Unauthorized");
      }

      const token = authHeader.split("Bearer ")[1];

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
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.ufsUrl);

      return {
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
