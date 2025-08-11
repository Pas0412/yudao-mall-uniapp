<!-- 代理首页：明细列表  -->
<template>
  <view class="distribution-log-wrap">
    <view class="header-box">
      <image class="header-bg" :src="sheep.$url.static('/static/img/shop/commission/title2.png')" />
      <view class="ss-flex header-title">
        <view class="title">实时动态</view>
        <text class="cicon-forward" />
      </view>
    </view>
    <scroll-view
      scroll-y="true"
      @scrolltolower="loadmore"
      class="scroll-box log-scroll"
      scroll-with-animation="true"
    >
      <view v-if="state.pagination.list && state.pagination.list.length > 0">
        <view
          class="log-item-box ss-flex ss-row-between"
          v-for="item in state.pagination.list"
          :key="item.id"
        >
          <view class="log-item-wrap">
            <view class="log-item ss-flex ss-ellipsis-1 ss-col-center">
              <view class="ss-flex ss-col-center">
                <image
                  class="log-img"
                  :src="sheep.$url.static('/static/img/shop/avatar/notice.png')"
                  mode="aspectFill"
                />
              </view>
              <view class="log-text ss-ellipsis-1">
                {{ getLogText(item) }}
              </view>
            </view>
          </view>
          <text class="log-time">{{ dayjs(item.createTime).fromNow() }}</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-box">
        <image 
          class="empty-img" 
          :src="sheep.$url.static('/static/data-empty.png')" 
          mode="aspectFit"
        />
        <text class="empty-text">暂无动态记录</text>
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
    </scroll-view>
  </view>
</template>

<script setup>
  import { reactive, onMounted } from 'vue';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import 'dayjs/locale/zh-cn';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
  import sheep from '@/sheep';

  dayjs.extend(relativeTime);
  dayjs.locale('zh-cn');

  const state = reactive({
    pagination: {
      list: [],
      total: 0,
      pageNo: 1,
      pageSize: 10,
    },
    loadStatus: '',
  });

  // 获取日志文本
  const getLogText = (item) => {
    const statusMap = {
      0: '提交了代理申请',
      1: '代理申请审核通过',
      2: '代理申请被拒绝'
    };
    const levelMap = {
      2: '省级',
      3: '市级', 
      4: '区县级'
    };
    
    const statusText = statusMap[item.status] || '未知状态';
    const levelText = levelMap[item.areaLevel] || '';
    const areaText = item.areaName || '';
    
    return `${statusText} ${levelText} ${areaText}`.trim();
  };

  // 获取申请记录
  const getApplications = async (page = 1, loadMore = false) => {
    state.loadStatus = 'loading';
    
    try {
      const { code, data } = await RegionalAgentApi.getMyApplicationsHistory();
      
      if (code === 0 && data) {
        if (loadMore) {
          state.pagination.list.push(...(data.list || []));
        } else {
          state.pagination.list = data.list || [];
        }
        
        state.pagination.total = data.total || 0;
        
        if (state.pagination.list.length >= state.pagination.total) {
          state.loadStatus = 'noMore';
        } else {
          state.loadStatus = 'more';
        }
      } else {
        state.loadStatus = 'noMore';
      }
    } catch (error) {
      console.error('获取申请记录失败:', error);
      state.loadStatus = 'noMore';
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
  .distribution-log-wrap {
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

    .log-scroll {
      height: 400rpx;
      padding: 0 30rpx;

      .log-item-box {
        padding: 30rpx 0;
        border-bottom: 2rpx solid #f7f7f7;

        &:last-child {
          border-bottom: none;
        }

        .log-item-wrap {
          flex: 1;

          .log-item {
            .log-img {
              width: 60rpx;
              height: 60rpx;
              border-radius: 50%;
              margin-right: 20rpx;
            }

            .log-text {
              font-size: 28rpx;
              color: #333333;
              line-height: 40rpx;
            }
          }
        }

        .log-time {
          font-size: 24rpx;
          color: #999999;
          line-height: 40rpx;
        }
      }
      
      .empty-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300rpx;
        
        .empty-img {
          width: 160rpx;
          height: 160rpx;
          margin-bottom: 20rpx;
        }
        
        .empty-text {
          font-size: 28rpx;
          color: #999999;
        }
      }
    }
  }
</style>