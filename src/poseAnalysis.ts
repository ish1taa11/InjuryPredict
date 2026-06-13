import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";

// Load the MediaPipe pose model
export async function loadPoseModel(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  return poseLandmarker;
}

// Extract multiple frames from a video for movement analysis
export async function extractFramesFromVideo(
  videoFile: File,
  numFrames: number = 6
): Promise<{ canvases: HTMLCanvasElement[]; timestamps: number[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoFile);
    video.crossOrigin = "anonymous";
    video.muted = true;

    const canvases: HTMLCanvasElement[] = [];
    const timestamps: number[] = [];
    let frameIndex = 0;
    let duration = 0;

    video.addEventListener("loadedmetadata", () => {
      duration = video.duration;

      if (!duration || duration === Infinity || duration < 0.5) {
        URL.revokeObjectURL(video.src);
        return reject(new Error("Video too short or invalid"));
      }

      // Sample evenly across the video, skipping the very start/end
      const start = duration * 0.05;
      const end = duration * 0.95;
      const step = (end - start) / (numFrames - 1);
      seekToFrame(start + step * frameIndex);
    });

    const seekToFrame = (time: number) => {
      video.currentTime = time;
    };

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(video, 0, 0);

      canvases.push(canvas);
      timestamps.push(video.currentTime);
      frameIndex++;

      if (frameIndex < numFrames) {
        const start = duration * 0.05;
        const end = duration * 0.95;
        const step = (end - start) / (numFrames - 1);
        seekToFrame(start + step * frameIndex);
      } else {
        URL.revokeObjectURL(video.src);
        resolve({ canvases, timestamps, duration });
      }
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not load video file"));
    });

    video.load();
  });
}

// Calculate angle between 3 points (in degrees)
function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// Euclidean distance between two normalized landmark points
function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export interface FrameMeasurement {
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftShoulderY: number;
  rightShoulderY: number;
  leftHipY: number;
  rightHipY: number;
  leftWristX: number;
  rightWristX: number;
  visibilityScore: number; // average visibility of key landmarks (0-1)
}

export interface BiomechanicsResult {
  kneeAsymmetry: number;       // avg degrees difference left vs right knee across frames
  shoulderAsymmetry: number;   // avg % height difference
  hipAsymmetry: number;        // avg % height difference
  movementMagnitude: number;   // how much the body actually moved across frames (0+)
  poseDetected: boolean;       // a person was reliably detected
  validMovement: boolean;      // there was enough person + enough movement to trust results
  framesAnalyzed: number;
  framesWithPose: number;
  skeletonCanvas: HTMLCanvasElement | null;
}

// Run pose detection across multiple frames and aggregate results
export async function analyzeVideo(
  poseLandmarker: PoseLandmarker,
  canvases: HTMLCanvasElement[],
  timestamps: number[]
): Promise<BiomechanicsResult> {

  const measurements: FrameMeasurement[] = [];
  let skeletonCanvas: HTMLCanvasElement | null = null;
  let bestVisibility = 0;

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const timestampMs = Math.round(timestamps[i] * 1000);

    let result;
    try {
      result = poseLandmarker.detectForVideo(canvas, timestampMs);
    } catch {
      continue;
    }

    if (!result.landmarks || result.landmarks.length === 0) continue;

    const lm = result.landmarks[0];

    const leftShoulder  = lm[11];
    const rightShoulder = lm[12];
    const leftHip       = lm[23];
    const rightHip      = lm[24];
    const leftKnee      = lm[25];
    const rightKnee     = lm[26];
    const leftAnkle     = lm[27];
    const rightAnkle    = lm[28];
    const leftWrist     = lm[15];
    const rightWrist    = lm[16];

    const keyPoints = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
    const visibilities = keyPoints.map(p => p.visibility ?? 0);
    const visibilityScore = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;

    // Skip frames where the model isn't confident a person is even there
    if (visibilityScore < 0.5) continue;

    const leftKneeAngle  = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

    measurements.push({
      leftKneeAngle,
      rightKneeAngle,
      leftShoulderY: leftShoulder.y,
      rightShoulderY: rightShoulder.y,
      leftHipY: leftHip.y,
      rightHipY: rightHip.y,
      leftWristX: leftWrist.x,
      rightWristX: rightWrist.x,
      visibilityScore,
    });

    // Keep the highest-visibility frame for the skeleton overlay
    if (visibilityScore > bestVisibility) {
      bestVisibility = visibilityScore;
      const overlay = document.createElement("canvas");
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      const ctx = overlay.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, 0, 0);
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawLandmarks(lm, { color: "#00FF00", lineWidth: 2, radius: 4 });
        drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: "#00BFFF", lineWidth: 2 });
        skeletonCanvas = overlay;
      }
    }
  }

  const framesAnalyzed = canvases.length;
  const framesWithPose = measurements.length;

  // Require a person to be detected in at least half the sampled frames
  const poseDetected = framesWithPose >= Math.ceil(framesAnalyzed / 2) && framesWithPose >= 2;

  if (!poseDetected) {
    return {
      kneeAsymmetry: 0,
      shoulderAsymmetry: 0,
      hipAsymmetry: 0,
      movementMagnitude: 0,
      poseDetected: false,
      validMovement: false,
      framesAnalyzed,
      framesWithPose,
      skeletonCanvas: null,
    };
  }

  // Average asymmetry across all valid frames
  const avgKneeAsymmetry = measurements.reduce(
    (sum, m) => sum + Math.abs(m.leftKneeAngle - m.rightKneeAngle), 0
  ) / measurements.length;

  const avgShoulderAsymmetry = measurements.reduce(
    (sum, m) => sum + Math.abs(m.leftShoulderY - m.rightShoulderY) * 100, 0
  ) / measurements.length;

  const avgHipAsymmetry = measurements.reduce(
    (sum, m) => sum + Math.abs(m.leftHipY - m.rightHipY) * 100, 0
  ) / measurements.length;

  // Movement magnitude: how much did key joints move between consecutive frames?
  let totalMovement = 0;
  for (let i = 1; i < measurements.length; i++) {
    const prev = measurements[i - 1];
    const curr = measurements[i];
    totalMovement += distance(
      { x: prev.leftWristX, y: prev.leftShoulderY },
      { x: curr.leftWristX, y: curr.leftShoulderY }
    );
    totalMovement += distance(
      { x: 0, y: prev.leftHipY }, { x: 0, y: curr.leftHipY }
    );
    totalMovement += distance(
      { x: 0, y: prev.leftShoulderY }, { x: 0, y: curr.leftShoulderY }
    );
  }
  const movementMagnitude = totalMovement / Math.max(measurements.length - 1, 1);

  // A real "movement" video should show *some* change across frames.
  // A static photo, or a video where the person never moves, will be near-zero.
  const MOVEMENT_THRESHOLD = 0.01;
  const validMovement = movementMagnitude > MOVEMENT_THRESHOLD;

  return {
    kneeAsymmetry: avgKneeAsymmetry,
    shoulderAsymmetry: avgShoulderAsymmetry,
    hipAsymmetry: avgHipAsymmetry,
    movementMagnitude,
    poseDetected: true,
    validMovement,
    framesAnalyzed,
    framesWithPose,
    skeletonCanvas,
  };
}

// Convert real measurements into risk overrides
export function getRiskOverrides(bio: BiomechanicsResult): Record<string, "Low" | "Moderate" | "High"> {
  const overrides: Record<string, "Low" | "Moderate" | "High"> = {};

  if (!bio.poseDetected || !bio.validMovement) return overrides;

  if (bio.kneeAsymmetry > 15)      overrides["Knee"] = "High";
  else if (bio.kneeAsymmetry > 8)  overrides["Knee"] = "Moderate";
  else                              overrides["Knee"] = "Low";

  if (bio.shoulderAsymmetry > 8)      overrides["Shoulder"] = "High";
  else if (bio.shoulderAsymmetry > 4) overrides["Shoulder"] = "Moderate";
  else                                overrides["Shoulder"] = "Low";

  if (bio.hipAsymmetry > 6)      overrides["Hip"] = "High";
  else if (bio.hipAsymmetry > 3) overrides["Hip"] = "Moderate";
  else                           overrides["Hip"] = "Low";

  return overrides;
}