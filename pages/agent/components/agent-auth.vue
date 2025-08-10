<!-- 代理权限弹窗：在没有权限时，进行提示  -->
<template>
  <su-popup
    :show="state.show"
    type="center"
    round="10"
    @close="state.show = false"
    :isMaskClick="false"
    maskBackgroundColor="rgba(0, 0, 0, 0.7)"
  >
    <view class="notice-box">
      <view class="img-wrap">
        <image
          class="notice-img"
          :src="sheep.$url.static('/static/img/shop/commission/forbidden.png')"
          mode="aspectFill"
        />
      </view>
      <view class="notice-title"> 您还不是代理商 </view>
      <view class="notice-detail"> 申请成为代理商，享受更多权益 </view>
      <button
        class="ss-reset-button notice-btn ui-Shadow-Main ui-BG-Main-Gradient"
        @tap="goToApply"
      >
        立即申请
      </button>
      <button class="ss-reset-button back-btn" @tap="sheep.$router.back()"> 返回 </button>
    </view>
  </su-popup>
</template>

<script setup>
  import { onShow } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import { reactive } from 'vue';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';

  const state = reactive({
    show: false,
  });

  // 跳转到申请页面
  const goToApply = () => {
    state.show = false;
    sheep.$router.go('/pages/agent/apply');
  };

  onShow(async () => {
    // 读取是否有代理权限
    const { code, data } = await RegionalAgentApi.getRegionalAgent();
    if (code === 0 && !data?.agentEnabled) {
      // 如果用户不是代理，显示提示弹窗
      // state.show = true; // 暂时注释，避免每次进入都弹窗
    }
  });
</script>

<style lang="scss" scoped>
  .notice-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 580rpx;
    padding: 60rpx 40rpx 40rpx;
    background: #ffffff;
    border-radius: 20rpx;

    .img-wrap {
      margin-bottom: 40rpx;

      .notice-img {
        width: 160rpx;
        height: 160rpx;
      }
    }

    .notice-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .notice-detail {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 60rpx;
      text-align: center;
      line-height: 40rpx;
    }

    .notice-btn {
      width: 400rpx;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .back-btn {
      width: 200rpx;
      height: 60rpx;
      border-radius: 30rpx;
      font-size: 28rpx;
      color: #999999;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>