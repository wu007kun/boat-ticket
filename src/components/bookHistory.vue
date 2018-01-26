<template>
  <div class="book-history">
    <div class="history-title">
      <p>我的订单</p>
      <img :src="boatImg.clock" alt="">
    </div>
    <div class="history-list">
      <!-- <div class="history-list-divider"></div> -->
      <div class="history-list-container">
        <div class="history-list-item" v-for="item in historyList" :key="item.id">
          <p><span>{{item.time}}&emsp;{{item.date}}</span><span>{{item.tourist}}人</span></p>
          <p>{{item.scenic[0]}}&emsp;-&emsp;{{item.scenic[1]}}</p>
        </div>
      </div>
      <div class="history-list-divider"></div>
    </div>
    <div class="history-list-divider"></div>
    <div class="history-footer">
      <div class="footer-btn" @click="toBuyTicket"><img :src="boatImg.boat" alt=""></div>
    </div>
  </div>
</template>
<script>
import boatImg from '@/assets/js/boatImg'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      boatImg: boatImg
    }
  },
  computed: {
    ...mapState(['historyList'])
  },
  methods: {
    toBuyTicket () {
      this.$router.push('/ticket')
    }
  }
}
</script>

<style lang="less">
  .book-history {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(24, 142, 221, 1), rgba(3, 169, 239, 1));
    .history-title {
      position: absolute;
      top: 10%;
      padding: 0 8%;
      box-sizing: border-box;
      width: 100%;
      height: 10%;
      line-height: 10vh;
      font-size: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      img {
        width: 36px;
        height: 36px;
      }
    }
    .history-list {
      position: absolute;
      top: 25%;
      bottom: 15%;
      padding: 0 8%;
      box-sizing: border-box;
      width: 100%;
      .history-list-divider {
        height: 10px;
        border-bottom: 1px solid rgba(24, 142, 221, 1);
      }
      .history-list-container {
        height: calc(~"100% - 22px");
        overflow-y: scroll;
        &::-webkit-scrollbar {
          display: none;
        }
        .history-list-item {
          height: 12vh;
          font-size: 20px;
          p {
            text-align: left;
            display: flex;
            justify-content: space-between;
          }
        }
      }
    }
    .history-footer {
      .footer-btn {
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
  }
</style>
