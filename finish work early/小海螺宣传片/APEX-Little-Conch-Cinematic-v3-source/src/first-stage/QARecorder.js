// Local canvas-only recording. No screen permission or server upload.
export function setupRecorder(panel, getCanvas, start) {
  const button=document.createElement('button');button.textContent='录制完整镜头';button.type='button';panel.append(button);
  const output=document.createElement('span');output.setAttribute('role','status');panel.append(output);
  let recorder=null, timer=null, url=null;
  button.addEventListener('click',()=>{
    if(recorder?.state==='recording'){recorder.stop();return;}
    const canvas=getCanvas();
    if(!canvas?.captureStream||!window.MediaRecorder){output.textContent='当前浏览器不支持录制';return;}
    const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    if(!type){output.textContent='当前浏览器无可用的 WebM 编码器';return;}
    const stream=canvas.captureStream(30),chunks=[];
    try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:6000000});}
    catch{stream.getTracks().forEach(track=>track.stop());output.textContent='录制不可用，请用关键帧验收';return;}
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    recorder.onstop=()=>{
      clearTimeout(timer);stream.getTracks().forEach(track=>track.stop());
      if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
      output.textContent='';const link=document.createElement('a');link.href=url;link.download='apex-first-stage.webm';link.textContent='下载实录 WebM';link.style.marginLeft='10px';link.style.color='#b9eeee';output.append(link);
      button.textContent='录制完整镜头';
    };
    recorder.start(250);start();button.textContent='结束录制';output.textContent='录制中（仅场景，不含 HTML 仪表与音轨）';timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},24000);
  });
}
