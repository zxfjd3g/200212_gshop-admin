<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange"/>
    </el-card>
    <el-card style="margin-top:20px;">
      <template v-if="isShowList">
          <el-button type="primary" icon="el-icon-plus">添加属性</el-button>
        <el-table :data="attrs" border v-loading="loading">
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
              <hint-button title="修改属性" type="primary" icon="el-icon-edit" size="mini"></hint-button>
              <HintButton title="删除属性" type="danger" icon="el-icon-delete" size="mini"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </template>
      
      <template v-else>
        <el-form inline>
          <el-form-item label="属性名">
            <el-input type="text" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus">添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>

        <el-table border style="margin: 20px 0">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <hint-button title="删除" type="danger" icon="el-icon-delete" size="mini"></hint-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </template>

    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AttrList',

  data () {
    return {
      loading: false, // 是否正在加载中
      category1Id: null, // 一级分类ID
      category2Id: null, // 二级分类ID
      category3Id: null, // 三级分类ID

      attrs: [], // 属性列表
      isShowList: false, // 是否显示属性列表界面, 如果是false显示添加&修改的界面
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
      this.loading = true
      const result = await this.$API.attr.getList(category1Id, category2Id, category3Id)
      this.loading = false
      this.attrs = result.data
    }
  }
}
</script>
