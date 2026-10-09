import { put, del } from "@vercel/blob";

try {
  const blob = await put("test/connection-check.txt", "ok", {
    access: "public",
    addRandomSuffix: true,
    contentType: "text/plain",
  });
  console.log("  OK    Upload to Blob works");
  const r = await fetch(blob.url);
  console.log(r.ok ? "  OK    File is publicly readable" : "  FAIL  File is not readable, HTTP " + r.status);
  await del(blob.url);
  console.log("  OK    Test file deleted");
} catch (e) {
  console.log("  FAIL  " + e.message);
  process.exit(1);
}
