import { Logo } from "@/components/ui/logo";
import { Countdown } from "./countdown";

import SoftAurora from "./soft-aurora";
import { Loader } from "@/components/ui/loader";

export default function CountdownPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <SoftAurora
        speed={0.6}
        scale={1.5}
        brightness={1}
        color1="#013f31"
        color2="#e2e8f0"
        noiseFrequency={2.5}
        noiseAmplitude={1}
        bandHeight={0.5}
        bandSpread={1}
        octaveDecay={0.1}
        layerOffset={0}
        colorSpeed={1}
        enableMouseInteraction
        mouseInfluence={0.25}
      />
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 opacity-20 rotate-[30deg]">
          <Loader variant="pulse" className="w-20 h-20" />
        </div>{" "}
        <div className="absolute top-2/3 left-2/3 opacity-10 rotate-[30deg]">
          <Loader variant="spin-reverse" className="w-20 h-20" />
        </div>
      </div>
      <div className="absolute inset-0  z-10 flex max-w-3xl flex-col items-center text-center h-screen justify-center mx-auto px-6 md:px-10">
        <Logo className="w-15 h-15" />
        <span className="m-6 rounded-full border border-border bg-card px-4 py-1 text-sm font-medium text-muted-foreground">
          Launching Soon
        </span>

        <h1 className="text-5xl font-bold font-serif tracking-tight md:text-7xl">
          SEES Tech Hub
        </h1>

        <p className="mt-6 max-w-xl text-lg text-background">
          We're putting the finishing touches on everything. See you at launch.
        </p>

        <div className="mt-14 w-full">
          <Countdown targetDate="2026-07-04T18:00:00+01:00" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="mt-10 text-sm text-brand font-serif">
            July 4 • 6:00 PM WAT
          </p>
          <div className="h-px bg-brand w-3/4"></div>
        </div>
      </div>
    </main>
  );
}
