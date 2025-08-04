<!-- 自定义页面：支持装修 -->
<template>
  <s-layout
    :title="state.name"
    navbar="custom"
    :bgStyle="state.page"
    :navbarStyle="state.navigationBar"
    onShareAppMessage
    showLeftButton
  >
    <view v-if="state.loading" class="loading-container">
      <text>加载中...</text>
    </view>
    <template v-else-if="state.showContent">
      <s-block v-for="(item, index) in state.components" :key="index" :styles="item.property.style">
        <s-block-item :type="item.id" :data="item.property" :styles="item.property.style" />
      </s-block>
    </template>
  </s-layout>
</template>

<script setup>
  import { reactive,watch } from 'vue';
  import { onLoad, onPageScroll } from '@dcloudio/uni-app';
  import sheep from '@/sheep';
  import DiyApi from '@/sheep/api/promotion/diy';
  import LevelApi from '@/sheep/api/member/level';
  import { showAuthModal } from '@/sheep/hooks/useModal';

  const state = reactive({
    name: '',
    components: [],
    navigationBar: {},
    page: {},
    loading: true,
    showContent: false,
  });
  
  // 获取用户信息存储
    const userStore = sheep.$store('user');
    
  watch(
    () => userStore.userInfo,
    async (newUserInfo, oldUserInfo) => {
      // 监听用户信息变化，当用户ID出现，且之前没有用户ID时，视为登录成功
      if (newUserInfo?.id && !oldUserInfo?.id) {
        await checkUserLevel(newUserInfo.id);
      }
    },
    { deep: true },
  );

  onLoad(async (options) => {
    let id = options.id;

    // #ifdef MP
    // 小程序预览自定义页面
    if (options.scene) {
      const sceneParams = decodeURIComponent(options.scene).split('=');
      id = sceneParams[1];
    }
    // #endif

    if (!id) {
      sheep.$helper.toast('参数错误');
      return;
    }

    // 只对id为22的页面进行会员等级检查
    if (id == 22) {
      const userInfo = userStore.userInfo;
      if (!userInfo?.id) {
        showAuthModal('smsLogin', () => {
          // 如果用户取消登录，也需要显示页面，避免一直 loading
          if (!userStore.isLogin) {
            state.loading = false;
            state.showContent = true;
          }
        });
      } else {
        await checkUserLevel(userInfo.id);
      }
      // 只有在 showContent 为 true 时才加载页面数据
      if (state.showContent) {
        await getData(id);
      }
    } else {
      // 其他页面直接显示内容
      state.showContent = true;
      await getData(id);
    }
  });

  const checkUserLevel = async (id) => {
      try{
      // 调用会员等级接口
		  const { code, data } = await LevelApi.getUserLevelId(id);
		  console.log(0)
		  if (code === 0) {
			console.log("enter")
			if (data === 1) {
			  // 等级为1，显示页面内容
			  console.log("correct")
			  state.showContent = true;
			  sheep.$router.go('/pages/index/page', { id: 23 });
			} else {
			  // 等级为0或其他，跳转到指定页面
			  state.loading = false
			  state.showContent = true;
			  sheep.$router.go('/pages/goods/index', { id: 643 });
			}
		  } else {
			state.loading = false
			sheep.$helper.toast('获取会员等级失败');
			sheep.$router.go('/pages/goods/index', { id: 643 });
		  }
	  }catch(error){
		  sheep.$router.go('/pages/goods/index', { id: 643 });
	  }
   
  };

  const getData = async (id) => {
    const { code, data } = await DiyApi.getDiyPage(id);
    if (code === 0) {
      state.name = data.name;
      state.components = data.property?.components;
      state.navigationBar = data.property?.navigationBar;
      state.page = data.property?.page;
    }
    state.loading = false;
  };

  onPageScroll(() => {});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  
  text {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
