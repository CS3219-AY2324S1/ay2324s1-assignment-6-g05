"use server";

import { HTTP_METHODS } from "@/types/enums";
import S3 from "aws-sdk/clients/s3";
import { getLogger } from "@/helpers/logger";

const s3Client = new S3({
  region: process.env.AMZ_REGION,
  accessKeyId: process.env.AMZ_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMZ_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

// provide a function that can upload to S3 bucket and return the URL
export const uploadImageToS3 = async (
  userId: string,
  fileKey: string,
  fileName: string,
  fileType: string,
  file: Buffer
) => {
  try {
    const fileParams = {
      Bucket: process.env.AMZ_BUCKET_NAME,
      Key: fileKey,
      Expires: 600,
      ContentType: fileType,
    };

    // get a signed url to allow image upload
    const uploadS3Url = await s3Client.getSignedUrlPromise(
      "putObject",
      fileParams
    );

    if (!uploadS3Url) {
      throw new Error("Failed to get signed url.");
    }

    // upload the image to S3
    const uploadImageResponse = await fetch(uploadS3Url, {
      method: HTTP_METHODS.PUT,
      body: file,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });

    if (!uploadImageResponse.ok) {
      throw new Error("Failed to upload image to S3.");
    }

    // obtain the image url from S3 bucket
    const imageUrl = getImageUrlFromS3(userId, fileName);

    return imageUrl;
  } catch (error) {
    getLogger().error(error);
  }
};

function getImageUrlFromS3(userId: string, fileName: string) {
  return `https://${process.env.AMZ_BUCKET_NAME}.s3.${process.env.AMZ_REGION}.amazonaws.com/users/${userId}/image/${fileName}`;
}
