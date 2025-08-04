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
    
    // 监听userInfo变化
    watch(
      () => userStore.userInfo,  // 监听的目标数据
      (newUserInfo, oldUserInfo) => {  // 变化时的回调
        // 当用户信息从无到有，且包含id时执行等级检查
        if (newUserInfo?.id && (!oldUserInfo?.id || newUserInfo.id !== oldUserInfo.id)) {
          checkUserLevel(newUserInfo.id);
        }
      },
      { immediate: false }  // 不立即执行，只在变化时执行
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
		// 获取用户信息
		var userInfo = sheep.$store('user').userInfo;
		if (!userInfo || !userInfo.id) {
		   showAuthModal();  
		}else{
          await checkUserLevel(userInfo.id);
	    }
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
