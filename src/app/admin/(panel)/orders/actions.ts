"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ORDER_STATUSES, OrderModel } from "@/models/Order";

export async function setOrderStatus(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!mongoose.isValidObjectId(id)) return;
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await connectDb();
  await OrderModel.updateOne({ _id: id }, { $set: { status } });
  revalidatePath("/admin/orders");
}

export async function deleteOrder(id: string): Promise<void> {
  await requireAdmin();
  if (!mongoose.isValidObjectId(id)) return;
  await connectDb();
  await OrderModel.deleteOne({ _id: id });
  revalidatePath("/admin/orders");
}