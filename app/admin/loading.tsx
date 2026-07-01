import { Loader, LoaderVariant } from "@/components/ui/loader";

export default function Loading() {
  const loadingVariants: LoaderVariant[] = [
    "pulse",
    "spin-reverse",
    "bounce",
    "simple-spin",
  ];
  const index = Math.floor(Math.random() * loadingVariants.length);
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader
        variant={loadingVariants[index]}
        className="w-16 h-16 text-brand"
      />
    </div>
  );
}
