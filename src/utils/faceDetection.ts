export function syncCanvasToVideo(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  
  if (!vw || !vh) return;
  
  // Get the actual display size of the video element
  const videoRect = video.getBoundingClientRect();
  const displayWidth = videoRect.width;
  const displayHeight = videoRect.height;
  
  // Set canvas to match exact display dimensions
  canvas.width = displayWidth;
  canvas.height = displayHeight;
  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";
  
  // Calculate and store precise scale factors
  const scaleX = displayWidth / vw;
  const scaleY = displayHeight / vh;
  
  canvas.dataset.scaleX = scaleX.toString();
  canvas.dataset.scaleY = scaleY.toString();
  canvas.dataset.videoWidth = vw.toString();
  canvas.dataset.videoHeight = vh.toString();
  canvas.dataset.displayWidth = displayWidth.toString();
  canvas.dataset.displayHeight = displayHeight.toString();
}

export function drawFaceDetections(
  ctx: CanvasRenderingContext2D,
  faces: any[], // Use any[] to handle BlazeFace's NormalizedFace type
  _videoWidth: number,
  mirrored = true,
  threshold = 0.85
) {
  // Get stored dimensions and scale factors
  const scaleX = parseFloat(ctx.canvas.dataset.scaleX || "1");
  const scaleY = parseFloat(ctx.canvas.dataset.scaleY || "1");
  const displayWidth = parseFloat(ctx.canvas.dataset.displayWidth || ctx.canvas.width.toString());
  
  ctx.lineWidth = 4;
  ctx.font = "bold 16px system-ui, sans-serif";
  
  for (const face of faces) {
    const score = face.probability?.[0] ?? 1; // Default to 1 if no probability
    if (score < threshold) continue;
    
    // Handle both Tensor and array formats from BlazeFace
    const topLeft = Array.isArray(face.topLeft) ? face.topLeft : [face.topLeft.dataSync()[0], face.topLeft.dataSync()[1]];
    const bottomRight = Array.isArray(face.bottomRight) ? face.bottomRight : [face.bottomRight.dataSync()[0], face.bottomRight.dataSync()[1]];
    
    const [x1, y1] = topLeft as [number, number];
    const [x2, y2] = bottomRight as [number, number];
    
    // Apply scaling to coordinates
    let scaledX1 = x1 * scaleX;
    let scaledY1 = y1 * scaleY;
    let scaledWidth = (x2 - x1) * scaleX;
    let scaledHeight = (y2 - y1) * scaleY;
    
    // Increase box size by 40% for better visibility
    const expansion = 0.4;
    const expandX = scaledWidth * expansion / 2;
    const expandY = scaledHeight * expansion / 2;
    
    scaledX1 -= expandX;
    scaledY1 -= expandY;
    scaledWidth += expandX * 2;
    scaledHeight += expandY * 2;
    
    // Handle mirroring for react-webcam (which mirrors the display)
    if (mirrored) {
      scaledX1 = displayWidth - scaledX1 - scaledWidth;
    }
    
    // Debug removed for performance
    
    // Draw bounding box only (no percentage label)
    ctx.strokeStyle = "#00ff00";
    ctx.strokeRect(scaledX1, scaledY1, scaledWidth, scaledHeight);
  }
}

export function drawObjectDetections(
  ctx: CanvasRenderingContext2D,
  objects: any[], // COCO-SSD detection results
  mirrored = true,
  threshold = 0.5
) {
  // Get stored dimensions and scale factors
  const scaleX = parseFloat(ctx.canvas.dataset.scaleX || "1");
  const scaleY = parseFloat(ctx.canvas.dataset.scaleY || "1");
  const displayWidth = parseFloat(ctx.canvas.dataset.displayWidth || ctx.canvas.width.toString());
  
  ctx.lineWidth = 4;
  ctx.font = "bold 16px system-ui, sans-serif";
  
  // Filter for electronic devices only
  const deviceTypes = ["cell phone", "laptop", "tv", "monitor"];
  
  for (const obj of objects) {
    if (!deviceTypes.includes(obj.class) || obj.score < threshold) continue;
    
    const [x, y, width, height] = obj.bbox;
    
    // Apply scaling to coordinates
    let scaledX = x * scaleX;
    let scaledY = y * scaleY;
    let scaledWidth = width * scaleX;
    let scaledHeight = height * scaleY;
    
    // Increase box size by 20% for better visibility
    const expansion = 0.2;
    const expandX = scaledWidth * expansion / 2;
    const expandY = scaledHeight * expansion / 2;
    
    scaledX -= expandX;
    scaledY -= expandY;
    scaledWidth += expandX * 2;
    scaledHeight += expandY * 2;
    
    // Handle mirroring for react-webcam
    if (mirrored) {
      scaledX = displayWidth - scaledX - scaledWidth;
    }
    
    // Draw bounding box in red for devices
    ctx.strokeStyle = "#ff0000";
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  }
}

export function drawAllDetections(
  ctx: CanvasRenderingContext2D,
  faces: any[],
  objects: any[],
  _videoWidth: number,
  mirrored = true,
  faceThreshold = 0.85,
  objectThreshold = 0.5
) {
  // Clear canvas once
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  
  // Get stored dimensions and scale factors once
  const scaleX = parseFloat(ctx.canvas.dataset.scaleX || "1");
  const scaleY = parseFloat(ctx.canvas.dataset.scaleY || "1");
  const displayWidth = parseFloat(ctx.canvas.dataset.displayWidth || ctx.canvas.width.toString());
  
  ctx.lineWidth = 4;
  
  // Draw faces (green boxes)
  ctx.strokeStyle = "#00ff00";
  for (const face of faces) {
    const score = face.probability?.[0] ?? 1;
    if (score < faceThreshold) continue;
    
    const topLeft = Array.isArray(face.topLeft) ? face.topLeft : [face.topLeft.dataSync()[0], face.topLeft.dataSync()[1]];
    const bottomRight = Array.isArray(face.bottomRight) ? face.bottomRight : [face.bottomRight.dataSync()[0], face.bottomRight.dataSync()[1]];
    
    const [x1, y1] = topLeft as [number, number];
    const [x2, y2] = bottomRight as [number, number];
    
    let scaledX1 = x1 * scaleX;
    let scaledY1 = y1 * scaleY;
    let scaledWidth = (x2 - x1) * scaleX;
    let scaledHeight = (y2 - y1) * scaleY;
    
    // Expand face box by 40% width, 60% height for better coverage
    const expansionX = 0.4;
    const expansionY = 0.6;
    const expandX = scaledWidth * expansionX / 2;
    const expandY = scaledHeight * expansionY / 2;
    
    scaledX1 -= expandX;
    scaledY1 -= expandY;
    scaledWidth += expandX * 2;
    scaledHeight += expandY * 2;
    
    if (mirrored) {
      scaledX1 = displayWidth - scaledX1 - scaledWidth;
    }
    
    ctx.strokeRect(scaledX1, scaledY1, scaledWidth, scaledHeight);
  }
  
  // Draw objects (red boxes)
  ctx.strokeStyle = "#ff0000";
  const deviceTypes = ["cell phone", "laptop", "tv", "monitor"];
  
  for (const obj of objects) {
    if (!deviceTypes.includes(obj.class) || obj.score < objectThreshold) continue;
    
    const [x, y, width, height] = obj.bbox;
    
    let scaledX = x * scaleX;
    let scaledY = y * scaleY;
    let scaledWidth = width * scaleX;
    let scaledHeight = height * scaleY;
    
    // Expand object box by 10% horizontally, 5% vertically (less height expansion)
    const expansionX = 0.10;
    const expansionY = 0.05;
    const expandX = scaledWidth * expansionX / 2;
    const expandY = scaledHeight * expansionY;
    
    scaledX -= expandX;
    scaledY -= expandY * 0.3; // Expand more upward than downward
    scaledWidth += expandX * 2;
    scaledHeight += expandY;
    
    // Keep within canvas bounds with extra margin from bottom
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const bottomMargin = 10; // 10px margin from bottom
    
    scaledX = Math.max(5, scaledX);
    scaledY = Math.max(5, scaledY);
    scaledWidth = Math.min(scaledWidth, canvasWidth - scaledX - 5);
    scaledHeight = Math.min(scaledHeight, canvasHeight - scaledY - bottomMargin);
    
    if (mirrored) {
      scaledX = displayWidth - scaledX - scaledWidth;
      scaledX = Math.max(5, Math.min(scaledX, canvasWidth - scaledWidth - 5));
    }
    
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
  }
  
  ctx.restore();
}
