<!-- 提现申请页面 -->
<template>
  <s-layout title="申请提现" navbar="inner">
    <view class="withdraw-wrap">
      <!-- 账户信息 -->
      <view class="account-card">
        <view class="account-info">
          <text class="account-label">可提现金额</text>
          <text class="account-amount">{{ formatPrice(availableAmount) }}</text>
        </view>
      </view>

      <!-- 提现表单 -->
      <view class="form-card">
        <view class="card-header">
          <text class="header-title">提现信息</text>
        </view>
        <view class="card-content">
          <!-- 提现金额 -->
          <view class="form-item">
            <text class="form-label">提现金额 <text class="required">*</text></text>
            <view class="amount-input-wrap">
              <text class="currency-symbol">¥</text>
              <input
                class="amount-input"
                v-model="state.price"
                placeholder="请输入提现金额"
                type="digit"
                @input="onAmountInput"
              />
            </view>
            <view class="amount-tips">
              <text class="tip-text">最低提现金额：¥{{ minAmount }}</text>
              <text class="tip-link" @tap="setMaxAmount">全部提现</text>
            </view>
          </view>

          <!-- 提现方式 -->
          <view class="form-item">
            <text class="form-label">提现方式 <text class="required">*</text></text>
            <view class="type-selector">
              <view 
                class="type-item" 
                v-for="item in withdrawTypes" 
                :key="item.value"
                :class="{ active: state.type === item.value }"
                @tap="selectType(item.value)"
              >
                <text class="type-icon">{{ item.icon }}</text>
                <text class="type-text">{{ item.label }}</text>
              </view>
            </view>
          </view>

          <!-- 收款人姓名 -->
          <view class="form-item">
            <text class="form-label">收款人姓名 <text class="required">*</text></text>
            <input
              class="form-input"
              v-model="state.name"
              placeholder="请输入收款人姓名"
              maxlength="20"
            />
          </view>

          <!-- 收款账号 -->
          <view class="form-item">
            <text class="form-label">{{ getAccountLabel() }} <text class="required">*</text></text>
            <input
              class="form-input"
              v-model="state.accountNo"
              :placeholder="getAccountPlaceholder()"
              maxlength="30"
            />
          </view>

          <!-- 收款银行 -->
          <view class="form-item" v-if="state.type === 1">
            <text class="form-label">收款银行 <text class="required">*</text></text>
            <input
              class="form-input"
              v-model="state.bankName"
              placeholder="请输入收款银行名称"
              maxlength="50"
            />
          </view>

          <!-- 开户地址 -->
          <view class="form-item" v-if="state.type === 1">
            <text class="form-label">开户地址 <text class="required">*</text></text>
            <input
              class="form-input"
              v-model="state.bankAddress"
              placeholder="请输入开户地址"
              maxlength="100"
            />
          </view>

          <!-- 收款码上传 -->
          <view class="form-item" v-if="state.type === 2 || state.type === 3">
            <text class="form-label">收款码</text>
            <view class="upload-wrap">
              <view class="upload-item" v-if="state.accountQrCodeUrl">
                <image class="qr-image" :src="state.accountQrCodeUrl" mode="aspectFit" @tap="previewImage"></image>
                <text class="remove-btn" @tap="removeImage">×</text>
              </view>
              <view class="upload-btn" v-else @tap="uploadImage">
                <text class="upload-icon">+</text>
                <text class="upload-text">上传收款码</text>
              </view>
            </view>
          </view>

          <!-- 备注 -->
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea
              class="form-textarea"
              v-model="state.remark"
              placeholder="请输入备注信息（选填）"
              maxlength="200"
            ></textarea>
          </view>
        </view>
      </view>

      <!-- 提现说明 -->
      <view class="tips-card">
        <view class="tips-header">
          <text class="tips-title">提现说明</text>
        </view>
        <view class="tips-content">
          <text class="tips-item">• 提现申请提交后，我们将在1-3个工作日内处理</text>
          <text class="tips-item">• 最低提现金额为¥{{ minAmount }}</text>
          <text class="tips-item">• 请确保收款信息准确无误，避免提现失败</text>
          <text class="tips-item">• 如有疑问，请联系客服</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-wrap">
        <button 
          class="submit-btn" 
          :class="{ disabled: !canSubmit }"
          @tap="submitWithdraw"
          :disabled="!canSubmit"
        >
          提交申请
        </button>
      </view>
    </view>
  </s-layout>
</template>

<script setup>
  import { computed, reactive, onMounted } from 'vue';
  import sheep from '@/sheep';
  import RegionalAgentApi from '@/sheep/api/trade/regionalAgent';

  const state = reactive({
    price: '',
    type: 1, // 1-银行卡 2-微信 3-支付宝
    name: '',
    accountNo: '',
    bankName: '',
    bankAddress: '',
    accountQrCodeUrl: '',
    remark: '',
    agentInfo: null,
  });

  // 提现方式
  const withdrawTypes = [
    { label: '银行卡', value: 1, icon: '🏦' },
    { label: '微信', value: 2, icon: '💬' },
    { label: '支付宝', value: 3, icon: '💰' },
  ];

  // 最低提现金额
  const minAmount = 10;

  // 计算属性
  const availableAmount = computed(() => {
    return state.agentInfo?.availablePrice || 0;
  });

  const canSubmit = computed(() => {
    const price = parseFloat(state.price);
    return (
      price >= minAmount &&
      price <= availableAmount.value / 100 &&
      state.type &&
      state.name.trim() &&
      state.accountNo.trim() &&
      (state.type === 1 ? (state.bankName.trim() && state.bankAddress.trim()) : true) &&
      (state.type === 2 || state.type === 3 ? state.accountQrCodeUrl : true)
    );
  });

  // 方法
  const formatPrice = (price) => {
    return sheep.$helper.priceFormat(price);
  };

  const getAccountLabel = () => {
    switch (state.type) {
      case 1: return '银行卡号';
      case 2: return '微信号';
      case 3: return '支付宝账号';
      default: return '收款账号';
    }
  };

  const getAccountPlaceholder = () => {
    switch (state.type) {
      case 1: return '请输入银行卡号';
      case 2: return '请输入微信号';
      case 3: return '请输入支付宝账号';
      default: return '请输入收款账号';
    }
  };

  const selectType = (type) => {
    state.type = type;
    // 切换类型时清空相关字段
    state.accountNo = '';
    state.bankName = '';
    state.bankAddress = '';
    state.accountQrCodeUrl = '';
  };

  const onAmountInput = (e) => {
    let value = e.detail.value;
    // 限制小数点后两位
    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }
    state.price = value;
  };

  const setMaxAmount = () => {
    const maxAmount = availableAmount.value / 100;
    state.price = maxAmount.toFixed(2);
  };

  const uploadImage = () => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 这里应该上传到服务器，获取URL
        // 暂时使用本地路径
        state.accountQrCodeUrl = tempFilePath;
        
        // TODO: 实际项目中需要调用上传接口
        // uploadFile(tempFilePath).then(url => {
        //   state.accountQrCodeUrl = url;
        // });
      },
    });
  };

  const previewImage = () => {
    uni.previewImage({
      urls: [state.accountQrCodeUrl],
    });
  };

  const removeImage = () => {
    state.accountQrCodeUrl = '';
  };

  const submitWithdraw = async () => {
    if (!canSubmit.value) {
      return;
    }

    const price = parseFloat(state.price);
    
    if (price < minAmount) {
      uni.showToast({
        title: `最低提现金额为¥${minAmount}`,
        icon: 'none',
      });
      return;
    }

    if (price > availableAmount.value) {
      uni.showToast({
        title: '提现金额不能超过可提现余额',
        icon: 'none',
      });
      return;
    }

    try {
      uni.showLoading({ title: '提交中...' });
      
      const data = {
        price: Math.round(price * 100), // 转换为分
        type: state.type,
        name: state.name.trim(),
        accountNo: state.accountNo.trim(),
        remark: state.remark.trim(),
      };
      
      if (state.type === 1) {
        data.bankName = state.bankName.trim();
        data.bankAddress = state.bankAddress.trim();
      }
      
      if ((state.type === 2 || state.type === 3) && state.accountQrCodeUrl) {
        data.accountQrCodeUrl = state.accountQrCodeUrl;
      }

      const { code, data: result } = await RegionalAgentApi.createWithdraw(data);
      
      uni.hideLoading();
      
      if (code === 0) {
        uni.showToast({
          title: '提现申请提交成功',
          icon: 'success',
        });
        
        // 延迟跳转到提现记录页面
        setTimeout(() => {
          sheep.$router.go('/pages/agent/withdraw-records');
        }, 1500);
      } else {
        uni.showToast({
          title: result?.message || '提交失败',
          icon: 'none',
        });
      }
    } catch (error) {
      uni.hideLoading();
      console.error('提交提现申请失败:', error);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none',
      });
    }
  };

  const getAgentInfo = async () => {
    try {
      const { code, data } = await RegionalAgentApi.getRegionalAgent();
      if (code === 0 && data) {
        state.agentInfo = data;
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
  .withdraw-wrap {
    padding: 20rpx;
    min-height: 100vh;
    background: #f5f5f5;
  }

  .account-card {
    background: linear-gradient(135deg, #ff6000 0%, #fe832a 100%);
    border-radius: 12rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
    text-align: center;

    .account-info {
      .account-label {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10rpx;
      }

      .account-amount {
        font-size: 48rpx;
        font-weight: bold;
        color: #ffffff;
      }
    }
  }

  .form-card,
  .tips-card {
    background: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    overflow: hidden;

    .card-header,
    .tips-header {
      padding: 30rpx;
      background: #f8f9fa;
      border-bottom: 1rpx solid #f0f0f0;

      .header-title,
      .tips-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
      }
    }

    .card-content,
    .tips-content {
      padding: 30rpx;
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
      min-height: 120rpx;
      padding: 24rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx solid #e9ecef;
      font-size: 28rpx;
      color: #333333;
      box-sizing: border-box;
      resize: none;
    }
  }

  .amount-input-wrap {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 8rpx;
    border: 2rpx solid #e9ecef;
    padding: 24rpx 20rpx;

    .currency-symbol {
      font-size: 28rpx;
      color: #333333;
      margin-right: 10rpx;
    }

    .amount-input {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
      background: transparent;
      border: none;
      padding: 0;
    }
  }

  .amount-tips {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10rpx;

    .tip-text {
      font-size: 24rpx;
      color: #999999;
    }

    .tip-link {
      font-size: 24rpx;
      color: #ff6000;
    }
  }

  .type-selector {
    display: flex;
    gap: 20rpx;

    .type-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30rpx 20rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      border: 2rpx solid #e9ecef;

      &.active {
        background: #fff7e6;
        border-color: #ff6000;
      }

      .type-icon {
        font-size: 32rpx;
        margin-bottom: 10rpx;
      }

      .type-text {
        font-size: 24rpx;
        color: #333333;
      }
    }
  }

  .upload-wrap {
    .upload-item {
      position: relative;
      width: 200rpx;
      height: 200rpx;

      .qr-image {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }

      .remove-btn {
        position: absolute;
        top: -10rpx;
        right: -10rpx;
        width: 40rpx;
        height: 40rpx;
        background: #ff4d4f;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
      }
    }

    .upload-btn {
      width: 200rpx;
      height: 200rpx;
      background: #f8f9fa;
      border: 2rpx dashed #d9d9d9;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .upload-icon {
        font-size: 48rpx;
        color: #d9d9d9;
        margin-bottom: 10rpx;
      }

      .upload-text {
        font-size: 24rpx;
        color: #999999;
      }
    }
  }

  .tips-content {
    .tips-item {
      display: block;
      font-size: 24rpx;
      color: #666666;
      line-height: 40rpx;
      margin-bottom: 10rpx;

      &:last-child {
        margin-bottom: 0;
      }
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
</style>