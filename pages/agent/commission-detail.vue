<!-- 佣金记录详情页面 -->
<template>
  <s-layout title="佣金详情" navbar="inner">
    <view class="detail-wrap" v-if="state.detail">
      <!-- 金额信息 -->
      <view class="amount-card">
        <view class="amount-info">
          <text class="amount-label">佣金金额</text>
          <text class="amount-value" :class="getAmountClass(state.detail.price)">
            {{ state.detail.price > 0 ? '+' : '' }}{{ formatPrice(state.detail.price) }}
          </text>
        </view>
        <view class="status-info">
          <text class="status-text" :class="getStatusClass(state.detail.status)">
            {{ getStatusText(state.detail.status) }}
          </text>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="info-card">
        <view class="card-header">
          <text class="header-title">详细信息</text>
        </view>
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">业务类型</text>
            <text class="info-value">{{ getBizTypeText(state.detail.bizType) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ state.detail.bizId || '-' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">佣金说明</text>
            <text class="info-value">{{ state.detail.description || '佣金收入' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">
              {{ sheep.$helper.timeFormat(state.detail.createTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
          <view class="info-item" v-if="state.detail.settleTime">
            <text class="info-label">结算时间</text>
            <text class="info-value">
              {{ sheep.$helper.timeFormat(state.detail.settleTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
        </view>
      </view>

      <!-- 相关订单信息 -->
      <view class="order-card" v-if="state.detail.orderInfo">
        <view class="card-header">
          <text class="header-title">相关订单</text>
        </view>
        <view class="card-content">
          <view class="order-item">
            <view class="order-header">
              <text class="order-no">{{ state.detail.orderInfo.no }}</text>
              <text class="order-amount">{{ formatPrice(state.detail.orderInfo.payPrice) }}</text>
            </view>
            <view class="order-info">
              <text class="order-user">买家：{{ state.detail.orderInfo.userNickname }}</text>
              <text class="order-time">
                {{ sheep.$helper.timeFormat(state.detail.orderInfo.createTime, 'yyyy-mm-dd hh:MM:ss') }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-wrap" v-if="state.loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-wrap" v-if="!state.detail && !state.loading">
      <image class="empty-img" src="/static/data-empty.png" mode="aspectFit"></image>
      <text class="empty-text">记录不存在</text>
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';

  const state = reactive({
    detail: null,
    loading: false,
  });

  // 类型选项
  const typeOptions = [
    { label: '订单佣金', value: 1 },
    { label: '推广佣金', value: 2 },
    { label: '其他收入', value: 3 },
  ];

  // 状态选项
  const statusOptions = [
    { label: '待结算', value: 0 },
    { label: '已结算', value: 1 },
    { label: '已取消', value: 2 },
  ];

  // 方法
  const formatPrice = (price) => {
    return sheep.$helper.priceFormat(price);
  };

  const getBizTypeText = (bizType) => {
    const option = typeOptions.find(item => item.value === bizType);
    return option ? option.label : '未知类型';
  };

  const getStatusText = (status) => {
    const option = statusOptions.find(item => item.value === status);
    return option ? option.label : '未知状态';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-success';
      case 2: return 'status-cancel';
      default: return '';
    }
  };

  const getAmountClass = (amount) => {
    return amount > 0 ? 'amount-positive' : 'amount-negative';
  };

  const getCommissionDetail = async (id) => {
    try {
      state.loading = true;
      
      const { code, data } = await RegionalAgentApi.getCommissionRecord(id);
      
      if (code === 0 && data) {
        state.detail = data;
      } else {
        uni.showToast({
          title: '记录不存在',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取佣金详情失败:', error);
      uni.showToast({
        title: '获取详情失败',
        icon: 'none',
      });
    } finally {
      state.loading = false;
    }
  };

  onMounted(() => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const id = currentPage.options.id;
    
    if (id) {
      getCommissionDetail(id);
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none',
      });
      setTimeout(() => {
        sheep.$router.back();
      }, 1500);
    }
  });
</script>

<style lang="scss" scoped>
  .detail-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .amount-card {
    background: linear-gradient(135deg, #ff6000 0%, #fe832a 100%);
    border-radius: 12rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    text-align: center;

    .amount-info {
      margin-bottom: 20rpx;

      .amount-label {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10rpx;
      }

      .amount-value {
        font-size: 48rpx;
        font-weight: bold;
        color: #ffffff;

        &.amount-positive {
          color: #ffffff;
        }

        &.amount-negative {
          color: #ffccc7;
        }
      }
    }

    .status-info {
      .status-text {
        display: inline-block;
        font-size: 24rpx;
        padding: 8rpx 20rpx;
        border-radius: 20rpx;
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;

        &.status-pending {
          background: rgba(250, 140, 22, 0.2);
        }

        &.status-success {
          background: rgba(82, 196, 26, 0.2);
        }

        &.status-cancel {
          background: rgba(255, 77, 79, 0.2);
        }
      }
    }
  }

  .info-card,
  .order-card {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .card-header {
      padding: 30rpx;
      background: #f8f9fa;
      border-bottom: 1rpx solid #f0f0f0;

      .header-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
      }
    }

    .card-content {
      padding: 30rpx;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 28rpx;
      color: #666666;
      width: 160rpx;
      flex-shrink: 0;
    }

    .info-value {
      font-size: 28rpx;
      color: #333333;
      flex: 1;
      text-align: right;
      word-break: break-all;
    }
  }

  .order-item {
    .order-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .order-no {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
      }

      .order-amount {
        font-size: 28rpx;
        font-weight: bold;
        color: #ff6000;
      }
    }

    .order-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .order-user {
        font-size: 24rpx;
        color: #666666;
      }

      .order-time {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }

  .loading-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    .loading-text {
      font-size: 28rpx;
      color: #999999;
    }
  }

  .empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;

    .empty-img {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999999;
    }
  }
</style>