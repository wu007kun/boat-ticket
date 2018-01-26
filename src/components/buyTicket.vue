<template>
  <div class="boat-ticket">
    <div class="sky-container"
      :class="{'background-slowly': moveSlowly}"
      :style="{'background-color': pageBackground}">
      <div class="time-scale">
        <div class="time-available-list">
          <div class="time-available-item"
            v-for="item in boatAvailableTime" :key="item.time"
            :style="{left: item.pos + '%'}">
          </div>
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
        <div class="sky-picture">
          <div class="sky-island">
            <img :src="boatImg.island" alt="">
          </div>
          <div class="sun-moon-container">
            <div class="sun-container"
              :class="{'move-slowly': moveSlowly}"
              :style="{transform: sunTransformOut}">
              <img :class="{'move-slowly': moveSlowly}"
                :style="{transform: sunTransformIn, opacity: sunOpacity}" :src="boatImg.sun" alt="">
            </div>
            <div class="moon-container"
              :class="{'move-slowly': moveSlowly}"
              :style="{transform: moonTransformOut}">
              <img :class="{'move-slowly': moveSlowly}"
                :style="{transform: moonTransformIn, opacity: moonOpacity}" :src="boatImg.moon" alt="">
            </div>
          </div>
        </div>
        <svg class="sky-wave" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="50">
          <g :fill="wave1">
            <path d="M 0 25 Q 75 15, 150 25 T 300 25 T 450 25 T 600 25 T 750 25 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-300" dur="1.5s" repeatCount="indefinite"></animateTransform>
          </g>
          <g :fill="wave2">
            <path d="M 0 25 Q 87.5 10, 175 25 T 350 25 T 525 25 T 700 25 T 875 25 T 1050 25 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-350" dur="3s" repeatCount="indefinite"></animateTransform>
          </g>
          <g :fill="pageBackgroundBelow" transform="translate(-903.868 0)">
            <path d="M 0 25 Q 135 12, 270 25 T 540 25 T 810 25 T 1080 25 V 100 H 0 V 0" transform="translate(-38.232284367796474, 0)"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-540" dur="2s" repeatCount="indefinite"></animateTransform>
          </g>
        </svg>
      </div>
    </div>
    <div class="scenic-container"
      :class="{'background-slowly': moveSlowly}"
      :style="{'background-color': pageBackgroundBelow}">
      <div class="time-slider-time">
        {{ boatTime }}
      </div>
      <span class="time-date-slider"
        id="date-slider-container"
        @touchstart="dateSlideStart"
        @touchmove="dateSlideMoving"
        @touchend="dateSlideEnd">
        <span class="time-boat-date"
          :class="{'time-checked-date': dateIndex === item.id, 'move-slowly': dateSlowly}"
          :style="{transform: `translateX(${dateTransform}%)`}"
          v-for="item in boatDate" :key="item.id"
          @click="clickDate(item.id)">
          {{ item.text }}
        </span>
      </span>
      <div class="tourist-count">
        <div class="tourist-img-container"
          v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="n"
          :style="{transform: `translateX(${touristTransform}%)`}"
          @click="checkTourist(n)">
          <img :src="n < 6 ? boatImg.tourist1 : boatImg.tourist0" alt="">
        </div>
      </div>
      <!-- <div id="dachen-map" class="scenic-map">
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
      </div> -->
      <mt-picker :slots="scenicPickerSlots" :visibleItemCount="3" @change="scenicPickerChange"></mt-picker>
      <div class="boat-footer">
        <div class="footer-confirm-btn" @click="confirmBoatTicket">预 订</div>
        <div class="footer-history-btn" @click="toHistory"><img :src="boatImg.clock" alt=""></div>
      </div>
    </div>
  </div>
</template>

<script>
import boatImg from '@/assets/js/boatImg'
import moment from 'moment'
import { mapState } from 'vuex'
// import { Picker } from 'mint-ui'
export default {
  name: 'buyTicket',
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
        { time: '08:00', pos: 0 },
        { time: '09:30', pos: 0 },
        { time: '11:20', pos: 0 },
        { time: '14:00', pos: 0 },
        { time: '15:30', pos: 0 },
        { time: '21:10', pos: 0 }
      ],
      slideStartX: 0, // 滑动开始的距离，并且每个touchmove都更新
      slideDistance: 1, // 滑动的像素距离
      autoAlignTimeout: null,
      moveSlowly: false,
      pageBackground: 'rgba(11, 195, 251, 1)',
      pageBackgroundBelow: 'rgba(11, 195, 251, 1)',
      boatPosition: 0,
      sunTransformOut: 'rotate(0deg)',
      sunTransformIn: 'rotate(0deg)',
      moonTransformOut: 'rotate(0deg)',
      moonTransformIn: 'rotate(0deg)',
      sunOpacity: 1,
      moonOpacity: 1,
      boatTime: '08:00',
      boatDate: [],
      dateIndex: 1,
      dateTransform: 100,
      dateSlowly: false,
      dateStartX: 0,
      dateContainerWidth: 0,
      touristTransform: -400,
      wave1: '',
      wave2: '',
      wave3: '',
      // scenicPosition: [
      //   {
      //     name: '椒江',
      //     posScale: [0.15, 0.2],
      //     position: {
      //       top: 0,
      //       left: 0
      //     },
      //     borderColor: '#fff'
      //   }, {
      //     name: '一江山岛',
      //     posScale: [0.35, 0.6],
      //     position: {
      //       top: 0,
      //       left: 0
      //     },
      //     borderColor: '#fff'
      //   }, {
      //     name: '上大陈',
      //     posScale: [0.55, 0.8],
      //     position: {
      //       top: 0,
      //       left: 0
      //     },
      //     borderColor: '#fff'
      //   }, {
      //     name: '下大陈',
      //     posScale: [0.8, 0.8],
      //     position: {
      //       top: 0,
      //       left: 0
      //     },
      //     borderColor: '#fff'
      //   }
      // ],
      // mapSize: {
      //   width: 0,
      //   height: 0
      // },
      // scenicRadius: 0,
      // point: {
      //   start: {
      //     left: 0,
      //     top: 0,
      //     oriX: 0,
      //     oriY: 0
      //   },
      //   end: {
      //     left: 0,
      //     top: 0,
      //     oriX: 0,
      //     oriY: 0
      //   }
      // },
      scenicPickerSlots: [
        {
          flex: 1,
          values: ['椒江区', '一江山岛', '上大陈', '下大陈'],
          className: 'scenic-slot1',
          textAlign: 'right'
        }, {
          divider: true,
          content: '→',
          className: 'scenic-slot2'
        }, {
          flex: 1,
          values: ['椒江区', '一江山岛', '上大陈', '下大陈'],
          className: 'scenic-slot3',
          textAlign: 'left',
          defaultIndex: 1
        }
      ],
      scenicPickerValue: [],
      record: []
    }
  },
  computed: {
    ...mapState(['historyList'])
  },
  watch: {
    // 滑动距离改变时，改变小箭头和太阳月亮
    slideDistance (val) {
      let colorRange = (this.endTime - this.middleTime) * 100
      let slideMiddle = (this.middleTime - this.beginTime) * 100 // 中午对应的滑动距离
      let redStep1 = (181 - 0) / colorRange
      let greenStep1 = (234 - 5) / colorRange
      let blueStep1 = (248 - 50) / colorRange
      let r1 = 181 - parseInt(Math.abs(this.slideDistance - slideMiddle) * redStep1)
      let g1 = 234 - parseInt(Math.abs(this.slideDistance - slideMiddle) * greenStep1)
      let b1 = 248 - parseInt(Math.abs(this.slideDistance - slideMiddle) * blueStep1)
      this.pageBackground = `rgba(${r1},${g1},${b1},1)`
      let redStep2 = (10 - 6) / colorRange
      let greenStep2 = (150 - 11) / colorRange
      let blueStep2 = (200 - 26) / colorRange
      let r2 = 10 - parseInt(Math.abs(this.slideDistance - slideMiddle) * redStep2)
      let g2 = 150 - parseInt(Math.abs(this.slideDistance - slideMiddle) * greenStep2)
      let b2 = 200 - parseInt(Math.abs(this.slideDistance - slideMiddle) * blueStep2)
      this.pageBackgroundBelow = `rgba(${r2},${g2},${b2},1)`
      this.wave1 = `rgba(${r2},${g2},${b2},0.5)`
      this.wave2 = `rgba(${r2},${g2},${b2},0.7)`
      this.boatPosition = this.slideToPosition(val)
      let sunDeg = parseInt((val + 200) / 2400 * 360)
      this.sunTransformOut = `rotate(${-1 * sunDeg}deg)`
      this.sunTransformIn = `rotate(${sunDeg}deg)`
      let moonDeg = parseInt((val + 1600) / 2400 * 360)
      this.moonTransformOut = `rotate(${-1 * moonDeg}deg)`
      this.moonTransformIn = `rotate(${moonDeg}deg)`
      this.sunOpacity = this.getOpacity(sunDeg)
      this.moonOpacity = this.getOpacity(moonDeg)
    }
  },
  mounted () {
    this.initData()
    // this.initMapData()
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
      for (let i = 0; i < 3; i++) {
        let date = moment().add(i, 'days').format('MM月DD日')
        let item = {
          id: i + 1,
          text: date
        }
        this.boatDate.push(item)
      }
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
      return moment(`${hour}:${minute}`, 'HH:mm').format('HH:mm')
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
      e.preventDefault()
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
    getOpacity (deg) {
      let to90 = Math.abs(deg % 180 - 90) / 90
      if (to90 < 0.5) {
        return 1
      } else {
        return 2 * (1 - to90)
      }
    },
    dateSlideStart (e) {
      this.dateSlowly = false
      this.dateStartX = e.touches[0].pageX
      let container = document.getElementById('date-slider-container')
      this.dateContainerWidth = container.offsetWidth
    },
    dateSlideMoving (e) {
      e.preventDefault()
      let temp = this.dateTransform
      temp += (e.touches[0].pageX - this.dateStartX) * 20 / this.dateContainerWidth
      if (temp < -150) {
        temp = -150
      } else if (temp > 150) {
        temp = 150
      }
      this.dateTransform = temp
      this.slideStartX = e.touches[0].pageX
    },
    dateSlideEnd (e) {
      this.dateSlowly = true
      if (this.dateTransform < -50) {
        this.dateTransform = -100
        this.dateIndex = 3
      } else if (this.dateTransform > 50) {
        this.dateTransform = 100
        this.dateIndex = 1
      } else {
        this.dateTransform = 0
        this.dateIndex = 2
      }
    },
    clickDate (id) {
      this.dateSlowly = true
      if (id === 1) {
        this.dateTransform = 100
        this.dateIndex = 1
      } else if (id === 2) {
        this.dateTransform = 0
        this.dateIndex = 2
      } else if (id === 3) {
        this.dateTransform = -100
        this.dateIndex = 3
      }
    },
    checkTourist (n) {
      this.touristTransform += (n - 5) * 100
    },
    scenicPickerChange (picker, values) {
      this.scenicPickerValue = values
      // let list = this.scenicPickerSlots[2].values
      // console.log(list)
      // let newList = list.splice(list.indexOf(values[0]), 1)
      // picker.setSlotValues(1, newList)
      // getSlotValues(index):获取给定 slot 的备选值数组
      // setSlotValues(index, values):设定给定 slot 的备选值数组
    },
    confirmBoatTicket () {
      let time = this.slideToTime(this.slideDistance)
      let date = this.boatDate[this.dateIndex - 1].text
      if (this.scenicPickerValue[0] !== this.scenicPickerValue[1]) {
        let payload = {
          time: time,
          date: date,
          scenic: this.scenicPickerValue,
          tourist: this.touristTransform / 100 + 5
        }
        this.$store.commit('addToHistory', payload)
        console.log(payload)
      }
      this.$router.push('/history')
    },
    toHistory () {
      this.$router.push('/history')
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
      e.preventDefault()
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
          scenic.borderColor = 'yellowgreen'
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
.background-slowly {
  transition: background-color 0.5s;
}
.boat-ticket {
  width: 100%;
  height: 100%;
  .sky-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 40%;
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
      position: relative;
      width: 100%;
      height: calc(~"100% - 35px");
      .sky-picture {
        height: calc(~"100% - 30px");
        position: relative;
        .sky-island {
          position: absolute;
          height: 80%;
          padding: 10% 0 0 15%;
          img {
            width: auto;
            height: 100%;
          }
        }
        .sun-moon-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .sun-container {
            width: 32px;
            height: 32px;
            position: absolute;
            right: 2vw;
            bottom: 0;
            transform-origin: calc(~"-48vw + 32px") 16px;
          }
          .moon-container {
            width: 32px;
            height: 32px;
            position: absolute;
            right: 2vw;
            bottom: 0;
            transform-origin: calc(~"-48vw + 32px") 16px;
          }
        }
      }
      .sky-wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 70px;
        // z-index: 3;
        transition: background-color 0.5s;
      }
    }
  }
  .scenic-container {
    position: absolute;
    top: 39%;
    bottom: 0;
    left: 0;
    width: 100%;
    .time-slider-time {
      height: 30px;
      line-height: 30px;
      font-size: 20px;
    }
    .time-date-slider {
      height: 50px;
      overflow: hidden;
      display: inline-block;
      user-select: none;
      backface-visibility: hidden;
      .time-boat-date {
        padding: 0 10px;
        display: inline-block;
        font-size: 20px;
        height: 50px;
        line-height: 50px;
        opacity: 0.3;
      }
      .time-checked-date {
        opacity: 1;
      }
    }
    .tourist-count {
      margin: 0 auto;
      width: 200px;
      height: 50px;
      overflow: hidden;
      display: flex;
      user-select: none;
      backface-visibility: hidden;
      .tourist-img-container {
        display: inline-block;
        width: 40px;
        cursor: pointer;
        user-select: none;
      }
      img {
        width: 40px;
        height: auto;
        user-select: none;
      }
    }
    .scenic-slot1, .scenic-slot2, .scenic-slot3 {
      color: #fff;
      .picker-item {
        color: #fff;
        opacity: 0.3;
      }
      .picker-selected {
        color: #fff;
        opacity: 1;
      }
    }
    .boat-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 30%;
      width: 100%;
      display: flex;
      justify-content: center;
      .footer-confirm-btn {
        padding: 5px 15px;
        height: 30px;
        line-height: 30px;
        border-radius: 5px;
        font-size: 18px;
        background-color: #0B96D9;
      }
      .footer-history-btn {
        position: absolute;
        bottom: 25px;
        right: 25px;
        width: 42px;
        height: 42px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    // .scenic-map {
    //   position: absolute;
    //   top: 0;
    //   left: 10%;
    //   width: 80%;
    //   height: 100%;
    //   // border: 1px solid #fff;
    //   .scenic-point {
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    //     z-index: 1;
    //     margin-left: -10px;
    //     margin-top: -10px;
    //     width: 20px;
    //     height: 20px;
    //     background-color: greenyellow;
    //     color: #000;
    //   }
    //   .scenic-end-point {
    //     z-index: 2;
    //   }
    //   .scenic-area {
    //     position: absolute;
    //     border: 1px solid #fff;
    //     border-radius: 50%;
    //     box-sizing: border-box;
    //     .scenic-name {
    //       position: absolute;
    //       bottom: -17px;
    //       width: 100%;
    //       white-space:nowrap;
    //       height: 15px;
    //       line-height: 15px;
    //       font-size: 0.8rem;
    //       text-align: center;
    //     }
    //   }
    // }
  }
}
</style>
