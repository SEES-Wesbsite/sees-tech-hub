import SoftAurora from "./soft-aurora";

import CountdownText from "./countdown-text";

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
      <CountdownText />
    </main>
  );
}
