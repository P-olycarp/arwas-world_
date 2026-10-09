import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = { title: "Site settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const values = await getSettings();
  return (
    <>
      <h1 className="mb-6">Site settings</h1>
      <SettingsForm values={values} />
    </>
  );
}
