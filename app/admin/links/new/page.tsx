import { requireExecutive } from '@/lib/executive-access';
import { BackToLinks, PageHeading } from '@/components/admin/ui';
import { LinkForm } from '@/components/admin/link-form';
export default async function NewLinkPage() {
  await requireExecutive();
  return <><BackToLinks /><PageHeading eyebrow="Short links" title="Make a new connection." description="One stable address, with the flexibility to change what happens next." /><section className="max-w-3xl rounded-3xl border border-border p-6 sm:p-8"><LinkForm /></section></>;
}
