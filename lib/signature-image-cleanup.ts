const SIGNATURE_UPLOAD_CANVAS_WIDTH = 900;
const SIGNATURE_UPLOAD_CANVAS_HEIGHT = 280;

export async function removeSignatureImageBackground(
  dataUrl: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSourceWidth = 1400;
      const sourceScale = Math.min(
        1,
        maxSourceWidth / (image.naturalWidth || image.width),
      );
      const sourceWidth = Math.max(
        1,
        Math.round((image.naturalWidth || image.width) * sourceScale),
      );
      const sourceHeight = Math.max(
        1,
        Math.round((image.naturalHeight || image.height) * sourceScale),
      );
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = sourceWidth;
      sourceCanvas.height = sourceHeight;
      const sourceCtx = sourceCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!sourceCtx) {
        resolve(dataUrl);
        return;
      }

      sourceCtx.drawImage(image, 0, 0, sourceWidth, sourceHeight);
      const imageData = sourceCtx.getImageData(0, 0, sourceWidth, sourceHeight);
      const data = imageData.data;
      const border = Math.max(
        4,
        Math.floor(Math.min(sourceWidth, sourceHeight) * 0.08),
      );
      const borderSamples: number[][] = [];

      for (let y = 0; y < sourceHeight; y += 2) {
        for (let x = 0; x < sourceWidth; x += 2) {
          const isBorder =
            x < border ||
            y < border ||
            x >= sourceWidth - border ||
            y >= sourceHeight - border;
          if (!isBorder) continue;
          const index = (y * sourceWidth + x) * 4;
          borderSamples.push([
            data[index] ?? 255,
            data[index + 1] ?? 255,
            data[index + 2] ?? 255,
          ]);
        }
      }

      borderSamples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
      const paperSamples = borderSamples.slice(
        Math.floor(borderSamples.length * 0.55),
      );
      const paper = paperSamples.reduce(
        (acc, sample) => {
          acc[0] += sample[0];
          acc[1] += sample[1];
          acc[2] += sample[2];
          return acc;
        },
        [0, 0, 0],
      );
      const bg = paper.map((value) => value / Math.max(1, paperSamples.length));
      const bgBrightness = (bg[0] + bg[1] + bg[2]) / 3;
      const mask = new Uint8Array(sourceWidth * sourceHeight);

      for (let y = 0; y < sourceHeight; y++) {
        for (let x = 0; x < sourceWidth; x++) {
          const pixel = y * sourceWidth + x;
          const index = pixel * 4;
          const r = data[index] ?? 255;
          const g = data[index + 1] ?? 255;
          const b = data[index + 2] ?? 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (r + g + b) / 3;
          const saturation = max === 0 ? 0 : (max - min) / max;
          const bgDistance = Math.sqrt(
            (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2,
          );
          const blueInk = b > r + 12 && saturation > 0.12 && bgDistance > 28;
          const darkInk = brightness < bgBrightness - 58 && bgDistance > 42;
          const coloredInk =
            saturation > 0.2 && bgDistance > 40 && brightness < 235;

          mask[pixel] = blueInk || darkInk || coloredInk ? 1 : 0;
        }
      }

      const visited = new Uint8Array(mask.length);
      const kept = new Uint8Array(mask.length);
      const queue = new Int32Array(mask.length);
      let minX = sourceWidth;
      let minY = sourceHeight;
      let maxX = -1;
      let maxY = -1;

      for (let start = 0; start < mask.length; start++) {
        if (!mask[start] || visited[start]) continue;

        let head = 0;
        let tail = 0;
        let area = 0;
        let componentMinX = sourceWidth;
        let componentMinY = sourceHeight;
        let componentMaxX = -1;
        let componentMaxY = -1;
        queue[tail++] = start;
        visited[start] = 1;

        while (head < tail) {
          const current = queue[head++];
          const x = current % sourceWidth;
          const y = Math.floor(current / sourceWidth);
          area++;
          componentMinX = Math.min(componentMinX, x);
          componentMinY = Math.min(componentMinY, y);
          componentMaxX = Math.max(componentMaxX, x);
          componentMaxY = Math.max(componentMaxY, y);

          const neighbors = [
            current - 1,
            current + 1,
            current - sourceWidth,
            current + sourceWidth,
          ];
          for (const next of neighbors) {
            if (next < 0 || next >= mask.length || visited[next] || !mask[next])
              continue;
            const nextX = next % sourceWidth;
            if (Math.abs(nextX - x) > 1) continue;
            visited[next] = 1;
            queue[tail++] = next;
          }
        }

        const componentWidth = componentMaxX - componentMinX + 1;
        const componentHeight = componentMaxY - componentMinY + 1;
        const isMeaningfulInk =
          area >= 14 &&
          componentWidth >= 3 &&
          componentHeight >= 2 &&
          area / (componentWidth * componentHeight) < 0.75;

        if (!isMeaningfulInk) continue;

        for (let i = 0; i < tail; i++) {
          kept[queue[i]] = 1;
        }
        minX = Math.min(minX, componentMinX);
        minY = Math.min(minY, componentMinY);
        maxX = Math.max(maxX, componentMaxX);
        maxY = Math.max(maxY, componentMaxY);
      }

      if (maxX < minX || maxY < minY) {
        resolve(dataUrl);
        return;
      }

      for (let pixel = 0; pixel < kept.length; pixel++) {
        const index = pixel * 4;
        if (!kept[pixel]) {
          data[index + 3] = 0;
          continue;
        }

        data[index] = Math.max(0, Math.round((data[index] ?? 0) * 0.55));
        data[index + 1] = Math.max(
          0,
          Math.round((data[index + 1] ?? 0) * 0.55),
        );
        data[index + 2] = Math.max(0, Math.round((data[index + 2] ?? 0) * 0.6));
        data[index + 3] = 255;
      }

      sourceCtx.putImageData(imageData, 0, 0);
      const padding = 22;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropWidth = Math.min(
        sourceWidth - cropX,
        maxX - minX + padding * 2,
      );
      const cropHeight = Math.min(
        sourceHeight - cropY,
        maxY - minY + padding * 2,
      );
      const targetCanvas = document.createElement("canvas");
      targetCanvas.width = SIGNATURE_UPLOAD_CANVAS_WIDTH;
      targetCanvas.height = SIGNATURE_UPLOAD_CANVAS_HEIGHT;
      const targetCtx = targetCanvas.getContext("2d");
      if (!targetCtx) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(
        SIGNATURE_UPLOAD_CANVAS_WIDTH / cropWidth,
        SIGNATURE_UPLOAD_CANVAS_HEIGHT / cropHeight,
      );
      const drawWidth = cropWidth * scale;
      const drawHeight = cropHeight * scale;
      targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      targetCtx.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        (SIGNATURE_UPLOAD_CANVAS_WIDTH - drawWidth) / 2,
        (SIGNATURE_UPLOAD_CANVAS_HEIGHT - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );

      resolve(targetCanvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Unable to read signature image."));
    image.src = dataUrl;
  });
}
