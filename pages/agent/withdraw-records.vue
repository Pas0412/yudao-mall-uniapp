<!-- 提现记录页面 -->
<template>
  <s-layout title="提现记录" navbar="inner">
    <view class="records-wrap">
      <!-- 筛选条件 -->
      <view class="filter-card">
        <view class="filter-item" @tap="showStatusPicker">
          <text class="filter-label">状态</text>
          <text class="filter-value">{{ statusText }}</text>
          <text class="cicon-right"></text>
        </view>
        <view class="filter-item" @tap="showTypePicker">
          <text class="filter-label">方式</text>
          <text class="filter-value">{{ typeText }}</text>
          <text class="cicon-right"></text>
        </view>
      </view>

      <!-- 提现记录列表 -->
      <view class="record-list">
        <view 
          class="record-item" 
          v-for="item in state.list" 
          :key="item.id"
          @tap="goToDetail(item.id)"
        >
          <view class="record-header">
            <view class="record-info">
              <text class="record-title">{{ getTypeText(item.type) }}提现</text>
              <text class="record-account">{{ formatAccount(item.accountNo) }}</text>
            </view>
            <view class="record-amount-wrap">
              <text class="record-amount">-{{ formatPrice(item.price) }}</text>
              <text class="record-status" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>
          <view class="record-detail">
            <text class="record-name">收款人：{{ item.name }}</text>
            <text class="record-time">
              {{ sheep.$helper.timeFormat(item.createTime, 'yyyy-mm-dd hh:MM:ss') }}
            </text>
          </view>
          <view class="record-remark" v-if="item.auditReason">
            <text class="remark-label">审核原因：</text>
            <text class="remark-text">{{ item.auditReason }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="state.list.length === 0 && !state.loading">
        <image class="empty-img" src="/static/data-empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无提现记录</text>
      </view>
    </view>

    <!-- 状态选择器 -->
    <su-popup :show="state.showStatusPicker" @close="state.showStatusPicker = false">
      <view class="picker-wrap">
        <view class="picker-header">
          <text class="picker-title">选择状态</text>
          <text class="picker-close" @tap="state.showStatusPicker = false">×</text>
        </view>
        <view class="picker-list">
          <view 
            class="picker-item" 
            v-for="item in statusOptions" 
            :key="item.value"
            @tap="selectStatus(item)"
          >
            <text class="picker-text">{{ item.label }}</text>
            <text class="cicon-check" v-if="state.status === item.value"></text>
          </view>
        </view>
      </view>
    </su-popup>

    <!-- 类型选择器 -->
    <su-popup :show="state.showTypePicker" @close="state.showTypePicker = false">
      <view class="picker-wrap">
        <view class="picker-header">
          <text class="picker-title">选择方式</text>
          <text class="picker-close" @tap="state.showTypePicker = false">×</text>
        </view>
        <view class="picker-list">
          <view 
            class="picker-item" 
            v-for="item in typeOptions" 
            :key="item.value"
            @tap="selectType(item)"
          >
            <text class="picker-text">{{ item.label }}</text>
            <text class="cicon-check" v-if="state.type === item.value"></text>
          </view>
        </view>
      </view>
    </su-popup>

    <!-- 悬浮按钮 -->
    <view class="fab-wrap">
      <view class="fab-btn" @tap="goToWithdraw">
        <text class="fab-icon">+</text>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';

  const state = reactive({
    list: [],
    loading: false,
    finished: false,
    pageNo: 1,
    pageSize: 20,
    status: '',
    type: '',
    showStatusPicker: false,
    showTypePicker: false,
  });

  // 状态选项
  const statusOptions = [
    { label: '全部', value: '' },
    { label: '审核中', value: 0 },
    { label: '审核通过', value: 1 },
    { label: '审核拒绝', value: 2 },
    { label: '提现成功', value: 3 },
    { label: '提现失败', value: 4 },
  ];

  // 类型选项
  const typeOptions = [
    { label: '全部', value: '' },
    { label: '银行卡', value: 1 },
    { label: '微信', value: 2 },
    { label: '支付宝', value: 3 },
  ];

  // 计算属性
  const statusText = computed(() => {
    const option = statusOptions.find(item => item.value === state.status);
    return option ? option.label : '全部';
  });

  const typeText = computed(() => {
    const option = typeOptions.find(item => item.value === state.type);
    return option ? option.label : '全部';
  });

  // 方法
  const formatPrice = (price) => {
    return sheep.$helper.priceFormat(price);
  };

  const getTypeText = (type) => {
    const option = typeOptions.find(item => item.value === type);
    return option ? option.label : '未知';
  };

  const getStatusText = (status) => {
    const option = statusOptions.find(item => item.value === status);
    return option ? option.label : '未知状态';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0: return 'status-pending';
      case 1: return 'status-approved';
      case 2: return 'status-rejected';
      case 3: return 'status-success';
      case 4: return 'status-failed';
      default: return '';
    }
  };

  const formatAccount = (accountNo) => {
    if (!accountNo) return '';
    if (accountNo.length <= 4) return accountNo;
    return accountNo.substring(0, 4) + '****' + accountNo.substring(accountNo.length - 4);
  };

  const showStatusPicker = () => {
    state.showStatusPicker = true;
  };

  const showTypePicker = () => {
    state.showTypePicker = true;
  };

  const selectStatus = (item) => {
    state.status = item.value;
    state.showStatusPicker = false;
    resetList();
  };

  const selectType = (item) => {
    state.type = item.value;
    state.showTypePicker = false;
    resetList();
  };

  const resetList = () => {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
    getWithdrawRecords();
  };

  const getWithdrawRecords = async () => {
    if (state.loading || state.finished) return;

    try {
      state.loading = true;
      
      const params = {
        pageNo: state.pageNo,
        pageSize: state.pageSize,
      };
      
      if (state.status !== '') {
        params.status = state.status;
      }
      
      if (state.type !== '') {
        params.type = state.type;
      }

      const { code, data } = await RegionalAgentApi.getWithdrawRecords(params);
      
      if (code === 0 && data) {
        const newList = data.list || [];
        
        if (state.pageNo === 1) {
          state.list = newList;
        } else {
          state.list.push(...newList);
        }
        
        state.finished = newList.length < state.pageSize;
        state.pageNo++;
      }
    } catch (error) {
      console.error('获取提现记录失败:', error);
      uni.showToast({
        title: '获取数据失败',
        icon: 'none',
      });
    } finally {
      state.loading = false;
    }
  };

  const goToDetail = (id) => {
    sheep.$router.go('/pages/agent/withdraw-detail', { id });
  };

  const goToWithdraw = () => {
    sheep.$router.go('/pages/agent/withdraw');
  };

  onMounted(() => {
    getWithdrawRecords();
  });
</script>

<style lang="scss" scoped>
  .records-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx; // 为悬浮按钮留出空间
  }

  .filter-card {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .filter-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .filter-label {
        font-size: 28rpx;
        color: #333333;
      }

      .filter-value {
        font-size: 28rpx;
        color: #666666;
      }

      .cicon-right {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }

  .record-list {
    .record-item {
      background: #ffffff;
      border-radius: 12rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;

      .record-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .record-info {
          flex: 1;

          .record-title {
            display: block;
            font-size: 32rpx;
            font-weight: bold;
            color: #333333;
            margin-bottom: 8rpx;
          }

          .record-account {
            font-size: 24rpx;
            color: #666666;
          }
        }

        .record-amount-wrap {
          text-align: right;

          .record-amount {
            display: block;
            font-size: 32rpx;
            font-weight: bold;
            color: #ff4d4f;
            margin-bottom: 8rpx;
          }

          .record-status {
            font-size: 24rpx;
            padding: 4rpx 12rpx;
            border-radius: 12rpx;

            &.status-pending {
              background: #fff7e6;
              color: #fa8c16;
            }

            &.status-approved {
              background: #e6f7ff;
              color: #1890ff;
            }

            &.status-rejected {
              background: #fff2f0;
              color: #ff4d4f;
            }

            &.status-success {
              background: #f6ffed;
              color: #52c41a;
            }

            &.status-failed {
              background: #fff2f0;
              color: #ff4d4f;
            }
          }
        }
      }

      .record-detail {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10rpx;

        .record-name {
          font-size: 24rpx;
          color: #666666;
        }

        .record-time {
          font-size: 24rpx;
          color: #999999;
        }
      }

      .record-remark {
        padding: 16rpx;
        background: #f8f9fa;
        border-radius: 8rpx;
        border-left: 4rpx solid #ff6000;

        .remark-label {
          font-size: 24rpx;
          color: #666666;
        }

        .remark-text {
          font-size: 24rpx;
          color: #333333;
        }
      }
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

  .picker-wrap {
    background: #ffffff;
    border-radius: 20rpx 20rpx 0 0;
    max-height: 60vh;

    .picker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      border-bottom: 1rpx solid #f0f0f0;

      .picker-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
      }

      .picker-close {
        font-size: 40rpx;
        color: #999999;
      }
    }

    .picker-list {
      max-height: 400rpx;
      overflow-y: auto;

      .picker-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30rpx;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .picker-text {
          font-size: 28rpx;
          color: #333333;
        }

        .cicon-check {
          font-size: 24rpx;
          color: #ff6000;
        }
      }
    }
  }

  .fab-wrap {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    z-index: 999;

    .fab-btn {
      width: 100rpx;
      height: 100rpx;
      background: linear-gradient(135deg, #ff6000 0%, #fe832a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 20rpx rgba(255, 96, 0, 0.3);

      .fab-icon {
        font-size: 48rpx;
        color: #ffffff;
        font-weight: bold;
      }
    }
  }
</style>