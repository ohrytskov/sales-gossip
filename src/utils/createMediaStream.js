const getPeakLevel = (analyzer) => {
  const array = new Uint8Array(analyzer.fftSize);
  analyzer.getByteTimeDomainData(array);
  return (
    array.reduce((max, current) => Math.max(max, Math.abs(current - 127)), 0) /
    128
  );
};

const createMediaStream = (stream, isRecording, callback) => {
  const context = new AudioContext();

  // Check if context is suspended and resume if necessary
  if (context.state === 'suspended') {
    context.resume().catch(error => {
      console.error('Error resuming audio context:', error);
    });
  }

  const source = context.createMediaStreamSource(stream);
  const analyzer = context.createAnalyser();
  
  // Optional: Set analyzer properties for better performance
  analyzer.fftSize = 2048; // Example value
  // You can set other properties as needed.

  source.connect(analyzer);

  const tick = () => {
    const peak = getPeakLevel(analyzer);
    if (isRecording) {
      callback(peak);
      requestAnimationFrame(tick);
    }
  };
  
  tick();

  return () => {
    // Cleanup function to stop audio processing
    source.disconnect(analyzer);
    analyzer.disconnect();
    context.close().catch(error => {
      console.error('Error closing audio context:', error);
    });
  };
};

export { createMediaStream };