<template>
  <div class="boat-ticket" @touchmove="preventSlide($event)">
    <div class="sky-container"
      :class="{'background-slowly': moveSlowly}"
      :style="{'background-color': pageBackground}">
      <div class="time-scale">
        <div class="time-current-position"></div>
        <div class="time-scale-list"
          :class="{'move-slowly': moveSlowly}"
          :style="{transform: `translateX(${-slideDistance}px)`}">
          <div class="time-available-item"
            v-for="item in availableTimeList" :key="item.pos"
            :style="{left: item.pos + '%'}">
          </div>
          <div class="time-scale-list-item" v-for="item in fullTimeList" :key="item.key"
            :style="{width: timeScaleWidth + '%'}">
            <span>{{ item.time }}</span>
            <span v-show="item.time === 12 && fullTimeList.indexOf(item) % 12 !== 0">AM</span>
            <span v-show="item.time === 12 && fullTimeList.indexOf(item) % 12 === 0">PM</span>
          </div>
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
              :class="{'sun-slowly': moveSlowly}"
              :style="{transform: sunTransformOut}">
              <img :class="{'sun-slowly': moveSlowly}"
                :style="{transform: sunTransformIn, opacity: sunOpacity}" :src="boatImg.sun" alt="">
            </div>
            <div class="moon-container"
              :class="{'sun-slowly': moveSlowly}"
              :style="{transform: moonTransformOut}">
              <img :class="{'sun-slowly': moveSlowly}"
                :style="{transform: moonTransformIn, opacity: moonOpacity}" :src="boatImg.moon" alt="">
            </div>
          </div>
        </div>
        <svg class="sky-wave"
          :style="{height: waveHeight + 'px'}"
          :class="{'sun-slowly': moveSlowly}"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink">
          <g :class="{'background-slowly': moveSlowly}"
            :style="{fill: wave1}">
            <path d="M 0 50 Q 270 25, 540 50 T 1080 50 T 1620 50 T 2160 50 T 2700 50 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform"
              attributeType="XML"
              type="translate"
              from="0"
              to="-1080"
              dur="2.5s"
              repeatCount="indefinite"></animateTransform>
          </g>
          <g :class="{'background-slowly': moveSlowly}"
            :style="{fill: wave2}">
            <path d="M 0 40 Q 135 60, 270 40 T 540 40 T 810 40 T 1080 40 T 1350 40 T 1620 40 T 1890 40 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-540" dur="3s" repeatCount="indefinite"></animateTransform>
          </g>
          <g :class="{'background-slowly': moveSlowly}"
            :style="{fill: pageBackgroundBelow}">
            <path d="M 0 80 Q 500 40, 1000 80 T 2000 80 T 3000 80 T 4000 80 V 160 H 0 V 0" transform="translate(-38.232284367796474, 0)"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-2000" dur="4s" repeatCount="indefinite"></animateTransform>
          </g>
        </svg>
      </div>
    </div>
    <div class="scenic-container"
      @touchmove="preventSlide($event)"
      :class="{'background-slowly': moveSlowly}"
      :style="{'background-color': pageBackgroundBelow}">
      <div class="current-time">
        {{ boatTime }}
      </div>
      <div class="current-time">{{ this.boatDate[this.dateIndex] }}</div>
      <div class="tourist-count">
        <div class="tourist-img-container"
          v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="n"
          :style="{transform: `translateX(${touristTransform}%)`}"
          @click="checkTourist(n)">
          <img :src="n < 6 ? boatImg.tourist1 : boatImg.tourist0" alt="">
        </div>
      </div>
      <div class="picker">
        <div class="picker-section">
          <div class="picker-item"
            :class="{
              'active-item': from === item,
              'disabled-item': to === item
            }"
            v-for="(item, index) in pickerSlots"
            :key="index"
            @click="setFrom(item)">
            {{ item }}
          </div>
        </div>
        <img src="~@/assets/img/arrow.png" alt="">
        <div class="picker-section">
          <div class="picker-item"
            :class="{
              'active-item': to === item,
              'disabled-item': from === item
            }"
            v-for="(item, index) in pickerSlots"
            :key="index"
            @click="setTo(item)">
            {{ item }}
          </div>
        </div>
      </div>
      <div class="boat-footer" @touchmove="preventSlide($event)">
        <img @click="back"
          style="left: 25px;right: auto;"
          class="footer-history-btn"
          src="~@/assets/img/home.png" alt="">
        <div class="footer-history-btn" @click="toHistory"><img :src="boatImg.clock" alt=""></div>
        <div class="footer-confirm-btn" @click="confirmBoatTicket">预 订</div>
        <img @click="toHistory"
          class="footer-history-btn"
          :src="boatImg.clock" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import boatImg from '@/assets/js/boatImg'
import moment from 'moment'
import { mapState } from 'vuex'
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
        '08:00',
        '09:30',
        '11:20',
        '14:00',
        '15:30',
        '21:10'
      ],
      availableTimeList: [],
      slideStartX: 0, // 滑动开始的距离，并且每个touchmove都更新
      slideDistance: 0, // 滑动的像素距离
      autoAlignTimeout: null,
      moveSlowly: false,
      pageBackground: 'rgba(41, 62, 90, 1)',
      pageBackgroundBelow: 'rgba(23, 45, 67, 1)',
      sunTransformOut: 'rotate(0deg)',
      sunTransformIn: 'rotate(0deg)',
      moonTransformOut: 'rotate(0deg)',
      moonTransformIn: 'rotate(0deg)',
      sunOpacity: 1,
      moonOpacity: 1,
      boatTime: '08:00',
      boatDate: [],
      dateIndex: 0,
      dateTransform: 100,
      dateSlowly: false,
      dateStartX: 0,
      dateContainerWidth: 0,
      touristTransform: -400,
      wave1: 'rgba(23, 45, 67, 0.3)',
      wave2: 'rgba(23, 45, 67, 0.6)',
      waveHeight: 100,
      pickerSlots: ['椒江区', '一江山岛', '上大陈', '下大陈'],
      record: [],
      from: '椒江区',
      to: '上大陈'
    }
  },
  computed: {
    ...mapState(['historyList'])
  },
  watch: {
    // 滑动距离改变时，改变小箭头和太阳月亮
    slideDistance (val) {
      let colorRange = this.slideMax / 6 // 中间是午夜
      if (this.moveSlowly === true) {
        setTimeout(() => {
          let redStep1 = (133 - 41) / colorRange
          let greenStep1 = (198 - 62) / colorRange
          let blueStep1 = (213 - 90) / colorRange
          let r1 = 41 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * redStep1)
          let g1 = 62 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * greenStep1)
          let b1 = 90 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * blueStep1)
          this.pageBackground = `rgba(${r1},${g1},${b1},1)`
          let redStep2 = (19 - 23) / colorRange
          let greenStep2 = (125 - 45) / colorRange
          let blueStep2 = (165 - 67) / colorRange
          let r2 = 23 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * redStep2)
          let g2 = 45 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * greenStep2)
          let b2 = 67 + parseInt(Math.abs((this.slideDistance + colorRange) % (2 * colorRange) - colorRange) * blueStep2)
          this.pageBackgroundBelow = `rgba(${r2},${g2},${b2},1)`
          this.wave1 = `rgba(${r2},${g2},${b2},0.3)`
          this.wave2 = `rgba(${r2},${g2},${b2},0.6)`
          let sunDeg = parseInt(this.slideDistance / (2 * colorRange) % 1 * 360)
          this.sunTransformOut = `rotate(${-1 * sunDeg}deg)`
          this.sunTransformIn = `rotate(${sunDeg}deg)`
          let moonDeg = parseInt(this.slideDistance / (2 * colorRange) % 1 * 360)
          this.moonTransformOut = `rotate(${-1 * moonDeg}deg)`
          this.moonTransformIn = `rotate(${moonDeg}deg)`
          this.sunOpacity = this.getOpacity(sunDeg)
          this.moonOpacity = this.getOpacity(moonDeg)
          // this.waveHeight = 30 * (sunDeg / 360) + 60
        }, 500)
      }
      if (val < colorRange * 2) {
        this.dateIndex = 0
      } else if (val >= colorRange * 2 && val < colorRange * 4) {
        this.dateIndex = 1
      } else {
        this.dateIndex = 2
      }
      this.boatTime = this.slideToTime(val)
    }
  },
  mounted () {
    this.initData()
    // this.initMapData()
    this.slideDistance = 0
    this.timeSlideEnd()
  },
  methods: {
    back () {
      window.location.href = 'http://otatest.cleartv.cn/scenic-main'
    },
    setFrom (item) {
      if (this.to !== item) this.from = item
    },
    setTo (item) {
      if (this.from !== item) this.to = item
    },
    preventSlide (e) {
      e.preventDefault()
    },
    initData () {
      // 时间刻度
      let halfDay = [12, 2, 4, 6, 8, 10]
      for (let i = 0; i < 8; i++) {
        halfDay.forEach(num => {
          this.fullTimeList.push({
            key: num + 'of' + i,
            time: num
          })
        })
      }
      // 每格宽度
      this.timeScaleWidth = 100 / 48
      // 最大滑动距离
      this.slideMax = 3 * document.body.clientWidth
      // 前半部分滑动距离
      this.slideMiddle = 0.5 * document.body.clientWidth
      // 后半部分滑动距离
      this.colorRange = 0.5 * document.body.clientWidth
      for (let i = 0; i < 4; i++) {
        this.boatAvailableTime.forEach(item => {
          this.availableTimeList.push({
            time: item,
            pos: this.timeToPosition(item, i)
          })
        })
      }
      for (let i = 0; i < 3; i++) {
        let date = moment().add(i, 'days').format('MM月DD日')
        this.boatDate.push(date)
      }
    },
    // 通过字符串时间计算定位left
    timeToPosition (str, index) {
      let h = parseInt(str.slice(0, str.indexOf(':')))
      let m = parseInt(str.slice(str.indexOf(':') + 1))
      m = m / 60
      let pos = (h + m) * this.timeScaleWidth / 2 + index * 25 + 12.5
      return pos
    },
    slideToTime (distance) {
      let ratio = distance / this.slideMax
      let time = ratio * 72 % 24
      let hour = Math.floor(time)
      let minute = Math.floor((time - hour) * 60)
      return moment(`${hour}:${minute}`, 'HH:mm').format('HH:mm')
    },
    // 通过滑动距离计算定位left
    slideToPosition (distance) {
      let ratio = distance / (this.slideMax / 3 * 4)// 比例
      return (ratio + 0.125) * 100
    },
    // 通过定位反推滑动距离，touchend的时候设置滑动距离用到
    positionToSlide (pos) {
      return (pos - 12.5) * 4 / 3 / 100 * this.slideMax
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
    timeSlideEnd () {
      this.autoAlignTimeout = setTimeout(() => {
        let currentPosition = this.slideToPosition(this.slideDistance)
        let nearest = this.availableTimeList.reduce((pre, cur) => {
          if (Math.abs(cur.pos - currentPosition) < Math.abs(pre.pos - currentPosition)) {
            return cur
          } else {
            return pre
          }
        })
        console.log(nearest)
        let distance = this.positionToSlide(nearest.pos)
        console.log(distance)
        this.moveSlowly = true
        this.slideDistance = distance
        this.boatTime = nearest.text
      }, 700)
    },
    getOpacity (deg) {
      let to0 = Math.abs(deg % 180 - 90) / 90
      if (to0 > 0.5) {
        return 1
      } else {
        return 2 * to0
      }
    },
    checkTourist (n) {
      this.touristTransform += (n - 5) * 100
    },
    confirmBoatTicket () {
      let time = this.slideToTime(this.slideDistance)
      let date = this.boatDate[this.dateIndex]
      let payload = {
        time: time,
        date: date,
        scenic: [this.from, this.to],
        tourist: this.touristTransform / 100 + 5
      }
      this.$store.commit('addToHistory', payload)
      this.$router.push('/history')
    },
    toHistory () {
      this.$router.push('/history')
    }
  }
}
</script>

<style lang="less">
.move-slowly {
  transition: all 0.3s;
}
.background-slowly {
  transition: background-color fill 0.5s;
}
.sun-slowly {
  transition: all 2s;
}
.boat-ticket {
  width: 100%;
  height: 100%;
  .sky-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 45%;
    .time-scale {
      position: relative;
      width: 100%;
      height: 150px;
      .time-scale-list {
        position: relative;
        width: 400%;
        display: flex;
        justify-content: space-around;
        .time-available-item {
          position: absolute;
          top: 16px;
          width: 4px;
          height: 16px;
          margin-left: -1px;
          background-color: #fff;
        }
        .time-scale-list-item {
          margin-top: 32px;
          flex-shrink: 0;
          transform: translateX(-50%);
          span {
            display: inline-block;
            width: 100%;
            height: 20px;
            line-height: 20px;
            font-size: 32px;
            font-weight: 400;
          }
        }
      }
      .time-current-position {
        position: absolute;
        top: 0;
        left: 50%;
        margin-left: -16px;
        border: 16px solid transparent;
        border-top: 16px solid #F4664C;
        width: 0;
        height: 0;
      }
    }
    .time-slider {
      position: relative;
      width: 100%;
      height: calc(~"100% - 150px");
      .sky-picture {
        height: calc(~"100% - 30px");
        position: relative;
        .sky-island {
          position: absolute;
          height: 75%;
          padding: 15% 0 0 15%;
          img {
            margin-top: 10%;
            width: auto;
            height: 100%;
          }
        }
        .sun-moon-container {
          position: relative;
          width: 100%;
          height: 50vw;
          overflow: hidden;
          .sun-container {
            width: 80px;
            height: 80px;
            position: absolute;
            left: calc(~"50vw - 40px");
            bottom: -45vw;
            transform-origin: 40px calc(~"-45vw + 80px");
          }
          .moon-container {
            width: 80px;
            height: 80px;
            position: absolute;
            left: calc(~"50vw - 40px");
            bottom: calc(~"45vw - 80px");
            transform-origin: 40px calc(~"45vw + 40px");
          }
          img {
            width: 80px;
            height: 80px;
          }
        }
      }
      .sky-wave {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
      }
    }
  }
  .scenic-container {
    position: absolute;
    top: 44%;
    bottom: 0;
    left: 0;
    width: 80%;
    padding: 0 10%;
    .current-time {
      height: 50px;
      line-height: 50px;
      font-weight: 300;
    }
    .tourist-count {
      margin: 20px auto;
      width: 500px;
      // height: 50px;
      overflow: hidden;
      display: flex;
      user-select: none;
      backface-visibility: hidden;
      .tourist-img-container {
        display: inline-block;
        width: 100px;
        cursor: pointer;
        user-select: none;
      }
      img {
        width: 100px;
        height: auto;
        user-select: none;
      }
    }
    .picker {
      display: flex;
      justify-content: center;
      align-items: center;
      .picker-section {
        width: 30%;
        .picker-item {
          margin: 10px 0;
          border-radius: 5px;
          height: 60px;
          line-height: 60px;
        }
        .active-item {
          background-color: #0B96D9;
        }
        .disabled-item {
          color: #aaa;
        }
      }
      img {
        width: 100px;
        height: 100px;
        margin: 40px;
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
        width: 50%;
        height: 100px;
        line-height: 100px;
        border-radius: 5px;
        font-size: 36px;
        background-color: #0B96D9;
      }
      .footer-history-btn {
        position: absolute;
        bottom: 25px;
        right: 25px;
        width: 80px;
        height: 80px;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
