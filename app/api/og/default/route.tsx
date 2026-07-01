import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Default values if not provided
    const title = searchParams.get('title') || 'SEES Tech Hub'
    const description = searchParams.get('description') || 'The exclusive portal for SEES builders.'

    // Brand colors from globals.css:
    // Dark mode background: #0a0a0a
    // Brand (dark): #10b981
    // Brand accent: #95fde2

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            padding: '80px',
            color: 'white',
            textAlign: 'center',
            backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(16, 185, 129, 0.2) 0%, rgba(10, 10, 10, 1) 100%)',
          }}
        >
          {/* Logo representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '48px',
            }}
          >
            <div style={{ display: 'flex', borderRadius: '24px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)', overflow: 'hidden', backgroundColor: 'white' }}>
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width={120} viewBox="0 0 1500 1499.999933" height={120} preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="d1f3ee4330"><path d="M 663.75 517.5 L 829.890625 517.5 L 829.890625 683.640625 L 663.75 683.640625 Z M 663.75 517.5 " clipRule="nonzero"/></clipPath><clipPath id="140c75c45f"><path d="M 746.820312 517.5 C 700.941406 517.5 663.75 554.691406 663.75 600.570312 C 663.75 646.449219 700.941406 683.640625 746.820312 683.640625 C 792.699219 683.640625 829.890625 646.449219 829.890625 600.570312 C 829.890625 554.691406 792.699219 517.5 746.820312 517.5 Z M 746.820312 517.5 " clipRule="nonzero"/></clipPath><clipPath id="9bdac4b9dc"><path d="M 0.75 0.5 L 166.890625 0.5 L 166.890625 166.640625 L 0.75 166.640625 Z M 0.75 0.5 " clipRule="nonzero"/></clipPath><clipPath id="d452c63c36"><path d="M 83.820312 0.5 C 37.941406 0.5 0.75 37.691406 0.75 83.570312 C 0.75 129.449219 37.941406 166.640625 83.820312 166.640625 C 129.699219 166.640625 166.890625 129.449219 166.890625 83.570312 C 166.890625 37.691406 129.699219 0.5 83.820312 0.5 Z M 83.820312 0.5 " clipRule="nonzero"/></clipPath><clipPath id="2a77f04f75"><rect x="0" width="167" y="0" height="167"/></clipPath></defs><path fill="#ffffff" d="M 1039.644531 584.625 C 1050 637.269531 1009.765625 683.597656 958.933594 683.597656 C 887.566406 683.597656 829.5 741.664062 829.5 813.03125 C 829.5 860.3125 789.453125 898.398438 741.527344 895.210938 C 698.351562 892.332031 665.320312 854.640625 664.769531 811.375 C 663.878906 740.777344 606.183594 683.597656 535.367188 683.597656 C 488.089844 683.597656 450 643.550781 453.1875 595.625 C 456.097656 552.207031 494.1875 519.632812 537.667969 518.867188 C 607.316406 517.640625 663.695312 461.136719 664.738281 391.457031 C 665.382812 350.917969 698.414062 311.542969 738.738281 307.53125 C 790.707031 302.351562 834.25 345.863281 829.070312 397.832031 C 824.84375 440.546875 786.695312 470.757812 743.796875 471.863281 C 671.847656 473.699219 614.273438 534.554688 617.886719 607.730469 C 621.042969 671.984375 673.105469 725.484375 737.238281 730.296875 C 793.648438 734.527344 843.136719 702.320312 864.769531 654.824219 C 871.816406 639.351562 860.296875 621.703125 843.257812 621.703125 C 833.789062 621.703125 825.609375 627.585938 821.59375 636.164062 C 808.449219 664.140625 780.042969 683.597656 747.136719 683.597656 C 696.300781 683.597656 656.066406 637.296875 666.394531 584.65625 C 672.707031 552.605469 698.566406 526.773438 730.617188 520.492188 C 766.101562 513.535156 798.582031 529.5625 816.046875 556.28125 C 823.433594 567.589844 835.8125 574.636719 849.324219 574.636719 L 856.773438 574.636719 C 870.285156 574.636719 882.664062 567.589844 890.050781 556.28125 C 907.515625 529.5625 939.996094 513.535156 975.480469 520.492188 C 1007.5 526.773438 1033.363281 552.605469 1039.644531 584.625 Z M 1039.644531 584.625 " fillOpacity="1" fillRule="nonzero"/><g clipPath="url(#d1f3ee4330)"><g clipPath="url(#140c75c45f)"><g transform="matrix(1, 0, 0, 1, 663, 517)"><g clipPath="url(#2a77f04f75)"><g clipPath="url(#9bdac4b9dc)"><g clipPath="url(#d452c63c36)"><path fill="#1e846d" d="M 0.75 0.5 L 166.890625 0.5 L 166.890625 166.640625 L 0.75 166.640625 Z M 0.75 0.5 " fillOpacity="1" fillRule="nonzero"/></g></g></g></g></g></g></svg>
            </div>
          </div>

          <h1
            style={{
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'white',
              margin: '0 0 24px 0',
              maxWidth: '1000px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: 32,
              color: '#a3a3a3',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {description}
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
