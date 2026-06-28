import { toPng } from 'html-to-image';

export async function captureAndShare(
  element: HTMLElement | null, 
  fileName: string = 'SEES-Rank.png', 
  title: string = 'My SEES Tech Hub Rank'
) {
  if (!element) {
    console.error('No element provided to capture');
    return false;
  }

  try {
    // We add a slight delay or specific config to ensure fonts and images are loaded
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // High resolution
      cacheBust: true,
      style: {
        // Ensure it doesn't get cut off if it's hidden or scaled
        transform: 'none',
      }
    });

    // Force direct file download automatically
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link); // Required for some browsers
    link.click();
    document.body.removeChild(link);

    // Also trigger native Web Share API if supported (Mobile friendly for WhatsApp/X/LinkedIn)
    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: 'I just completed the SEES Tech Hub Placement Quiz. Check out my rank!',
          files: [file]
        });
      }
    }

    return true;

  } catch (err) {
    console.error('Failed to generate or share image', err);
    return false;
  }
}
