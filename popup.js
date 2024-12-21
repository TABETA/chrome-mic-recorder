let mediaRecorder;
let audioChunks = [];

document.getElementById('start').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('マイクアクセス成功:', stream);
    mediaRecorder = new MediaRecorder(stream);
  
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
  
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/pcm' });
      const arrayBuffer = await blob.arrayBuffer();
      const pcmData = convertToPCM(arrayBuffer);
  
      const pcmBlob = new Blob([pcmData], { type: 'audio/pcm' });
      const url = URL.createObjectURL(pcmBlob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.wav';
      a.click();
      URL.revokeObjectURL(url);
    };
  
    mediaRecorder.start();
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.error('マイクのアクセスが拒否されました。');
      alert('マイクアクセスが拒否されました。設定を確認してください。');
    } else {
      console.error('その他のエラー:', error);
    }
  }
});

document.getElementById('stop').addEventListener('click', () => {
  mediaRecorder.stop();
  document.getElementById('start').disabled = false;
  document.getElementById('stop').disabled = true;
});

function convertToPCM(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const samples = new Int16Array(view.byteLength / 2);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = view.getInt16(i * 2, true); // little-endian
  }

  return samples.buffer;
}
