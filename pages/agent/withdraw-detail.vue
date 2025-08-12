<!-- 提现详情页面 -->
<template>
  <s-layout title="提现详情" navbar="inner">
    <view class="detail-wrap" v-if="state.detail">
      <!-- 状态信息 -->
      <view class="status-card">
        <view class="status-icon-wrap">
          <text class="status-icon" :class="getStatusIconClass(state.detail.status)">
            {{ getStatusIcon(state.detail.status) }}
          </text>
        </view>
        <view class="status-info">
          <text class="status-text">{{ getStatusText(state.detail.status) }}</text>
          <text class="amount-text">{{ formatPrice(state.detail.price) }}</text>
        </view>
      </view>

      <!-- 提现信息 -->
      <view class="info-card">
        <view class="card-header">
          <text class="header-title">提现信息</text>
        </view>
        <view class="card-content">
          <view class="info-item">
            <text class="info-label">提现方式</text>
            <text class="info-value">{{ getTypeText(state.detail.type) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">提现金额</text>
            <text class="info-value">{{ formatPrice(state.detail.price) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">收款人</text>
            <text class="info-value">{{ state.detail.realName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">收款账号</text>
            <text class="info-value">{{ formatAccount(state.detail.accountNo) }}</text>
          </view>
          <view class="info-item" v-if="state.detail.bankName">
            <text class="info-label">收款银行</text>
            <text class="info-value">{{ state.detail.bankName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">申请时间</text>
            <text class="info-value">
              {{ sheep.$helper.timeFormat(state.detail.createTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
          <view class="info-item" v-if="state.detail.auditTime">
            <text class="info-label">审核时间</text>
            <text class="info-value">
              {{ sheep.$helper.timeFormat(state.detail.auditTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
          <view class="info-item" v-if="state.detail.transferTime">
            <text class="info-label">转账时间</text>
            <text class="info-value">
              {{ sheep.$helper.timeFormat(state.detail.transferTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
        </view>
      </view>

      <!-- 收款码 -->
      <view class="qr-card" v-if="state.detail.qrCodeUrl">
        <view class="card-header">
          <text class="header-title">收款码</text>
        </view>
        <view class="card-content">
          <view class="qr-wrap">
            <image 
              class="qr-image" 
              :src="state.detail.qrCodeUrl" 
              mode="aspectFit"
              @tap="previewImage"
            ></image>
          </view>
        </view>
      </view>

      <!-- 审核备注 -->
      <view class="remark-card" v-if="state.detail.auditRemark">
        <view class="card-header">
          <text class="header-title">审核备注</text>
        </view>
        <view class="card-content">
          <text class="remark-text">{{ state.detail.auditRemark }}</text>
        </view>
      </view>

      <!-- 进度信息 -->
      <view class="progress-card">
        <view class="card-header">
          <text class="header-title">处理进度</text>
        </view>
        <view class="card-content">
          <view class="progress-list">
            <view class="progress-item" :class="{ active: true }">
              <view class="progress-dot active"></view>
              <view class="progress-content">
                <text class="progress-title">提交申请</text>
                <text class="progress-time">
                  {{ sheep.$helper.timeFormat(state.detail.createTime, 'yyyy-mm-dd hh:MM:ss') }}
                </text>
              </view>
            </view>
            <view class="progress-item" :class="{ active: state.detail.status >= 1 }">
              <view class="progress-dot" :class="{ active: state.detail.status >= 1 }"></view>
              <view class="progress-content">
                <text class="progress-title">审核处理</text>
                <text class="progress-time" v-if="state.detail.auditTime">
                  {{ sheep.$helper.timeFormat(state.detail.auditTime, 'yyyy-mm-dd hh:MM:ss') }}
                </text>
                <text class="progress-time" v-else>等待审核</text>
              </view>
            </view>
            <view class="progress-item" :class="{ active: state.detail.status === 3 }">
              <view class="progress-dot" :class="{ active: state.detail.status === 3 }"></view>
              <view class="progress-content">
                <text class="progress-title">转账完成</text>
                <text class="progress-time" v-if="state.detail.transferTime">
                  {{ sheep.$helper.timeFormat(state.detail.transferTime, 'yyyy-mm-dd hh:MM:ss') }}
                </text>
                <text class="progress-time" v-else>等待转账</text>
              </view>
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
    { label: '银行卡', value: 1 },
    { label: '微信', value: 2 },
    { label: '支付宝', value: 3 },
  ];

  // 状态选项
  const statusOptions = [
    { label: '审核中', value: 0 },
    { label: '已通过', value: 1 },
    { label: '已拒绝', value: 2 },
    { label: '已完成', value: 3 },
  ];

  // 方法
  const formatPrice = (price) => {
    return sheep.$helper.priceFormat(price);
  };

  const getTypeText = (type) => {
    const option = typeOptions.find(item => item.value === type);
    return option ? option.label : '未知方式';
  };

  const getStatusText = (status) => {
    const option = statusOptions.find(item => item.value === status);
    return option ? option.label : '未知状态';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0: return '⏳';
      case 1: return '✅';
      case 2: return '❌';
      case 3: return '🎉';
      default: return '❓';
    }
  };

  const getStatusIconClass = (status) => {
    switch (status) {
      case 0: return 'icon-pending';
      case 1: return 'icon-approved';
      case 2: return 'icon-rejected';
      case 3: return 'icon-completed';
      default: return '';
    }
  };

  const formatAccount = (accountNo) => {
    if (!accountNo) return '';
    if (accountNo.length <= 8) return accountNo;
    return accountNo.substring(0, 4) + '****' + accountNo.substring(accountNo.length - 4);
  };

  const previewImage = () => {
    uni.previewImage({
      urls: [state.detail.qrCodeUrl],
    });
  };

  const getWithdrawDetail = async (id) => {
    try {
      state.loading = true;
      
      const { code, data } = await RegionalAgentApi.getRegionalAgentWithdraw(id);
      
      if (code === 0 && data) {
        state.detail = data;
      } else {
        uni.showToast({
          title: '记录不存在',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取提现详情失败:', error);
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
      getWithdrawDetail(id);
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

  .status-card {
    background: linear-gradient(135deg, #ff6000 0%, #fe832a 100%);
    border-radius: 12rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;

    .status-icon-wrap {
      margin-right: 30rpx;

      .status-icon {
        font-size: 60rpx;
        
        &.icon-pending {
          filter: grayscale(0.3);
        }
        
        &.icon-approved {
          filter: hue-rotate(120deg);
        }
        
        &.icon-rejected {
          filter: hue-rotate(0deg);
        }
        
        &.icon-completed {
          filter: hue-rotate(60deg);
        }
      }
    }

    .status-info {
      flex: 1;

      .status-text {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10rpx;
      }

      .amount-text {
        font-size: 48rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }
  }

  .info-card,
  .qr-card,
  .remark-card,
  .progress-card {
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

  .qr-wrap {
    display: flex;
    justify-content: center;

    .qr-image {
      width: 300rpx;
      height: 300rpx;
      border-radius: 8rpx;
    }
  }

  .remark-text {
    font-size: 28rpx;
    color: #333333;
    line-height: 40rpx;
  }

  .progress-list {
    .progress-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 40rpx;
      position: relative;

      &:last-child {
        margin-bottom: 0;
        
        &::after {
          display: none;
        }
      }

      &::after {
        content: '';
        position: absolute;
        left: 15rpx;
        top: 40rpx;
        width: 2rpx;
        height: 40rpx;
        background: #e9ecef;
      }

      &.active::after {
        background: #ff6000;
      }

      .progress-dot {
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
        background: #e9ecef;
        margin-right: 20rpx;
        flex-shrink: 0;
        margin-top: 5rpx;

        &.active {
          background: #ff6000;
        }
      }

      .progress-content {
        flex: 1;

        .progress-title {
          display: block;
          font-size: 28rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }

        .progress-time {
          font-size: 24rpx;
          color: #999999;
        }
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