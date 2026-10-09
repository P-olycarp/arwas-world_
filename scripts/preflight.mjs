import mongoose from "mongoose";
import { list } from "@vercel/blob";
import { readFileSync, existsSync } from "node:fs";

let failed = 0;
const ok = (m) => console.log("  OK    " + m);
const bad = (m) => { failed++; console.log("  FAIL  " + m); };
const note = (m) => console.log("  --    " + m);

console.log("Environment");
for (const k of ["MONGODB_URI", "SESSION_SECRET", "BLOB_READ_WRITE_TOKEN"]) {
  process.env[k] ? ok(k + " is set") : bad(k + " is missing from .env.local");
}
if ((process.env.SESSION_SECRET || "").length < 32) bad("SESSION_SECRET is shorter than 32 characters");

console.log("Code and config");
const cfg = existsSync("next.config.ts") ? readFileSync("next.config.ts", "utf8") : "";
cfg.includes("public.blob.vercel-storage.com")
  ? ok("next.config.ts allows Blob images")
  : bad("next.config.ts does not allow Blob images, so uploaded photos cannot render (fix below)");
const need = [
  ["src/components/Shop.tsx", "products: PRODUCTS", "Shop reads products from its prop"],
  ["src/components/Studio.tsx", "products: PRODUCTS", "Studio reads products from its prop"],
  ["src/app/page.tsx", "getProducts", "Home page loads products from the database"],
  ["src/proxy.ts", "/admin", "Admin route guard exists"],
];
for (const [file, text, label] of need) {
  existsSync(file) && readFileSync(file, "utf8").includes(text) ? ok(label) : bad(label + " (" + file + ")");
}

console.log("Database");
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  ok("Connected to MongoDB");
  const db = mongoose.connection.db;
  (await db.collection("adminusers").countDocuments()) > 0
    ? ok("Admin account exists")
    : bad("No admin account exists");
  const products = await db.collection("products").find({}).toArray();
  ok(products.length + " product(s) in the database");
  for (const p of products) {
    const state = p.published ? "published" : "HIDDEN";
    const img = p.image || "";
    if (!img) { note(p.name + " (" + state + "): no photo saved"); continue; }
    try {
      const r = await fetch(img, { method: "HEAD" });
      r.ok
        ? ok(p.name + " (" + state + "): photo is saved and loads, HTTP " + r.status)
        : bad(p.name + " (" + state + "): photo URL returns HTTP " + r.status);
    } catch (e) {
      bad(p.name + ": photo URL unreachable, " + e.message);
    }
  }
  await mongoose.disconnect();
} catch (e) {
  bad("MongoDB: " + e.message);
}

console.log("Blob storage");
try {
  const r = await list({ limit: 5 });
  ok("Blob token works, " + r.blobs.length + " file(s) found");
} catch (e) {
  bad("Blob token rejected: " + e.message);
}

console.log("");
console.log(failed === 0 ? "ALL CHECKS PASSED" : failed + " problem(s) found");
process.exit(failed === 0 ? 0 : 1);
