<template>
  <div>
    <CategorySelector @categoryChange="handleCategoryChange"/>
  </div>
</template>

<script>
export default {
  name: 'AttrList',

  data () {
    return {
      category1Id: null, // 一级分类ID
      category2Id: null, // 二级分类ID
      category3Id: null, // 三级分类ID

      attrs: [], // 属性列表
    }
  },

  async mounted () {
    // const result = await this.$API.attr.getList(2, 13, 61)
    // console.log('result', result)
  },

  methods: {
    /* 
    分类ID发生改变的监听回调
    */
    handleCategoryChange ({categoryId, level}) {
      if (level===1) {
        // 重置二级与三级分类的数据
        this.category2Id = null
        this.category3Id = null

        this.category1Id = categoryId
      } else if (level===2) {
        // 重置三级分类的数据
        this.category3Id = null

        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        // 只有当选择了三级的分类ID, 才去请求获取属性列表
        this.getAttrs()
      }
    },

    /* 
    异步获取属性列表
    */
    async getAttrs () {
      const {category1Id, category2Id, category3Id} = this
      const result = await this.$API.attr.getList(category1Id, category2Id, category3Id)
      this.attrs = result.data
    }
  }
}
</script>
