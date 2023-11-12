import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      message:
        "This is a testing endpoint to make sure the backend server is running.",
    },
    { status: 200 },
  );
}
