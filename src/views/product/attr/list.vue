<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange"/>
    </el-card>
    <el-card style="margin-top:20px;">
      <el-button type="primary" icon="el-icon-plus">添加属性</el-button>

      <el-table :data="attrs" border>
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="属性名称" prop="attrName" width="150"></el-table-column>
        <el-table-column label="属性值列表">
          <template slot-scope="{row, $index}">
            <!-- 
              {
                "id": 2051,
                "valueName": "支持存储卡",
                "attrId": 384
              },
            -->
            <el-tag type="info" v-for="value in row.attrValueList" :key="value.id">
              {{value.valueName}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{row, $index}">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
    this.category1Id = 2
    this.category2Id = 13
    this.category3Id = 61
    this.getAttrs()
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
