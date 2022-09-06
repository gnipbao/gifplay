# gifplay

animated GIF player with canvas support for pausing, going frame-by-frame

## Install

```js
$ npm i gifplay-js -S
```

## Usage

```js
// import
import { GifPlay } from 'gifplay-js'
const url = 'xx.gif' // gif url
const canvas = document.querySelector('canvas') // canvas element
const player = new GifPlay(canvas, url)
// play gif
player.play()
// pause gif
player.pause()
```

## API

- play
- pause
- togglePlay
- seek
- seekFrame
