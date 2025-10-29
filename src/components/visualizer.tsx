import { useEffect, useRef } from "react";

const interpolateColor = (
  startColor: number[],
  endColor: number[],
  factor: number
): number[] => {
  const result: number[] = [];
  for (let i = 0; i < startColor.length; i += 1) {
    result[i] = Math.round(
      startColor[i] + factor * (endColor[i] - startColor[i])
    );
  }
  return result;
};

const Visualizer = ({
  microphone,
  isActive,
}: {
  microphone: MediaRecorder;
  isActive: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const AudioContextCtor =
    typeof window === "undefined"
      ? undefined
      : (window.AudioContext ?? window.webkitAudioContext);

  if (!AudioContextCtor) {
    throw new Error("AudioContext is not supported in this environment.");
  }

  const audioContext = new AudioContextCtor();
  const analyser = audioContext.createAnalyser();
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const animationFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    const source = audioContext.createMediaStreamSource(microphone.stream);
    source.connect(analyser);

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      source.disconnect();
    };
  }, []);

  const draw = (): void => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    if (isActiveRef.current) {
      analyser.getByteFrequencyData(dataArray);
    }

    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);

    const barWidth = 10;
    let x = 0;
    const startColor = [19, 239, 147];
    const endColor = [20, 154, 251];

    for (const value of dataArray) {
      const barHeight = (value / 255) * height * 2;

      const interpolationFactor = value / 255;

      const color = interpolateColor(startColor, endColor, interpolationFactor);

      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.1)`;
      context.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  };

  return <canvas ref={canvasRef} width={window.innerWidth} />;
};

export default Visualizer;
