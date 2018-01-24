<template>
  <div class="boat-ticket"
    :class="{'move-slowly': moveSlowly}"
    :style="{'background-color': pageBackground}">
    <div class="boat-ticket-mask"></div>
    <div class="time-container">
      <div class="time-scale">
        <div class="time-available-list">
          <div class="time-available-item"
            v-for="item in boatAvailableTime" :key="item.time"
            :style="{left: item.pos + '%'}"></div>
        </div>
        <div class="time-scale-list">
          <span v-for="hour in fullTimeList" :key="hour"
            :style="{width: timeScaleWidth + '%'}">
            {{ hour }}
          </span>
        </div>
        <div class="time-current-position"
          :class="{'move-slowly': moveSlowly}"
          :style="{left: boatPosition + '%'}">
        </div>
      </div>
      <div class="time-slider"
        @touchstart="timeSlideStart"
        @touchmove="timeSlideMoving"
        @touchend="timeSlideEnd">
        <div class="time-slider-picture">
          <div class="sun-moon-container">
            <div class="sun-container"
              :style="{transform: sunTransform, opacity: sunOpacity}">
              <img :src="boatImg.sun" alt="">
            </div>
            <div class="moon-container">
              <img :src="boatImg.moon" alt="">
            </div>
          </div>
        </div>
        <div class="time-slider-time">
          {{ boatTime }}
        </div>
      </div>
      <div class="time-date-slider">
        {{ boatDate }}
      </div>
    </div>
    <div class="scenic-container">
      <div id="dachen-map" class="scenic-map">
        <div class="scenic-point scenic-start-point"
          @touchstart="dragStart($event, 'start')"
          @touchmove="dragMove($event, 'start')"
          @touchend="dragEnd($event, 'start')"
          :style="{left: point.start.left + 'px', top: point.start.top + 'px'}">
          起
        </div>
        <div class="scenic-point scenic-end-point"
          @touchstart="dragStart($event, 'end')"
          @touchmove="dragMove($event, 'end')"
          @touchend="dragEnd($event, 'end')"
          :style="{left: point.end.left + 'px', top: point.end.top + 'px'}">
          终
        </div>
        <div class="scenic-area"
          v-for="scenic in scenicPosition" :key="scenic.name"
          :style="{
            left: scenic.position.left + 'px',
            top: scenic.position.top + 'px',
            'margin-left': -1 * scenicRadius + 'px',
            'margin-top': -1 * scenicRadius + 'px',
            width: scenicRadius * 2 + 'px',
            height: scenicRadius * 2 + 'px',
            'border-color': scenic.borderColor
          }">
          <div class="scenic-name">{{ scenic.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import boatImg from '@/assets/js/boatImg'
export default {
  name: 'boatTicket',
  data () {
    return {
      boatImg: boatImg,
      beginTime: 8, // 开始时间
      middleTime: 13, // 13点背景最亮，向两边依次变暗
      endTime: 22, // 结束时间
      fullTimeList: [], // 时间点列表
      timeScaleWidth: 0,
      slideMax: 0,
      slideMiddle: 0,
      colorRange: 0,
      boatAvailableTime: [
        { time: '8:00', pos: 0 },
        { time: '9:30', pos: 0 },
        { time: '11:20', pos: 0 },
        { time: '14:00', pos: 0 },
        { time: '15:30', pos: 0 },
        { time: '21:10', pos: 0 }
      ],
      slideStartX: 0, // 滑动开始的距离，并且每个touchmove都更新
      slideDistance: 1, // 滑动的像素距离
      autoAlignTimeout: null,
      moveSlowly: false,
      pageBackground: '',
      boatPosition: 0,
      boatTime: '8:00',
      boatDate: '1月24日',
      scenicPosition: [
        {
          name: '椒江',
          posScale: [0.15, 0.2],
          position: {
            top: 0,
            left: 0
          },
          borderColor: '#fff'
        }, {
          name: '一江山岛',
          posScale: [0.35, 0.6],
          position: {
            top: 0,
            left: 0
          },
          borderColor: '#fff'
        }, {
          name: '上大陈',
          posScale: [0.55, 0.8],
          position: {
            top: 0,
            left: 0
          },
          borderColor: '#fff'
        }, {
          name: '下大陈',
          posScale: [0.8, 0.8],
          position: {
            top: 0,
            left: 0
          },
          borderColor: '#fff'
        }
      ],
      mapSize: {
        width: 0,
        height: 0
      },
      scenicRadius: 0,
      point: {
        start: {
          left: 0,
          top: 0,
          oriX: 0,
          oriY: 0
        },
        end: {
          left: 0,
          top: 0,
          oriX: 0,
          oriY: 0
        }
      },
      sunTransform: '',
      moonTransform: '',
      sunOpacity: 1,
      moonOpacity: 1
    }
  },
  watch: {
    // 滑动距离改变时，时间和背景颜色随之改变
    slideDistance (val) {
      // 背景颜色改变
      let colorRange = (this.endTime - this.middleTime) * 100
      let slideMiddle = (this.middleTime - this.beginTime) * 100 // 中午对应的滑动距离
      let redStep = (173 - 18) / colorRange
      let greenStep = (216 - 50) / colorRange
      let blueStep = (230 - 87) / colorRange
      let r = 173 - parseInt(Math.abs(val - slideMiddle) * redStep)
      let g = 216 - parseInt(Math.abs(val - slideMiddle) * greenStep)
      let b = 230 - parseInt(Math.abs(val - slideMiddle) * blueStep)
      this.pageBackground = `rgb(${r}, ${g}, ${b})`
      this.boatPosition = this.slideToPosition(val)
      let sunDeg = val / this.slideMax * 252
      this.sunTransform = `translateX(calc(~"-50vw + 16px"))
        rotate(${-1 * sunDeg}deg)
        translateX(calc(~"45vw - 16px"))
        rotate(${sunDeg}deg);`
    }
  },
  mounted () {
    this.initData()
    this.initMapData()
    this.slideDistance = 0
  },
  methods: {
    initData () {
      // 时间刻度
      for (let i = this.beginTime; i <= this.endTime; i++) {
        this.fullTimeList.push(i)
      }
      // 每格宽度
      this.timeScaleWidth = 100 / ((this.endTime - this.beginTime) + 1)
      // 最大滑动距离
      this.slideMax = (this.endTime - this.beginTime) * 100
      // 前半部分滑动距离
      this.slideMiddle = (this.middleTime - this.beginTime) * 100
      // 后半部分滑动距离
      this.colorRange = (this.endTime - this.middleTime) * 100
      this.boatAvailableTime.forEach(item => {
        item.pos = this.timeToPosition(item.time)
      })
    },
    // 通过字符串时间计算定位left
    timeToPosition (str) {
      let h = parseInt(str.slice(0, str.indexOf(':')))
      let m = parseInt(str.slice(str.indexOf(':') + 1))
      m = m / 60
      return ((h - this.beginTime) + m + 0.5) * this.timeScaleWidth
    },
    slideToTime (distance) {
      let ratio = distance / this.slideMax
      let scaleLength = this.endTime - this.beginTime
      let time = ratio * scaleLength + this.beginTime
      let hour = Math.floor(time)
      let minute = parseInt((time - hour) * 60)
      return `${hour}:${minute}`
    },
    // 通过滑动距离计算定位left
    slideToPosition (distance) {
      let ratio = distance / this.slideMax // 比例
      let scaleLength = this.endTime - this.beginTime // 一共有几格
      return (ratio * scaleLength + 0.5) * this.timeScaleWidth
    },
    // 通过定位反推滑动距离，touchend的时候设置滑动距离用到
    positionToSlide (pos) {
      let scaleLength = this.endTime - this.beginTime // 一共有几格
      return (pos / this.timeScaleWidth - 0.5) / scaleLength * this.slideMax
    },
    timeSlideStart (e) {
      this.moveSlowly = false
      clearTimeout(this.autoAlignTimeout)
      this.autoAlignTimeout = null
      this.slideStartX = e.touches[0].pageX
    },
    timeSlideMoving (e) {
      let temp = this.slideDistance
      temp += this.slideStartX - e.touches[0].pageX
      if (temp < 0) {
        this.slideDistance = 0
      } else if (temp > this.slideMax) {
        this.slideDistance = this.slideMax
      } else {
        this.slideDistance = temp
      }
      this.slideStartX = e.touches[0].pageX
    },
    timeSlideEnd (e) {
      this.autoAlignTimeout = setTimeout(() => {
        let currentPosition = this.slideToPosition(this.slideDistance)
        let nearest = this.boatAvailableTime.reduce((pre, cur) => {
          if (Math.abs(cur.pos - currentPosition) < Math.abs(pre.pos - currentPosition)) {
            return cur
          } else {
            return pre
          }
        })
        let distance = this.positionToSlide(nearest.pos)
        this.moveSlowly = true
        this.slideDistance = distance
        this.boatTime = nearest.time
      }, 700)
    },
    initMapData () {
      let map = document.getElementById('dachen-map')
      this.mapSize.width = map.offsetWidth
      this.mapSize.height = map.offsetHeight
      this.scenicPosition.forEach(scenic => {
        scenic.position.top = scenic.posScale[0] * map.offsetHeight
        scenic.position.left = scenic.posScale[1] * map.offsetWidth
      })
      this.scenicRadius = map.offsetWidth * 0.08
      this.point.start.left = this.scenicPosition[0].position.left
      this.point.start.top = this.scenicPosition[0].position.top
      this.point.end.left = this.scenicPosition[2].position.left
      this.point.end.top = this.scenicPosition[2].position.top
    },
    dragStart (e, type) {
      this.point[type].oriX = e.touches[0].pageX
      this.point[type].oriY = e.touches[0].pageY
    },
    dragMove (e, type) {
      let tempLeft = this.point[type].left
      let tempTop = this.point[type].top
      tempLeft += (e.touches[0].pageX - this.point[type].oriX)
      tempTop += (e.touches[0].pageY - this.point[type].oriY)
      if (tempLeft < 10) {
        tempLeft = 10
      }
      if (tempLeft > this.mapSize.width - 10) {
        tempLeft = this.mapSize.width - 10
      }
      if (tempTop < 10) {
        tempTop = 10
      }
      if (tempTop > this.mapSize.height - 10) {
        tempTop = this.mapSize.height - 10
      }
      this.point[type].left = tempLeft
      this.point[type].top = tempTop
      this.point[type].oriX = e.touches[0].pageX
      this.point[type].oriY = e.touches[0].pageY
      let touchPos = [tempLeft, tempTop]
      this.scenicPosition.forEach(scenic => {
        let scenicPos = [scenic.position.left, scenic.position.top]
        if (this.isClose(touchPos, scenicPos, this.scenicRadius)) {
          scenic.borderColor = 'yellowgreen'
        } else {
          scenic.borderColor = '#fff'
        }
      })
    },
    dragEnd (e, type) {
      let touchPos = [this.point[type].left, this.point[type].top]
      this.scenicPosition.forEach(scenic => {
        let scenicPos = [scenic.position.left, scenic.position.top]
        if (this.isClose(touchPos, scenicPos, this.scenicRadius)) {
          this.point[type].left = scenic.position.left
          this.point[type].top = scenic.position.top
        }
      })
    },
    isClose (touch, scenic, radius) {
      let left2 = Math.pow((touch[0] - scenic[0]), 2)
      let top2 = Math.pow((touch[1] - scenic[1]), 2)
      let radius2 = Math.pow(radius, 2)
      return top2 + left2 < radius2
    }
  }
}
</script>

<style lang="less">
.move-slowly {
  transition: all 0.3s;
}
.boat-ticket {
  width: 100%;
  height: 100%;
  .boat-ticket-mask {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 62%;
    background-color: rgba(0, 0, 0, 0.1)
  }
  .time-container {
    position: absolute;
    top: 0;
    bottom: 90vw;
    left: 0;
    z-index: 1;
    width: 100%;
    .time-scale {
      position: relative;
      width: 100%;
      height: 35px;
      .time-available-list {
        position: relative;
        height: 10px;
        .time-available-item {
          position: absolute;
          top: 2px;
          width: 2px;
          height: 6px;
          margin-left: -1px;
          background-color: greenyellow;
        }
      }
      .time-scale-list {
        display: flex;
        justify-content: space-around;
        span {
          display: inline-block;
          height: 23px;
          line-height: 23px;
        }
      }
      .time-current-position {
        position: absolute;
        bottom: 0;
        margin-left: -4px;
        border: 4px solid transparent;
        border-bottom: 4px solid #F4664C;
        width: 0;
        height: 0;
      }
    }
    .time-slider {
      width: 100%;
      height: calc(~"100% - 80px");
      .time-slider-picture {
        height: calc(~"100% - 20px");
        .sun-moon-container {
          position: relative;
          width: 100vw;
          height: 50vw;
          .sun-container {
            width: 32px;
            height: 32px;
            position: absolute;
            right: 0;
            bottom: 0;
            transform-origin: 50% 50%;
          }
          .moon-container {
            width: 32px;
            height: 32px;
            position: absolute;
            right: 0;
            bottom: 0;
            transform-origin: 50% 50%;
          }
        }
      }
      .time-slider-time {
        height: 20px;
        line-height: 20px;
        font-size: 1.3rem;
      }
    }
    .time-date-slider {
      height: 50px;
      line-height: 50px;
      font-size: 1.3rem;
    }
  }
  .scenic-container {
    position: absolute;
    bottom: 10vw;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 80vw;
    .scenic-map {
      position: absolute;
      top: 0;
      left: 10%;
      width: 80%;
      height: 100%;
      border: 1px solid #fff;
      .scenic-point {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        margin-left: -10px;
        margin-top: -10px;
        width: 20px;
        height: 20px;
        background-color: greenyellow;
        color: #000;
      }
      .scenic-end-point {
        z-index: 2;
      }
      .scenic-area {
        position: absolute;
        border: 1px solid #fff;
        border-radius: 50%;
        box-sizing: border-box;
        .scenic-name {
          position: absolute;
          bottom: -17px;
          width: 100%;
          white-space:nowrap;
          height: 15px;
          line-height: 15px;
          font-size: 0.8rem;
          text-align: center;
        }
      }
    }
  }
}
</style>
