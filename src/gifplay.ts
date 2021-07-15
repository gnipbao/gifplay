import { parseGIF, decompressFrames } from 'gifuct-js'

export class GifPlay {
  playing = false

  paused = false

  loading = false

  gifCanvas: HTMLCanvasElement = document.createElement('canvas')

  gifCtx: CanvasRenderingContext2D | null = this.gifCanvas.getContext('2d')

  width = 0

  height = 0

  frames: any[] = []

  length = 0

  frameIndex = 0

  playSpeed = 1

  imageData: any

  src = ''

  timerId = 0

  rid = 0

  constructor(url: string, canvas: HTMLCanvasElement) {
    this.src = url
    this.gifCanvas = canvas
    this.gifCtx = this.gifCanvas?.getContext('2d')
    this.load(url)
  }

  load(url: string) {
    this.loading = true
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buff => parseGIF(buff))
      .then(gif => {
        this.frames = decompressFrames(gif, true)
        this.width = this.frames[0].dims.width
        this.height = this.frames[0].dims.height
        this.loading = false
        this.play()
      })
      .catch(() => {
        this.loading = false
      })
  }

  play() {
    if (this.frames.length < 1) {
      return
    }
    if (!this.playing) {
      this.paused = false
      this.playing = true
      this._play()
    }
  }

  pause() {
    this.paused = true
    this.playing = false
    clearTimeout(this.timerId)
    cancelAnimationFrame(this.rid)
  }

  _play() {
    let delay
    const start = new Date().getTime()
    if (this.playSpeed === 0) {
      return this.pause()
    } else {
      delay = this.frames[this.frameIndex].delay / this.playSpeed

      if (this.frames[this.frameIndex].disposalType === 2) {
        this.gifCtx?.clearRect(0, 0, this.width, this.height)
      }

      this.imageData = this.frames[this.frameIndex].patch
      // render canvas
      this.render()
      // update frame index
      this.frameIndex += 1
      if (this.frameIndex >= this.frames.length) {
        this.frameIndex = 0
      }

      const end = new Date().getTime()
      const diff = end - start
      // timer
      this.timerId = window.setTimeout(() => {
        this.rid = window.requestAnimationFrame(this._play.bind(this))
      }, Math.max(0, Math.floor(delay - diff)))
    }
  }

  togglePlay() {
    if (this.paused || !this.playing) {
      this.play()
    } else {
      this.pause()
    }
  }

  private _render() {
    const dims = this.frames[this.frameIndex].dims
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (
      !this.imageData ||
      dims.width != this.imageData.width ||
      dims.height != this.imageData.height
    ) {
      tempCanvas.width = dims.width
      tempCanvas.height = dims.height
      this.imageData = tempCtx?.createImageData(dims.width, dims.height) || null
    }
    // set the patch data as an override
    this.imageData.data.set(this.frames[this.frameIndex].patch)
    // draw the patch back over the canvas
    tempCtx?.putImageData(this.imageData, 0, 0)

    this.gifCtx?.drawImage(tempCanvas, dims.left, dims.top)
  }

  render() {
    this._render()
  }

  seek(time: number) {
    clearTimeout(this.timerId)
    cancelAnimationFrame(this.rid)
    if (time < 0) time = 0
    time *= 1000 // in ms
    time %= this.frames[this.frames.length - 1].time
    let frame = 0
    while (time > this.frames[frame].time && frame < this.frames.length) {
      frame += 1
    }
    this.frameIndex = frame
    if (this.playing) {
      this._play()
    } else {
      this.imageData = this.frames[this.frameIndex].patch
      this.render()
    }
  }

  seekFrame(frame: number): void {
    clearTimeout(this.timerId)
    cancelAnimationFrame(this.rid)
    this.frameIndex = frame % this.frames.length
    if (this.playing) {
      this._play()
    } else {
      this.imageData = this.frames[this.frameIndex].patch
      this.render()
    }
  }
}
