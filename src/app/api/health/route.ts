import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    MONGODB_URI_set: Boolean(process.env.MONGODB_URI),
    SESSION_SECRET_length: (process.env.SESSION_SECRET ?? "").length,
    BLOB_READ_WRITE_TOKEN_set: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };
  let db = "not tried";
  try {
    await mongoose.connect(process.env.MONGODB_URI ?? "", { serverSelectionTimeoutMS: 6000 });
    db = "connected";
    await mongoose.disconnect();
  } catch (e) {
    const err = e as Error;
    db = (err.name + ": " + err.message).slice(0, 120);
  }
  return NextResponse.json({ env, db });
}
