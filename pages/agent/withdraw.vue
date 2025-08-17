<!-- 地区代理提现 -->
<template>
  <s-layout title="申请提现" class="withdraw-wrap" navbar="inner">
    <view class="page-bg"></view>
    <view
      class="wallet-num-box ss-flex ss-col-center ss-row-between"
      :style="[
        {
          marginTop: '-' + Number(statusBarHeight + 88) + 'rpx',
          paddingTop: Number(statusBarHeight + 108) + 'rpx',
        },
      ]"
    >
      <view class="">
        <view class="num-title">可提现金额（元）</view>
        <view class="wallet-num">{{ availableAmount }}</view>
      </view>
      <button
        class="ss-reset-button log-btn"
        @tap="sheep.$router.go('/pages/agent/withdraw-records')"
      >
        提现记录
      </button>
    </view>
    <!-- 提现输入卡片-->
    <view class="draw-card">
      <!-- 提现方式 -->
      <view class="bank-box ss-flex ss-col-center ss-row-between ss-m-b-30">
        <view class="name">提现至</view>
        <view class="bank-list ss-flex ss-col-center">
          <view class="empty-text">微信零钱</view>
        </view>
      </view>
      <!-- 提现金额 -->
      <view class="card-title">提现金额</view>
      <view class="input-box ss-flex ss-col-center border-bottom">
        <view class="unit">￥</view>
        <uni-easyinput
          :inputBorder="false"
          class="ss-flex-1 ss-p-l-10"
          v-model="state.price"
          type="number"
          placeholder="请输入提现金额"
        />
      </view>
      <!-- 收款人姓名 -->
      <view class="card-title">收款人姓名</view>
      <view class="input-box ss-flex ss-col-center border-bottom">
        <view class="unit" />
        <uni-easyinput
          :inputBorder="false"
          class="ss-flex-1 ss-p-l-10"
          v-model="state.realName"
          placeholder="请输入收款人真实姓名"
        />
      </view>
      <button class="ss-reset-button save-btn ui-BG-Main-Gradient ui-Shadow-Main" @tap="onConfirm">
        确认提现
      </button>
    </view>

    <!-- 提现说明 -->
    <view class="draw-notice">
      <view class="title ss-m-b-30">提现说明</view>
      <view class="draw-list"> 最低提现金额 {{ fen2yuan(minAmount * 1000) }} 元 </view>
      <view class="draw-list">提现申请提交后，我们将在1-3个工作日内处理</view>
      <view class="draw-list">请确保收款信息准确无误，避免提现失败</view>
      <view class="draw-list">如有疑问，请联系客服</view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
  import { fen2yuan } from '@/sheep/hooks/useGoods';
  import { getWeixinPayChannelCode, goBindWeixin } from '@/sheep/platform/pay';
  import SLayout from '@/sheep/components/s-layout/s-layout.vue';

  const headerBg = sheep.$url.css('/static/img/shop/user/withdraw_bg.png');
  const statusBarHeight = sheep.$platform.device.statusBarHeight * 2;

  const state = reactive({
    price: '',
    realName: '',
    agentInfo: null,
  });

  // 最低提现金额
  const minAmount = 10;

  // 计算属性
  const availableAmount = computed(() => {
	  console.log("1123",state.agentInfo)
    return state.agentInfo?.brokeragePrice || 0;
  });

  // 提交提现
  const onConfirm = async () => {
    // 参数校验
    if (
      !state.price ||
      state.price > availableAmount.value ||
      state.price <= 0
    ) {
      sheep.$helper.toast('请输入正确的提现金额');
      return;
    }
    
    if (state.price < minAmount) {
      sheep.$helper.toast(`最低提现金额为¥${minAmount}`);
      return;
    }
    
    if (!state.realName.trim()) {
      sheep.$helper.toast('请输入收款人真实姓名');
      return;
    }
    
    // 获取微信openid
    let openid;
    try {
      openid = await sheep.$platform.useProvider('wechat').getOpenid();
      // 如果获取不到 openid，微信无法发起支付，此时需要引导
      if (!openid) {
        goBindWeixin();
        return;
      }
    } catch (error) {
      sheep.$helper.toast('获取微信授权失败，请重试');
      return;
    }

    // 提交请求
    const data = {
      price: state.price * 100, // 转换为分
      type: 5, // 微信零钱
      name: state.realName.trim(),
      accountNo: openid,
      transferChannelCode: getWeixinPayChannelCode(),
    };
    
    try {
      uni.showLoading({ title: '提交中...' });
      let { code } = await RegionalAgentApi.createRegionalAgentWithdraw(data);
      uni.hideLoading();
      
      if (code !== 0) {
        return;
      }
      
      // 提示
      uni.showModal({
        title: '操作成功',
        content: '您的提现申请已成功提交',
        cancelText: '继续提现',
        confirmText: '查看记录',
        success: (res) => {
          if (res.confirm) {
            sheep.$router.go('/pages/agent/withdraw-records');
            return;
          }
          getAgentInfo();
          state.price = '';
          state.realName = '';
        },
      });
    } catch (error) {
      uni.hideLoading();
      console.error('提交提现申请失败:', error);
      sheep.$helper.toast('网络错误，请重试');
    }
  };

  // 获得代理信息
  const getAgentInfo = async () => {
    try {
      const { code, data } = await RegionalAgentApi.getCurrentUserRegionalAgent();
      if (code === 0 && data) {
        state.agentInfo = data[0];
      }
    } catch (error) {
      console.error('获取代理信息失败:', error);
    }
  };

  onMounted(() => {
    getAgentInfo();
  });
</script>

<style lang="scss" scoped>
  :deep() {
    .uni-input-input {
      font-family: OPPOSANS !important;
    }
  }

  .wallet-num-box {
    padding: 0 40rpx 80rpx;
    background: var(--ui-BG-Main) v-bind(headerBg) center/750rpx 100% no-repeat;
    border-radius: 0 0 5% 5%;

    .num-title {
      font-size: 26rpx;
      font-weight: 500;
      color: $white;
      margin-bottom: 20rpx;
    }

    .wallet-num {
      font-size: 60rpx;
      font-weight: 500;
      color: $white;
      font-family: OPPOSANS;
    }

    .log-btn {
      width: 170rpx;
      height: 60rpx;
      line-height: 60rpx;
      border: 1rpx solid $white;
      border-radius: 30rpx;
      padding: 0;
      font-size: 26rpx;
      font-weight: 500;
      color: $white;
    }
  }

  // 提现输入卡片
  .draw-card {
    background-color: $white;
    border-radius: 20rpx;
    width: 690rpx;
    min-height: 560rpx;
    margin: -60rpx 30rpx 30rpx 30rpx;
    padding: 30rpx;
    position: relative;
    z-index: 3;
    box-sizing: border-box;

    .card-title {
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 30rpx;
    }

    .bank-box {
      .name {
        font-size: 28rpx;
        font-weight: 500;
      }

      .bank-list {
        .empty-text {
          font-size: 28rpx;
          font-weight: 400;
          color: #333;
        }
      }
    }

    .input-box {
      width: 624rpx;
      height: 100rpx;
      margin-bottom: 40rpx;

      .unit {
        font-size: 48rpx;
        color: #333;
        font-weight: 500;
      }

      .uni-easyinput__placeholder-class {
        font-size: 30rpx;
        height: 36rpx;
      }

      :deep(.uni-easyinput__content-input) {
        font-size: 48rpx;
      }
    }

    .save-btn {
      width: 616rpx;
      height: 86rpx;
      line-height: 86rpx;
      border-radius: 40rpx;
      margin-top: 80rpx;
    }
  }

  // 提现说明
  .draw-notice {
    width: 684rpx;
    background: #ffffff;
    border: 2rpx solid #fffaee;
    border-radius: 20rpx;
    margin: 20rpx 32rpx 0 32rpx;
    padding: 30rpx;
    box-sizing: border-box;

    .title {
      font-weight: 500;
      color: #333333;
      font-size: 30rpx;
    }

    .draw-list {
      font-size: 24rpx;
      color: #999999;
      line-height: 46rpx;
    }
  }
</style>