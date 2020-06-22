<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange"/>
    </el-card>
    <el-card style="margin-top:20px;">
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加属性</el-button>
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
              <hint-button title="修改属性" type="primary" icon="el-icon-edit" size="mini" 
                @click="showUpdate(row)"></hint-button>
              <HintButton title="删除属性" type="danger" icon="el-icon-delete" size="mini"></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div v-show="!isShowList">
        <el-form inline>
          <el-form-item label="属性名">
            <el-input type="text" placeholder="请输入属性名" v-model="attr.attrName"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>

        <el-table border style="margin: 20px 0" :data="attr.attrValueList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row, $index}">
              <el-input v-if="row.edit" v-model="row.valueName"></el-input>
              <span v-else>{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <hint-button title="删除" type="danger" icon="el-icon-delete" size="mini"></hint-button>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary">保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </div>

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
      isShowList: true, // 是否显示属性列表界面, 如果是false显示添加&修改的界面
      attr: {
        attrName: '', // 属性名
        attrValueList: [], // 属性值列表
        categoryId: '', // 当前第3级分类ID
        categoryLevel: 3, // 分类级别
      }, // 当前要操作的属性对象
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
    添加一个新的平台属性值
    */
    addAttrValue () {
      // 创建一个平台属性值对象
      const attrValue =  {
        attrId: this.attr.id, // 当前要修改属性的id
        valueName: '', // 属性值名称
        edit: true, // 标识为编辑模式
      }

      // 添加到对应的数组
      this.attr.attrValueList.push(attrValue)
    },

    /* 
    显示添加界面
    */
    showAdd () {
      // 重置一下数据
      this.attr = {
        attrName: '', // 属性名
        attrValueList: [], // 属性值列表
        categoryId: this.category3Id, // 当前第3级分类ID
        categoryLevel: 3, // 分类级别
      }

      // 显示界面
      this.isShowList = false
    },

    /* 
    显示修改界面
    */
    showUpdate (attr) {
      // 保存attr
      this.attr = attr
      // 显示更新界面
      this.isShowList = false
    },

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
