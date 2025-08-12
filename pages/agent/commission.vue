<!-- 佣金记录页面 -->
<template>
  <s-layout title="佣金记录" navbar="inner">
    <view class="commission-wrap">
      <!-- 统计信息 -->
      <view class="stats-card">
        <view class="stats-item">
          <text class="stats-value">{{ formatPrice(totalCommission) }}</text>
          <text class="stats-label">累计佣金</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ formatPrice(availableCommission) }}</text>
          <text class="stats-label">可提现佣金</text>
        </view>
      </view>

      <!-- 筛选条件 -->
      <view class="filter-card">
        <view class="filter-item" @tap="showStatusPicker">
          <text class="filter-label">状态</text>
          <text class="filter-value">{{ statusText }}</text>
          <text class="cicon-right"></text>
        </view>
        <view class="filter-item" @tap="showTypePicker">
          <text class="filter-label">类型</text>
          <text class="filter-value">{{ typeText }}</text>
          <text class="cicon-right"></text>
        </view>
      </view>

      <!-- 佣金记录列表 -->
      <view class="record-list">
        <view 
          class="record-item" 
          v-for="item in state.list" 
          :key="item.id"
          @tap="goToDetail(item.id)"
        >
          <view class="record-header">
            <text class="record-title">{{ getBizTypeText(item.bizType) }}</text>
            <text class="record-amount" :class="getAmountClass(item.price)">
              {{ item.price > 0 ? '+' : '' }}{{ formatPrice(item.price) }}
            </text>
          </view>
          <view class="record-info">
            <text class="record-desc">{{ item.description || '佣金收入' }}</text>
            <text class="record-status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </text>
          </view>
          <view class="record-time">
            <text class="time-text">{{ sheep.$helper.timeFormat(item.createTime, 'yyyy-mm-dd hh:MM:ss') }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="state.list.length === 0 && !state.loading">
        <image class="empty-img" src="/static/data-empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无佣金记录</text>
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
          <text class="picker-title">选择类型</text>
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
            <text class="cicon-check" v-if="state.bizType === item.value"></text>
          </view>
        </view>
      </view>
    </su-popup>
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
    bizType: '',
    showStatusPicker: false,
    showTypePicker: false,
    agentInfo: null,
  });

  // 状态选项
  const statusOptions = [
    { label: '全部', value: '' },
    { label: '待结算', value: 0 },
    { label: '已结算', value: 1 },
    { label: '已取消', value: 2 },
  ];

  // 类型选项
  const typeOptions = [
    { label: '全部', value: '' },
    { label: '订单佣金', value: 1 },
    { label: '推广佣金', value: 2 },
    { label: '其他收入', value: 3 },
  ];

  // 计算属性
  const statusText = computed(() => {
    const option = statusOptions.find(item => item.value === state.status);
    return option ? option.label : '全部';
  });

  const typeText = computed(() => {
    const option = typeOptions.find(item => item.value === state.bizType);
    return option ? option.label : '全部';
  });

  const totalCommission = computed(() => {
    return (state.agentInfo?.availablePrice || 0) + (state.agentInfo?.frozenPrice || 0);
  });

  const availableCommission = computed(() => {
    return state.agentInfo?.availablePrice || 0;
  });

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
    state.bizType = item.value;
    state.showTypePicker = false;
    resetList();
  };

  const resetList = () => {
    state.list = [];
    state.pageNo = 1;
    state.finished = false;
    getCommissionRecords();
  };

  const getCommissionRecords = async () => {
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
      
      if (state.bizType !== '') {
        params.bizType = state.bizType;
      }

      const { code, data } = await RegionalAgentApi.getRegionalAgentRecordPage(params);
      
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
      console.error('获取佣金记录失败:', error);
      uni.showToast({
        title: '获取数据失败',
        icon: 'none',
      });
    } finally {
      state.loading = false;
    }
  };

  const getAgentInfo = async () => {
    try {
      const { code, data } = await RegionalAgentApi.getCurrentUserRegionalAgent();
      if (code === 0 && data) {
        state.agentInfo = data;
      }
    } catch (error) {
      console.error('获取代理信息失败:', error);
    }
  };

  const goToDetail = (id) => {
    sheep.$router.go('/pages/agent/commission-detail', { id });
  };

  onMounted(() => {
    getAgentInfo();
    getCommissionRecords();
  });
</script>

<style lang="scss" scoped>
  .commission-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .stats-card {
    display: flex;
    background: linear-gradient(135deg, #ff6000 0%, #fe832a 100%);
    border-radius: 12rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;

    .stats-item {
      flex: 1;
      text-align: center;

      .stats-value {
        display: block;
        font-size: 36rpx;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10rpx;
      }

      .stats-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
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
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .record-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
        }

        .record-amount {
          font-size: 32rpx;
          font-weight: bold;

          &.amount-positive {
            color: #52c41a;
          }

          &.amount-negative {
            color: #ff4d4f;
          }
        }
      }

      .record-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .record-desc {
          font-size: 28rpx;
          color: #666666;
          flex: 1;
        }

        .record-status {
          font-size: 24rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;

          &.status-pending {
            background: #fff7e6;
            color: #fa8c16;
          }

          &.status-success {
            background: #f6ffed;
            color: #52c41a;
          }

          &.status-cancel {
            background: #fff2f0;
            color: #ff4d4f;
          }
        }
      }

      .record-time {
        .time-text {
          font-size: 24rpx;
          color: #999999;
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
</style>