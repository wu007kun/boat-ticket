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
        <svg class="sky-wave" :style="{height: waveHeight + 'px'}" :class="{'sun-slowly': moveSlowly}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g :class="{'background-slowly': moveSlowly}" :style="{fill: wave1}">
            <path d="M 0 25 Q 75 15, 150 25 T 300 25 T 450 25 T 600 25 T 750 25 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-300" dur="1.5s" repeatCount="indefinite"></animateTransform>
          </g>
          <g :class="{'background-slowly': moveSlowly}" :style="{fill: wave2}">
            <path d="M 0 25 Q 87.5 10, 175 25 T 350 25 T 525 25 T 700 25 T 875 25 T 1050 25 V 100 H 0 V 0"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-350" dur="3s" repeatCount="indefinite"></animateTransform>
          </g>
          <g :class="{'background-slowly': moveSlowly}" :style="{fill: pageBackgroundBelow}" transform="translate(-903.868 0)">
            <path d="M 0 25 Q 135 12, 270 25 T 540 25 T 810 25 T 1080 25 V 100 H 0 V 0" transform="translate(-38.232284367796474, 0)"></path>
            <animateTransform attributeName="transform" attributeType="XML" type="translate" from="0" to="-540" dur="2s" repeatCount="indefinite"></animateTransform>
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
      <!-- <span class="time-date-slider"
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
      </span> -->
      <div class="tourist-count">
        <div class="tourist-img-container"
          v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="n"
          :style="{transform: `translateX(${touristTransform}%)`}"
          @click="checkTourist(n)">
          <img :src="n < 6 ? boatImg.tourist1 : boatImg.tourist0" alt="">
        </div>
      </div>
      <mt-picker :slots="scenicPickerSlots" :visibleItemCount="3" @change="scenicPickerChange"></mt-picker>
      <div class="boat-footer" @touchmove="preventSlide($event)">
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
      waveHeight: 70,
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
          this.waveHeight = 30 * (sunDeg / 360) + 60
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
    scenicPickerChange (picker, values) {
      this.scenicPickerValue = values
    },
    confirmBoatTicket () {
      if (this.scenicPickerValue[0] === this.scenicPickerValue[1]) return
      let time = this.slideToTime(this.slideDistance)
      let date = this.boatDate[this.dateIndex]
      let payload = {
        time: time,
        date: date,
        scenic: this.scenicPickerValue,
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
      height: 50px;
      .time-scale-list {
        position: relative;
        width: 400%;
        display: flex;
        justify-content: space-around;
        // .time-available-list {
        //   position: relative;
        //   width: 100%;
        // }
        .time-available-item {
          position: absolute;
          top: 6px;
          width: 2px;
          height: 6px;
          margin-left: -1px;
          background-color: #fff;
        }
        .time-scale-list-item {
          margin-top: 10px;
          flex-shrink: 0;
          transform: translateX(-50%);
          span {
            display: inline-block;
            width: 100%;
            height: 20px;
            line-height: 20px;
            font-size: 12px;
            font-weight: 400;
          }
        }
      }
      .time-current-position {
        position: absolute;
        top: 0;
        left: 50%;
        margin-left: -6px;
        border: 6px solid transparent;
        border-top: 6px solid #F4664C;
        width: 0;
        height: 0;
      }
    }
    .time-slider {
      position: relative;
      width: 100%;
      height: calc(~"100% - 50px");
      .sky-picture {
        height: calc(~"100% - 30px");
        position: relative;
        .sky-island {
          position: absolute;
          height: 75%;
          padding: 15% 0 0 15%;
          img {
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
            width: 32px;
            height: 32px;
            position: absolute;
            left: calc(~"50vw - 16px");
            bottom: -45vw;
            transform-origin: 16px calc(~"-45vw + 32px");
          }
          .moon-container {
            width: 32px;
            height: 32px;
            position: absolute;
            left: calc(~"50vw - 16px");
            bottom: calc(~"45vw - 32px");
            transform-origin: 16px calc(~"45vw + 16px");
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
      height: 22px;
      line-height: 22px;
      font-size: 18px;
      font-weight: 300;
    }
    .tourist-count {
      margin: 20px auto;
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
