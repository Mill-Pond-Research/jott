import React, { useRef, useEffect } from 'react';

const VolumeMeter = ({ analyser }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const db = 20 * Math.log10(average / 255);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      canvasCtx.fillStyle = '#e0e0e0';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate meter width based on dB value
      const meterWidth = Math.max(0, Math.min(canvas.width, (db + 60) * (canvas.width / 60)));

      // Draw meter
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#4CAF50');  // Green
      gradient.addColorStop(0.6, '#FFC107');  // Yellow
      gradient.addColorStop(0.8, '#FF5722');  // Red

      canvasCtx.fillStyle = gradient;
      canvasCtx.fillRect(0, 0, meterWidth, canvas.height);

      // Draw dB value
      canvasCtx.fillStyle = '#000';
      canvasCtx.font = '12px Arial';
      canvasCtx.textAlign = 'right';
      canvasCtx.fillText(`${db.toFixed(1)} dB`, canvas.width - 5, canvas.height - 5);

      // Draw clipping indicator
      if (db > -3) {
        canvasCtx.fillStyle = '#FF0000';
        canvasCtx.beginPath();
        canvasCtx.arc(canvas.width - 10, 10, 5, 0, 2 * Math.PI);
        canvasCtx.fill();
      }
    };

    draw();

    return () => {
      // Clean up if necessary
    };
  }, [analyser]);

  return <canvas ref={canvasRef} width="300" height="30" className="w-full" />;
};

export default VolumeMeter;
