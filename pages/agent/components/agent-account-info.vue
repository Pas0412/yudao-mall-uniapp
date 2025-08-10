<!-- 代理账户：展示基本统计信息 -->
<template>
  <view class="account-card">
    <view class="account-card-box">
      <view class="ss-flex ss-row-between card-box-header">
        <view class="ss-flex">
          <view class="header-title ss-m-r-16">账户信息</view>
          <button
            class="ss-reset-button look-btn ss-flex"
            @tap="state.showMoney = !state.showMoney"
          >
            <uni-icons
              :type="state.showMoney ? 'eye-filled' : 'eye-slash-filled'"
              color="#A57A55"
              size="20"
            />
          </button>
        </view>
        <view class="ss-flex" @tap="sheep.$router.go('/pages/agent/commission')">
          <view class="header-title ss-m-r-4">佣金记录</view>
          <text class="cicon-play-arrow" />
        </view>
      </view>

      <!-- 收益 -->
      <view class="card-content ss-flex">
        <view class="ss-flex-1 ss-flex-col ss-col-center">
          <view class="item-title">可用佣金(元)</view>
          <view class="item-detail">
            {{ state.showMoney ? fen2yuan(state.agentInfo?.availablePrice || 0) : '***' }}
          </view>
        </view>
        <view class="ss-flex-1 ss-flex-col ss-col-center">
          <view class="item-title">冻结佣金(元)</view>
          <view class="item-detail">
            {{ state.showMoney ? fen2yuan(state.agentInfo?.frozenPrice || 0) : '***' }}
          </view>
        </view>
        <view class="ss-flex-1 ss-flex-col ss-col-center">
          <view class="item-title">代理状态</view>
          <view class="item-detail">
            {{ getStatusText(state.agentInfo?.status) }}
          </view>
        </view>
      </view>
      
      <!-- 代理区域信息 -->
      <view class="area-info-section" v-if="state.agentInfo?.isAgent">
        <view class="area-title">代理区域</view>
        <view class="area-detail">
          <text class="level-text">{{ getAgentLevelText(state.agentInfo?.agentLevel) }}</text>
          <text class="area-text">
            {{ state.agentInfo?.provinceName }}
            <text v-if="state.agentInfo?.cityName">{{ state.agentInfo?.cityName }}</text>
            <text v-if="state.agentInfo?.areaName">{{ state.agentInfo?.areaName }}</text>
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import sheep from '@/sheep';
import { computed, reactive, onMounted } from 'vue';
import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
import { fen2yuan } from '@/sheep/helper/utils';

  const userInfo = computed(() => sheep.$store('user').userInfo);

  const state = reactive({
    showMoney: false,
    agentInfo: null,
  });

  // 获取代理等级文本
  const getAgentLevelText = (level) => {
    const levelMap = {
      1: '省级',
      2: '市级',
      3: '区县级'
    };
    return levelMap[level] || '暂无';
  };

  // 获取状态文本
  const getStatusText = (status) => {
    const statusMap = {
      0: '待审核',
      1: '审核通过',
      2: '审核拒绝'
    };
    return statusMap[status] || '暂无';
  };

  onMounted(async () => {
    // 获取代理信息
    try {
      const { code, data } = await RegionalAgentApi.getRegionalAgent();
      if (code === 0) {
        state.agentInfo = data;
      }
    } catch (error) {
      console.error('获取代理信息失败:', error);
    }
  });
</script>

<style lang="scss" scoped>
  .account-card {
    width: 694rpx;
    margin: 0 auto;
    padding: 2rpx;
    background: linear-gradient(180deg, #ffffff 0.88%, #fff9ec 100%);
    border-radius: 12rpx;
    z-index: 3;
    position: relative;

    .account-card-box {
      background: #ffefd6;

      .card-box-header {
        padding: 0 30rpx;
        height: 72rpx;
        box-shadow: 0px 2px 6px #f2debe;

        .header-title {
          font-size: 24rpx;
          font-weight: 500;
          color: #a17545;
          line-height: 30rpx;
        }

        .cicon-play-arrow {
          color: #a17545;
          font-size: 24rpx;
          line-height: 30rpx;
        }
      }

      .card-content {
        height: 190rpx;
        background: #fdfae9;

        .item-title {
          font-size: 24rpx;
          font-weight: 500;
          color: #cba67e;
          line-height: 30rpx;
          margin-bottom: 24rpx;
        }

        .item-detail {
          font-size: 28rpx;
          font-family: OPPOSANS;
          font-weight: bold;
          color: #692e04;
          line-height: 30rpx;
          text-align: center;
        }
      }
    }
  }
</style>