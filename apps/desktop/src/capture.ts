declare global {
  interface Window {
    captureAPI: {
      getSources: (opts: { types: string[] }) => Promise<{ id: string; name: string }[]>;
      onCaptureRequest: (fn: () => void) => void;
      sendResult: (result: { base64?: string; error?: string }) => void;
    };
  }
}

async function captureScreen(): Promise<string> {
  const sources = await window.captureAPI.getSources({
    types: ['screen'],
  });
  if (sources.length === 0) {
    throw new Error('No screen source');
  }
  const source = sources[0];
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
      } as MediaTrackConstraints,
    },
  });
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.muted = true;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Video load failed'));
  });
  await video.play();
  await new Promise((r) => setTimeout(r, 100));

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error('Canvas context failed');
  }
  ctx.drawImage(video, 0, 0);
  stream.getTracks().forEach((t) => t.stop());
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1];
  return base64 ?? '';
}

window.captureAPI.onCaptureRequest(async () => {
  try {
    const base64 = await captureScreen();
    window.captureAPI.sendResult({ base64 });
  } catch (err) {
    window.captureAPI.sendResult({
      error: err instanceof Error ? err.message : 'Capture failed',
    });
  }
});
