/**
 * Returns an audit of the client device we store for legal purposes.
 *
 * @returns
 */
export const getClientAudit = () => {
  if (typeof window === "undefined") return {};
  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const scr = typeof screen !== "undefined" ? screen : ({} as Screen);

  let webglVendor: string | undefined;
  let webglRenderer: string | undefined;
  try {
    const canvas = document.createElement("canvas");
    const gl: WebGLRenderingContext | null =
      (canvas.getContext("webgl") as WebGLRenderingContext) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
    if (gl) {
      const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbgInfo) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        webglVendor = gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        webglRenderer = gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch {
    // ignore
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const info = {
    timestamp: new Date().toISOString(),
    timezone: tz,
    tzOffsetMinutes: new Date().getTimezoneOffset(),
    languages: (nav.languages || []).slice(0, 5),
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    doNotTrack: nav.doNotTrack ?? null,
    referrer: document.referrer || null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    },
    screen: {
      width: scr.width,
      height: scr.height,
      availWidth: scr.availWidth,
      availHeight: scr.availHeight,
      colorDepth: scr.colorDepth,
    },
    webgl:
      webglVendor || webglRenderer
        ? { vendor: webglVendor, renderer: webglRenderer }
        : null,
  };
  return info;
};
