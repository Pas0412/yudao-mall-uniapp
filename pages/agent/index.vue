<!-- 代理中心  -->
<template>
  <s-layout
    navbar="inner"
    class="index-wrap"
    title="代理中心"
    :bgStyle="bgStyle"
    :onShareAppMessage="shareInfo"
  >


    <!-- 加载中状态 -->
    <view v-if="state.loading" class="loading-wrap">
      <uni-load-more status="loading" :content-text="{ contentrefresh: '正在加载...' }" />
    </view>

    <!-- 非代理用户 - 引导申请 -->
    <view v-else-if="state.agentStatus === 'none'" class="guide-wrap">
      <view class="guide-content">
        <image class="guide-img" :src="sheep.$url.static('/static/img/shop/commission/forbidden.png')" mode="aspectFit" />
        <view class="guide-title">您还不是代理商</view>
        <view class="guide-desc">申请成为代理商，享受更多权益</view>
        <button class="guide-btn ui-Shadow-Main ui-BG-Main-Gradient" @tap="goToApply">
          立即申请
        </button>
      </view>
    </view>

    <!-- 待审核状态 -->
    <view v-else-if="state.agentStatus === 'pending'" class="status-wrap">
      <view class="status-content">
        <image class="status-img" :src="sheep.$url.static('/static/img/shop/commission/pending.png')" mode="aspectFit" />
        <view class="status-title">申请审核中</view>
        <view class="status-desc">您的代理申请正在审核中，请耐心等待</view>
        <view class="status-time">申请时间：{{ state.agentInfo?.createTime }}</view>
      </view>
    </view>

    <!-- 审核拒绝状态 -->
    <view v-else-if="state.agentStatus === 'rejected'" class="status-wrap">
      <view class="status-content">
        <image class="status-img" :src="sheep.$url.static('/static/img/shop/commission/rejected.png')" mode="aspectFit" />
        <view class="status-title">申请被拒绝</view>
        <view class="status-desc">{{ state.agentInfo?.auditReason || '很抱歉，您的代理申请未通过审核' }}</view>
        <button class="status-btn ui-Shadow-Main ui-BG-Main-Gradient" @tap="goToApply">
          重新申请
        </button>
      </view>
    </view>

    <!-- 已通过代理 - 完整功能 -->
    <template v-else-if="state.agentStatus === 'approved'">
      <!-- 代理商信息 -->
      <agent-info />
      <!-- 账户信息 -->
      <agent-account-info />
      <!-- 菜单栏 -->
      <agent-menu />
      <!-- 代理记录 -->
      <agent-log />
    </template>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, onMounted, provide } from 'vue';
  import { onShow } from '@dcloudio/uni-app';
  import agentInfo from './components/agent-info.vue';
  import agentAccountInfo from './components/agent-account-info.vue';
  import agentLog from './components/agent-log.vue';
  import agentMenu from './components/agent-menu.vue';
  import sheep from '@/sheep';
  import { SharePageEnum } from '@/sheep/helper/const';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
  import dayjs from 'dayjs';

  const state = reactive({
    loading: true,
    agentStatus: 'none', // none: 非代理, pending: 待审核, approved: 已通过, rejected: 已拒绝
    agentInfo: null,
  });

  // 向子组件提供代理信息
  provide('agentInfo', computed(() => state.agentInfo));
  provide('agentStatus', computed(() => state.agentStatus));
  provide('refreshAgentStatus', checkAgentStatus);

  /** 代理邀请 */
  const shareInfo = computed(() => {
    return sheep.$platform.share.getShareInfo(
      {
        params: {
          page: SharePageEnum.HOME.value, // 用户通邀请进入到首页
        },
      },
      {
        type: 'user',
      },
    );
  });

  const bgStyle = {
    color: '#F7D598',
  };

  // 跳转到申请页面
  const goToApply = () => {
    sheep.$router.go('/pages/agent/apply');
  };

  // 检查代理状态
  const checkAgentStatus = async () => {
    try {
      state.loading = true;
      const { code, data } = await RegionalAgentApi.getCurrentUserRegionalAgent();
      
      if (code === 0) {
        // 检查返回的数据是否为数组
        if (Array.isArray(data) && data.length > 0) {
          // 选择 auditTime 最晚的一条作为代理信息
          const agentData = data.reduce((latest, current) => {
            return current.auditTime > latest.auditTime ? current : latest;
          });
          state.agentInfo = {
            ...agentData,
            createTime: agentData.createTime ? dayjs(agentData.createTime).format('YYYY-MM-DD HH:mm') : ''
          };
          
          // 根据状态判断（兼容字符串和数字类型）
          const status = parseInt(agentData.status);
          switch (status) {
            case 0:
              state.agentStatus = 'pending';
              break;
            case 1:
              state.agentStatus = 'approved';
              break;
            case 2:
              state.agentStatus = 'rejected';
              break;
            default:
              state.agentStatus = 'none';
          }
        } else if (data && data.id) {
          // 兼容对象格式的返回数据
          state.agentInfo = {
            ...data,
            createTime: data.createTime ? dayjs(data.createTime).format('YYYY-MM-DD HH:mm') : ''
          };
          
          // 根据状态判断（兼容字符串和数字类型）
          const status = parseInt(data.status);
          switch (status) {
            case 0:
              state.agentStatus = 'pending';
              break;
            case 1:
              state.agentStatus = 'approved';
              break;
            case 2:
              state.agentStatus = 'rejected';
              break;
            default:
              state.agentStatus = 'none';
          }
        } else {
          // 没有申请记录，非代理用户
          state.agentStatus = 'none';
          state.agentInfo = null;
        }
      } else {
        state.agentStatus = 'none';
        state.agentInfo = null;
      }
    } catch (error) {
      state.agentStatus = 'none';
      state.agentInfo = null;
    } finally {
      state.loading = false;
    }
  };

  onMounted(() => {
    checkAgentStatus();
  });

  onShow(() => {
    // 页面显示时重新检查状态，以便从申请页面返回时更新状态
    checkAgentStatus();
  });
</script>

<style lang="scss" scoped>
  .index-wrap {
    background: linear-gradient(180deg, #ff6000 0%, #fe832a 100%);
  }

  .loading-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400rpx;
  }

  .guide-wrap,
  .status-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 600rpx;
    padding: 40rpx;
  }

  .guide-content,
  .status-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #ffffff;
    border-radius: 20rpx;
    padding: 60rpx 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600rpx;
  }

  .guide-img,
  .status-img {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 40rpx;
  }

  .guide-title,
  .status-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333333;
    margin-bottom: 20rpx;
    text-align: center;
  }

  .guide-desc,
  .status-desc {
    font-size: 28rpx;
    color: #666666;
    margin-bottom: 40rpx;
    text-align: center;
    line-height: 40rpx;
  }

  .status-time {
    font-size: 24rpx;
    color: #999999;
    margin-bottom: 40rpx;
    text-align: center;
  }

  .guide-btn,
  .status-btn {
    width: 400rpx;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    outline: none;
  }
</style>