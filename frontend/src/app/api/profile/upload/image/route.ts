import { uploadImageToS3 } from "@/helpers/aws/s3_client";
import { getLogger } from "@/helpers/logger";
import HttpStatusCode from "@/types/HttpStatusCode";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestFormData = await request.formData();

    const userId = requestFormData.get("userId") as unknown as string;
    const fileKey = requestFormData.get("fileKey") as unknown as string;
    const file: File | null = requestFormData.get("file") as unknown as File;

    if (!file || file === undefined) {
      return NextResponse.json(
        { error: "File is undefined" },
        { status: HttpStatusCode.BAD_REQUEST }
      );
    }

    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);

    const imageUrl = await uploadImageToS3(
      userId,
      fileKey,
      file.name,
      file.type,
      fileBuffer
    );

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ imageUrl }, { status: HttpStatusCode.OK });
  } catch (error: any) {
    getLogger().error(error);
    return NextResponse.json(
      { error: error },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
