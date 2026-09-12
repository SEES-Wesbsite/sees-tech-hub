import { Loader } from '@/components/ui/loader';

export default function Loading() {
  return <div className="flex min-h-[60vh] flex-1 items-center justify-center"><Loader variant="pulse" className="h-16 w-16 text-brand" /></div>;
}
