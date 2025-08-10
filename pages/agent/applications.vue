<!-- 申请记录页面 -->
<template>
  <s-layout title="申请记录" navbar="inner">
    <view class="applications-wrap">
      <!-- 申请列表 -->
      <view v-if="state.pagination.list && state.pagination.list.length > 0">
        <view 
          class="application-item" 
          v-for="item in state.pagination.list" 
          :key="item.id"
          @tap="viewDetail(item)"
        >
          <view class="item-header">
            <view class="area-info">
              <text class="area-name">{{ item.areaName }}</text>
              <text class="area-level">{{ getAreaLevelText(item.areaLevel) }}</text>
            </view>
            <view class="status-badge" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </view>
          </view>
          
          <view class="item-content">
            <view class="info-row">
              <text class="label">申请时间：</text>
              <text class="value">{{ formatTime(item.createTime) }}</text>
            </view>
            
            <view class="info-row" v-if="item.auditTime">
              <text class="label">审核时间：</text>
              <text class="value">{{ formatTime(item.auditTime) }}</text>
            </view>
            
            <view class="info-row">
              <text class="label">申请理由：</text>
              <text class="value reason">{{ item.applyReason }}</text>
            </view>
            
            <view class="info-row" v-if="item.auditReason">
              <text class="label">审核意见：</text>
              <text class="value audit-reason" :class="getStatusClass(item.status)">
                {{ item.auditReason }}
              </text>
            </view>
          </view>
          
          <view class="item-footer">
            <text class="view-detail">点击查看详情</text>
            <text class="cicon-right"></text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else-if="!state.loading" class="empty-wrap">
        <image 
          class="empty-img" 
          :src="sheep.$url.static('/static/data-empty.png')" 
          mode="aspectFit"
        />
        <text class="empty-text">暂无申请记录</text>
        <button class="empty-btn" @tap="goToApply">
          立即申请
        </button>
      </view>
      
      <!-- 加载更多 -->
      <uni-load-more
        v-if="state.pagination.list && state.pagination.list.length > 0"
        :status="state.loadStatus"
        :content-text="{
          contentdown: '上拉加载更多',
          contentrefresh: '正在加载...',
          contentnomore: '没有更多了',
        }"
        @clickLoadMore="loadmore"
      />
    </view>
  </s-layout>
</template>

<script setup>
  import { reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
  import dayjs from 'dayjs';

  const state = reactive({
    pagination: {
      list: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
    },
    loading: true,
    loadStatus: '',
  });

  // 获取地区等级文本
  const getAreaLevelText = (level) => {
    const levelMap = {
      2: '省级',
      3: '市级',
      4: '县区级'
    };
    return levelMap[level] || '未知';
  };

  // 获取状态文本
  const getStatusText = (status) => {
    const statusMap = {
      0: '待审核',
      1: '审核通过',
      2: '审核拒绝'
    };
    return statusMap[status] || '未知';
  };

  // 获取状态样式类
  const getStatusClass = (status) => {
    const classMap = {
      0: 'pending',
      1: 'approved',
      2: 'rejected'
    };
    return classMap[status] || '';
  };

  // 格式化时间
  const formatTime = (time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm');
  };

  // 查看详情
  const viewDetail = (item) => {
    // 可以跳转到详情页面或显示详情弹窗
    uni.showModal({
      title: '申请详情',
      content: `申请地区：${item.areaName}\n申请等级：${getAreaLevelText(item.areaLevel)}\n申请状态：${getStatusText(item.status)}\n申请时间：${formatTime(item.createTime)}${item.auditTime ? '\n审核时间：' + formatTime(item.auditTime) : ''}\n申请理由：${item.applyReason}${item.auditReason ? '\n审核意见：' + item.auditReason : ''}`,
      showCancel: false,
    });
  };

  // 跳转到申请页面
  const goToApply = () => {
    sheep.$router.go('/pages/agent/apply');
  };

  // 获取申请记录
  const getApplications = async (page = 1, loadMore = false) => {
    if (!loadMore) {
      state.loading = true;
    }
    state.loadStatus = 'loading';
    
    try {
      const { code, data } = await RegionalAgentApi.getMyApplications();
      
      if (code === 0 && data) {
        const list = Array.isArray(data) ? data : (data.list || []);
        
        if (loadMore) {
          state.pagination.list.push(...list);
        } else {
          state.pagination.list = list;
        }
        
        state.pagination.total = Array.isArray(data) ? data.length : (data.total || list.length);
        
        if (state.pagination.list.length >= state.pagination.total) {
          state.loadStatus = 'noMore';
        } else {
          state.loadStatus = 'more';
        }
      } else {
        state.pagination.list = [];
        state.loadStatus = 'noMore';
      }
    } catch (error) {
      console.error('获取申请记录失败:', error);
      state.pagination.list = [];
      state.loadStatus = 'noMore';
    } finally {
      state.loading = false;
    }
  };

  // 加载更多
  const loadmore = () => {
    if (state.loadStatus !== 'more') return;
    
    state.pagination.pageNo++;
    getApplications(state.pagination.pageNo, true);
  };

  onMounted(() => {
    getApplications();
  });
</script>

<style lang="scss" scoped>
  .applications-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .application-item {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      background: linear-gradient(90deg, #ff6000 0%, #fe832a 100%);

      .area-info {
        .area-name {
          font-size: 32rpx;
          font-weight: bold;
          color: #ffffff;
          margin-right: 20rpx;
        }

        .area-level {
          font-size: 24rpx;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }

      .status-badge {
        padding: 8rpx 16rpx;
        border-radius: 16rpx;
        font-size: 24rpx;
        font-weight: bold;

        &.pending {
          background: #ffeaa7;
          color: #fdcb6e;
        }

        &.approved {
          background: #d1f2eb;
          color: #00b894;
        }

        &.rejected {
          background: #fab1a0;
          color: #e17055;
        }
      }
    }

    .item-content {
      padding: 30rpx;

      .info-row {
        display: flex;
        margin-bottom: 20rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-size: 28rpx;
          color: #666666;
          width: 160rpx;
          flex-shrink: 0;
        }

        .value {
          font-size: 28rpx;
          color: #333333;
          flex: 1;
          line-height: 40rpx;

          &.reason {
            color: #666666;
          }

          &.audit-reason {
            &.approved {
              color: #00b894;
            }

            &.rejected {
              color: #e17055;
            }
          }
        }
      }
    }

    .item-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 30rpx;
      background: #f8f9fa;
      border-top: 2rpx solid #e9ecef;

      .view-detail {
        font-size: 26rpx;
        color: #666666;
        margin-right: 10rpx;
      }

      .cicon-right {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }

  .empty-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 40rpx;
    text-align: center;

    .empty-img {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 40rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #999999;
      margin-bottom: 60rpx;
    }

    .empty-btn {
      width: 200rpx;
      height: 60rpx;
      background: linear-gradient(90deg, #ff6000 0%, #fe832a 100%);
      border-radius: 30rpx;
      font-size: 28rpx;
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>