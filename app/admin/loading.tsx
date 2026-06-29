import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader variant="pulse" className="w-16 h-16 text-brand" />
    </div>
  );
}
