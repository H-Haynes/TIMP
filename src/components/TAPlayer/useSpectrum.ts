
export default () => {
  const { playInfo } = useStore('playSetting')
  // 频谱
  const canvas = ref()
  const ctx = ref()
  const initCanvas = () => {
    canvas.value = document.getElementById("audioCanvas") as HTMLCanvasElement
    ctx.value = canvas.value.getContext("2d")
    canvas.value.width = 200 * devicePixelRatio
    canvas.value.height = 200 * devicePixelRatio
  }
  // 创建音频上下文
  const analyser = ref()
  const isInit = ref(false)
  const buffer = ref<Uint8Array>()
  const handlePlay = (audio: HTMLAudioElement) => {
    const audioContext = new AudioContext()

    if (isInit.value) {
      return
    }
    isInit.value = true
    // 创建分析器节点
    analyser.value = audioContext.createAnalyser()
    //调整分析精细度，2^n, 常见取值：512,1024,2048....
    // 设置fftSize后，bins的数量就固定了，bins的数量越多，频率分辨率越高
    // 分析结果数组长度是设置的值的一半
    analyser.value.fftSize = 2048
    // 准备一个能放下这些数据的buffer
    buffer.value = new Uint8Array(analyser.value.frequencyBinCount)

    // 配置音频来源
    // 可以是audio元素,也可以是其他来源
    const source = audioContext.createMediaElementSource(audio)
    //流媒体 createMediaStreamSource()
    //
    // 将音频源与分析器连接
    source.connect(analyser.value)
    // 连接到最终的音频播放设备(输出信号)
    console.log(audioContext.destination, '输出设备')
    analyser.value.connect(audioContext.destination)
  }
  const updateAnalysis = () => {
    requestAnimationFrame(updateAnalysis)
    if (!isInit.value) {
      return
    }
    // 以调用该函数的时间为准，获取一小段的音频信息,并保存
    // 频域\时域数据
    // 频域数据：x轴表示频率，y表示功率(能量)
    analyser.value.getByteFrequencyData(buffer.value)
    // 时域数据：x轴表示时间 y轴表示振幅（音量）
    // analyser.value.getByteTimeDomainData(buffer.value)
    // console.log(buffer.value)
    draw(buffer.value)
    // console.log(buffer.value)
  }
  updateAnalysis()

  const getAverage = (arr) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }

  // 绘制图形
  const draw = (data: any) => {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // 将1024个按
    const list: any[] = []
    for (let i = 0; i < buffer.value!.length; i += 4) {
      list.push(buffer.value!.slice(i, i + 4))
    }


    var deg = 1 //角度
    var potInt = { x: 200 * devicePixelRatio / 2, y: 200 * devicePixelRatio / 2 } //起始坐标
    var R = 200 * devicePixelRatio / 2 //半径

    drawSpectrum(list, R, deg, potInt)

    drawEmpty(list, R, deg, potInt)

    // 绘制圆边框
    ctx.value.arc(potInt.x, potInt.y, R, 0, 2 * Math.PI, true);
    ctx.value.fill();
  }

  // 绘制频谱数据
  const drawSpectrum = (spectrumList: number[], R: number, deg: number, potInt: { x: number, y: number }) => {
    ctx.value.strokeStyle = "#c9af98"
    ctx.value.lineCap = "round"
    ctx.value.shadowColor = "#ff890910"
    ctx.value.shadowBlur = 10
    ctx.value.fillStyle = "#123456"

    ctx.value.beginPath();

    buffer.value?.slice(0, 360).forEach((item, index) => {
      const value = item / 10; // 根据数据获取波浪的高度
      const rv = R - value; // 计算波浪顶部的半径

      const p = ((index * deg) / 180) * Math.PI;
      const x = Math.sin(p) * rv + potInt.y;
      const y = -Math.cos(p) * rv + potInt.x;

      if (index === 0) {
        ctx.value.moveTo(x, y);
      }
      ctx.value.lineTo(x, y);

    })

    ctx.value.lineTo(potInt.y + Math.sin(0) * (R - getAverage(spectrumList[0]) / 20), potInt.x - Math.cos(0) * (R - getAverage(spectrumList[0]) / 20));
    ctx.value.closePath();

    ctx.value.stroke()

  }

  // 填充频谱数据外的区域
  const drawEmpty = (spectrumList: number[], R: number, deg: number, potInt: { x: number, y: number }) => {

    // const gradient = ctx.value.createLinearGradient(potInt.x - R, potInt.y, potInt.x + R, potInt.y);
    const gradient = ctx.value.createRadialGradient(100 * devicePixelRatio, 100 * devicePixelRatio, R, 100 * devicePixelRatio, 100 * devicePixelRatio, R - 15);


    // 添加渐变色和位置
    // gradient.addColorStop(0, '#6E69CD'); // 蓝色
    // gradient.addColorStop(0.5, '#9369BE'); // 绿色
    // gradient.addColorStop(1, '#B06AB3'); // 红色

    // gradient.addColorStop(0, '#2980B9'); // 蓝色
    // gradient.addColorStop(0.5, '#6DD5FA'); // 绿色
    // gradient.addColorStop(1, '#ffffff'); // 红色

    gradient.addColorStop(0, '#399FFF'); // 蓝色
    gradient.addColorStop(0.5, '#31C3FA'); // 绿色
    gradient.addColorStop(1, '#61D7EA'); // 红色

    ctx.value.fillStyle = gradient;

    // ctx.value.fillStyle = "#c9af98";
    ctx.value.beginPath();
    ctx.value.moveTo(potInt.x + R, potInt.y);

    buffer.value?.slice(0, 360).forEach((item, index) => {
      const value = item / 10; // 根据数据获取波浪的高度
      const rv = R - value; // 计算波浪顶部的半径
      const p = ((index * deg) / 180) * Math.PI;
      const x = Math.sin(p) * rv + potInt.y;
      const y = -Math.cos(p) * rv + potInt.x;

      if (index === 0) {
        ctx.value.moveTo(x, y);
      }
      ctx.value.lineTo(x, y);
    })

    ctx.value.lineTo(potInt.y + Math.sin(0) * (R - spectrumList[0] / 20), potInt.x - Math.cos(0) * (R - spectrumList[0] / 20));
    ctx.value.closePath();

  }

  // 绘制封面
  const drawPoster = () => {
    if (playInfo.value.album?.pic) {
      //定义图片
      const img = new Image();
      img.src = playInfo.value.album.pic
      img.crossOrigin = "anonymous"
      img.onload = function () {
        ctx.value.drawImage(this, 10, 10, 200, 200)
      }
    }
  }

  return {
    updateAnalysis,
    initCanvas,
    handlePlay,
    canvas,
  }
}
