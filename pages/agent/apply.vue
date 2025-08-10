<!-- 申请代理页面 -->
<template>
  <s-layout title="申请代理" navbar="inner">
    <view class="apply-wrap">
      <!-- 用户信息 -->
      <view class="user-info-card">
        <view class="card-header">
          <text class="header-title">申请人信息</text>
        </view>
        <view class="card-content">
          <view class="info-item">
            <text class="label">姓名：</text>
            <text class="value">{{ userInfo.nickname || '未设置' }}</text>
          </view>
          <view class="info-item">
            <text class="label">手机号：</text>
            <text class="value">{{ userInfo.mobile || '未绑定' }}</text>
          </view>
        </view>
      </view>

      <!-- 申请表单 -->
      <view class="form-card">
        <view class="card-header">
          <text class="header-title">申请信息</text>
        </view>
        <view class="card-content">
          <!-- 代理级别选择 -->
          <view class="form-item">
            <text class="form-label">代理级别 <text class="required">*</text></text>
            <view class="form-input" @tap="showAgentLevelPicker">
              <text class="input-text" :class="{ placeholder: !state.selectedAgentLevel.name }">
                {{ state.selectedAgentLevel.name || '请选择代理级别' }}
              </text>
              <text class="cicon-right"></text>
            </view>
          </view>

          <!-- 地区选择 -->
          <view class="form-item" v-if="state.selectedAgentLevel.value">
            <text class="form-label">申请地区 <text class="required">*</text></text>
            <view class="form-input" @tap="showRegionPicker">
              <text class="input-text" :class="{ placeholder: !state.selectedArea.name }">
                {{ state.selectedArea.name || getAreaPlaceholder() }}
              </text>
              <text class="cicon-right"></text>
            </view>
          </view>


        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-wrap">
        <button 
          class="submit-btn" 
          :class="{ disabled: !canSubmit }"
          @tap="submitApplication"
          :disabled="!canSubmit"
        >
          提交申请
        </button>
      </view>
    </view>

    <!-- 代理级别选择弹窗 -->
    <su-popup :show="state.showAgentLevelPicker" type="bottom" round="10" @close="state.showAgentLevelPicker = false">
      <view class="picker-header">
        <text class="picker-title">选择代理级别</text>
        <text class="picker-close" @tap="state.showAgentLevelPicker = false">×</text>
      </view>
      <view class="picker-content">
        <view 
          class="picker-item" 
          v-for="item in agentLevelOptions" 
          :key="item.value"
          @tap="selectAgentLevel(item)"
        >
          <text class="item-name">{{ item.name }}</text>
          <text class="item-desc">{{ item.desc }}</text>
        </view>
      </view>
    </su-popup>

    <!-- 地区选择弹窗 -->
    <su-region-picker
      :show="state.showRegion"
      @confirm="onRegionConfirm"
      @cancel="state.showRegion = false"
    />
  </s-layout>
</template>

<script setup>
  import { computed, reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';
  import AreaApi from '@/sheep/api/system/area';

  const userInfo = computed(() => sheep.$store('user').userInfo);

  const state = reactive({
    selectedAgentLevel: {
      value: null,
      name: '',
    },
    selectedArea: {
      provinceId: null,
      provinceName: '',
      cityId: null,
      cityName: '',
      areaId: null,
      areaName: '',
      name: '',
    },
    showAgentLevelPicker: false,
    showRegion: false,
    agentInfo: null,
  });

  // 代理级别选项
  const agentLevelOptions = [
    { value: 1, name: '省级代理', desc: '负责整个省份的代理业务' },
    { value: 2, name: '市级代理', desc: '负责指定城市的代理业务' },
    { value: 3, name: '区县级代理', desc: '负责指定区县的代理业务' },
  ];

  // 是否可以提交
  const canSubmit = computed(() => {
    const hasAgentLevel = state.selectedAgentLevel.value;
    const hasValidArea = checkAreaValid();
    return hasAgentLevel && hasValidArea;
  });

  // 检查地区选择是否有效
  const checkAreaValid = () => {
    const level = state.selectedAgentLevel.value;
    if (level === 1) {
      return state.selectedArea.provinceId;
    } else if (level === 2) {
      return state.selectedArea.provinceId && state.selectedArea.cityId;
    } else if (level === 3) {
      return state.selectedArea.provinceId && state.selectedArea.cityId && state.selectedArea.areaId;
    }
    return false;
  };

  // 获取地区选择提示文本
  const getAreaPlaceholder = () => {
    const level = state.selectedAgentLevel.value;
    if (level === 1) {
      return '请选择省份';
    } else if (level === 2) {
      return '请选择省份和城市';
    } else if (level === 3) {
      return '请选择省份、城市和区县';
    }
    return '请先选择代理级别';
  };

  // 显示代理级别选择器
  const showAgentLevelPicker = () => {
    state.showAgentLevelPicker = true;
  };

  // 选择代理级别
  const selectAgentLevel = (item) => {
    state.selectedAgentLevel = {
      value: item.value,
      name: item.name,
    };
    // 清空之前选择的地区
    state.selectedArea = {
      provinceId: null,
      provinceName: '',
      cityId: null,
      cityName: '',
      areaId: null,
      areaName: '',
      name: '',
    };
    state.showAgentLevelPicker = false;
  };

  // 显示地区选择器
  const showRegionPicker = () => {
    state.showRegion = true;
  };

  // 确认选择地区
  const onRegionConfirm = (e) => {
    console.log('选择的地区:', e);
    
    const level = state.selectedAgentLevel.value;
    let areaName = '';
    
    // 根据代理级别设置相应的地区信息
    state.selectedArea.provinceId = e.province_id;
    state.selectedArea.provinceName = e.province_name;
    areaName = e.province_name;
    
    if (level >= 2 && e.city_id) {
      state.selectedArea.cityId = e.city_id;
      state.selectedArea.cityName = e.city_name;
      areaName += ` ${e.city_name}`;
    }
    
    if (level >= 3 && e.district_id) {
      state.selectedArea.areaId = e.district_id;
      state.selectedArea.areaName = e.district_name;
      areaName += ` ${e.district_name}`;
    }
    
    state.selectedArea.name = areaName;
    state.showRegion = false;
  };

  // 提交申请
  const submitApplication = async () => {
    if (!canSubmit.value) {
      return;
    }

    try {
      uni.showLoading({ title: '提交中...' });
      
      const requestData = {
        level: state.selectedAgentLevel.value,
        provinceId: state.selectedArea.provinceId,
        cityId: state.selectedArea.cityId || undefined,
        areaId: state.selectedArea.areaId || undefined,
      };
      
      const { code, data } = await RegionalAgentApi.applyRegionalAgent(requestData);
      
      uni.hideLoading();
      
      if (code === 0) {
        uni.showToast({
          title: '申请提交成功',
          icon: 'success',
        });
        
        // 延迟跳转到代理中心
        setTimeout(() => {
          sheep.$router.go('/pages/agent/index');
        }, 1500);
      } else {
        uni.showToast({
          title: data?.message || '申请提交失败',
          icon: 'none',
        });
      }
    } catch (error) {
      uni.hideLoading();
      console.error('提交申请失败:', error);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      });
    }
  };

  // 获取地区数据
  const getAreaData = () => {
    if (uni.getStorageSync('areaData')) {
      return;
    }
    
    AreaApi.getAreaTree().then((res) => {
      if (res.code === 0) {
        uni.setStorageSync('areaData', res.data);
      }
    });
  };

  onMounted(async () => {
    // 获取地区数据
    getAreaData();
    
    // 检查用户是否已经是代理
    try {
      const { code, data } = await RegionalAgentApi.getRegionalAgent();
      if (code === 0 && data) {
        state.agentInfo = data;
        
        if (data.isAgent) {
          uni.showModal({
            title: '提示',
            content: '您已经是代理商了，无需重复申请',
            showCancel: false,
            success: () => {
              sheep.$router.back();
            },
          });
        }
      }
    } catch (error) {
      console.error('获取代理信息失败:', error);
    }
  });
</script>

<style lang="scss" scoped>
  .apply-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .user-info-card,
  .form-card {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .card-header {
      padding: 30rpx;
      background: linear-gradient(90deg, #ff6000 0%, #fe832a 100%);

      .header-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }

    .card-content {
      padding: 30rpx;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      color: #666666;
      width: 120rpx;
    }

    .value {
      font-size: 28rpx;
      color: #333333;
      flex: 1;
    }
  }

  .form-item {
    margin-bottom: 40rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 20rpx;

      .required {
        color: #ff4757;
      }
    }

    .form-input {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx solid #e9ecef;

      .input-text {
        font-size: 28rpx;
        color: #333333;
        flex: 1;

        &.placeholder {
          color: #999999;
        }
      }

      .cicon-right {
        font-size: 24rpx;
        color: #999999;
      }
    }

    .form-input-text {
      width: 100%;
      padding: 24rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx solid #e9ecef;
      font-size: 28rpx;
      color: #333333;
      box-sizing: border-box;
    }

    .form-textarea {
      width: 100%;
      min-height: 200rpx;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx solid #e9ecef;
      font-size: 28rpx;
      color: #333333;
      line-height: 40rpx;
      box-sizing: border-box;
    }

    .char-count {
      text-align: right;
      font-size: 24rpx;
      color: #999999;
      margin-top: 10rpx;
    }
  }

  .submit-wrap {
    padding: 40rpx 0;

    .submit-btn {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(90deg, #ff6000 0%, #fe832a 100%);
      border-radius: 44rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ffffff;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        background: #cccccc;
        color: #999999;
      }
    }
  }

  // 选择器样式
  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;

    .picker-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .picker-close {
      font-size: 40rpx;
      color: #999;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .picker-content {
    padding: 20rpx 0;

    .picker-item {
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .item-name {
        font-size: 30rpx;
        color: #333;
        font-weight: bold;
        display: block;
        margin-bottom: 10rpx;
      }

      .item-desc {
        font-size: 26rpx;
        color: #666;
        display: block;
      }
    }
  }
</style>