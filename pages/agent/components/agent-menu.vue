<!-- 代理：菜单栏 -->
<template>
  <view class="menu-box ss-flex-col">
    <view class="header-box">
      <image class="header-bg" :src="sheep.$url.static('/static/img/shop/commission/title1.png')" />
      <view class="ss-flex header-title">
        <view class="title">功能专区</view>
        <text class="cicon-forward"></text>
      </view>
    </view>
    <view class="menu-list ss-flex ss-flex-wrap">
      <view
        v-for="(item, index) in state.menuList"
        :key="index"
        class="item-box ss-flex-col ss-col-center"
        @tap="handleMenuClick(item)"
      >
        <image
          class="menu-icon ss-m-b-10"
          :src="sheep.$url.static(item.img)"
          mode="aspectFill"
        ></image>
        <view>{{ item.title }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import sheep from '@/sheep';
  import { reactive, onMounted } from 'vue';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';

  const state = reactive({
    agentInfo: null,
    menuList: [
      {
        img: '/static/img/shop/commission/commission_icon2.png',
        title: '代理申请',
        path: '/pages/agent/apply',
        requireAgent: false,
      },
      {
        img: '/static/img/shop/commission/commission_icon1.png',
        title: '佣金记录',
        path: '/pages/agent/commission',
        requireAgent: true,
      },
      {
        img: '/static/img/shop/commission/commission_icon3.png',
        title: '申请提现',
        path: '/pages/agent/withdraw',
        requireAgent: true,
      },
      {
        img: '/static/img/shop/commission/commission_icon4.png',
        title: '提现记录',
        path: '/pages/agent/withdraw-records',
        requireAgent: true,
      },
    ],
  });

  // 处理菜单点击
  const handleMenuClick = (item) => {
    // 如果需要代理权限但用户不是代理，则提示
    if (item.requireAgent && state.agentInfo?.status !== 1) {
      uni.showToast({
        title: '您还不是代理，无法使用此功能',
        icon: 'none',
      });
      return;
    }
    
    // 如果是申请代理，需要检查用户是否已经是代理
    if (item.path === '/pages/agent/apply' && state.agentInfo?.status === 1) {
      uni.showToast({
        title: '您已经是代理了',
        icon: 'none',
      });
      return;
    }
    
    sheep.$router.go(item.path);
  };

  onMounted(async () => {
    // 获取代理信息
    try {
      const { code, data } = await RegionalAgentApi.getMyAgent();
      if (code === 0) {
        state.agentInfo = data;
      }
    } catch (error) {
      console.error('获取代理信息失败:', error);
    }
  });
</script>

<style lang="scss" scoped>
  .menu-box {
    margin: 20rpx 28rpx 0;
    background: #ffffff;
    border-radius: 12rpx;
    overflow: hidden;

    .header-box {
      position: relative;
      height: 80rpx;
      background: linear-gradient(90deg, #ff6000 0%, #fe832a 100%);

      .header-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      .header-title {
        position: relative;
        z-index: 2;
        height: 100%;
        padding: 0 30rpx;
        align-items: center;
        justify-content: space-between;

        .title {
          font-size: 30rpx;
          font-weight: bold;
          color: #ffffff;
        }

        .cicon-forward {
          font-size: 32rpx;
          color: #ffffff;
        }
      }
    }

    .menu-list {
      padding: 40rpx 30rpx;

      .item-box {
        width: 25%;
        margin-bottom: 40rpx;
        cursor: pointer;

        .menu-icon {
          width: 80rpx;
          height: 80rpx;
        }

        view {
          font-size: 24rpx;
          color: #333333;
          text-align: center;
        }
      }
    }
  }
</style>