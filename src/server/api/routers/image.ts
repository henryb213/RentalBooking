import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { ImageService } from "@/server/services/image.service";
import { TRPCError } from "@trpc/server";

// Validation schema for file upload requests
const uploadRequestSchema = z.object({
  fileName: z.string().min(1, "Filename is required"),
  fileType: z
    .string()
    .min(1, "File type is required")
    .refine(
      (type) => type.startsWith("image/"),
      "Invalid file type. Only images are allowed.",
    ),
});

export const imageRouter = createTRPCRouter({
  getImageUploadUrl: publicProcedure
    .input(uploadRequestSchema)
    .mutation(async ({ input }) => {
      try {
        const { fileName, fileType } = input;

        const { signedUrl, imageUrl } = await ImageService.generateSignedUrl(
          fileName,
          fileType,
        );

        return {
          signedUrl,
          imageUrl,
        };
      } catch (error) {
        // Handle specific error cases
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }

        // Handle unexpected errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate upload URL",
        });
      }
    }),
});
