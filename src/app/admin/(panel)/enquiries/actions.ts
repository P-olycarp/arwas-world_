"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ENQUIRY_STATUSES, EnquiryModel } from "@/models/Enquiry";

export async function setEnquiryStatus(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!mongoose.isValidObjectId(id)) return;
  if (!(ENQUIRY_STATUSES as readonly string[]).includes(status)) return;
  await connectDb();
  await EnquiryModel.updateOne({ _id: id }, { $set: { status } });
  revalidatePath("/admin/enquiries");
}
