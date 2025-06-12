import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET_NAME } from "@/lib/bucket";

export class ImageService {
  /**
   * Generates a pre-signed URL for uploading an image to S3
   * @param fileName - Original file name
   * @param fileType - MIME type of the file (e.g., 'image/jpeg')
   * @returns Promise containing the signed URL and the final image URL
   */
  static async generateSignedUrl(fileName: string, fileType: string) {
    if (!fileName || !fileType) {
      throw new Error("File name and type are required");
    }

    // Validate file type
    if (!fileType.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Generate a unique key for the file
    const key = `cs3099-public/uploads/${Date.now()}_${fileName}`;

    // Create the command for putting an object
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    try {
      // Generate the presigned URL for upload
      const signedUrl = await getSignedUrl(s3, putCommand, {
        expiresIn: 60, // URL expires in 60 seconds
      });

      // Construct the final URL where the image will be accessible
      const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        signedUrl,
        imageUrl,
      };
    } catch (error) {
      console.error("Error generating signed URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  /**
   * Validates if an image exists in the S3 bucket
   * @param imageUrl - Full URL of the image
   * @returns Promise<boolean>
   */
  static async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      // Extract key from URL
      const key = imageUrl.split(".s3.amazonaws.com/")[1];
      if (!key) return false;

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3.send(command);
      return true;
    } catch (error) {
      console.log("Error validating image URL:", error);
      return false;
    }
  }
}
