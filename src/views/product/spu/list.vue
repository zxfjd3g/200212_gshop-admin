<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <CategorySelector @categoryChange="handleCategoryChange"></CategorySelector>
    </el-card>
    <el-card>
      <div v-show="!isShowSpuForm">
        <el-button type="primary" icon="el-icon-plus" @click="showSpuAdd">添加SPU</el-button>

        <el-table border :data="spuList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" prop="description"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <hint-button title="添加SKU" type="primary" icon="el-icon-plus" size="mini" />
              <hint-button title="修改SPU" type="primary" icon="el-icon-edit" size="mini" 
                @click="showSpuUpdate(row)"/>
              <hint-button title="查看所有SKU" type="info" icon="el-icon-info" size="mini" 
                @click="showSkuList(row)"/>
              <el-popconfirm
              :title="`确定删除 ${row.spuName} 吗?`"
              @onConfirm="deleteSpu(row.id)"
            >
                <hint-button slot="reference" title="删除SPU" type="danger" icon="el-icon-delete" size="mini" />
            </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination 
          style="text-align: center" 
          :current-page="page" 
          :page-sizes="[5, 10, 15]" 
          :page-size="limit"
          :total="total" 
          layout="prev, pager, next, jumper, ->, sizes, total" 
          @current-change="getSpuList"
          @size-change="handleSizeChange" />
      </div>
      <SpuForm :visible.sync="isShowSpuForm" ref="spuForm" 
        @success="handleSuccess" @cancel="handleCancel"></SpuForm>
      <!-- <SpuForm :visible="isShowSpuForm" @update:visible="isShowSpuForm=$event"></SpuForm> -->
    </el-card>

    <el-dialog :title="`${spu.spuName} => SKU列表`" :visible.sync="isShowDialog">
      <el-table :data="skuList" v-loading="isLoading">
        <el-table-column prop="skuName" label="名称"></el-table-column>
        <el-table-column property="price" label="价格(元)"></el-table-column>
        <el-table-column property="weight" label="重量(KG)"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{row}">
            <img :src="row.skuDefaultImg" alt="" style="width:100px;height:100px;">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from '../components/SpuForm'
export default {
  name: 'SpuList',

  data () {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      spuList: [], // 当前页的spu数组
      total: 0, // 总数量
      page: 1, // 当前页码
      limit: 5, // 每页数量
      isShowSpuForm: false, // 是否显示Spu的添加/修改界面

      isLoading: false, // 是否正在加载中
      isShowDialog: false, // 是否显示sku列表的dialog
      spu: {}, // 要显示sku列表的spu对象
      skuList: [], // 指定spu下的sku列表
    }
  },
  
  async mounted () {
    // const result = await this.$API.spu.getList(1, 3, 61)
    // console.log('result---', result)
    this.category1Id = 2
    this.category2Id = 13
    this.category3Id = 61
    this.getSpuList(1)
  },

  methods: {

    /* 
    显示指定SPU下的SKU列表
    */
    async showSkuList (spu) {

      // 更新一个数据
      this.isShowDialog = true
      this.spu = spu
      this.skuList = [] // 重置一下前面显示的列表数据
      this.isLoading = true // 显示loading

      // 请求获取sku列表显示
      const result = await this.$API.sku.getListBySpuId(spu.id)
      this.isLoading = false // 隐藏loading
      const skuList = result.data
      this.skuList = skuList
    },

    /* 
    删除指定spu
    */
    async deleteSpu (spuId) {
      // 发送ajax请求
      const result = await this.$API.spu.remove(spuId)
      // 提示成功
      this.$message.success('删除SPU成功')
      // 重新获取列表显示
      this.getSpuList()
    },

    /* 
    保存(添加/更新)成功的事件回调
    */
    handleSuccess () {
      // 重新获取SPU列表
      // 如果是更新获取当前页, 如果是添加获取第一页
      this.getSpuList(this.spuId ? this.page : 1)

      // 重置spuId
      this.spuId = null
    },

    /* 
    取消保存的事件回调
    */
    handleCancel () {
      // 重置spuId
      this.spuId = null
    },

    /* 
    显示spu详情信息的修改界面
    */
    showSpuUpdate (spu) { // spu是spuList中一个包含spu基本信息的对象  / spuInfo包含了更多的信息
      // 当显示更新界面前, 保存spuId
      this.spuId = spu.id  // 这个spuId不是响应式

      // 显示SpuForm界面
      this.isShowSpuForm = true
      // 通知/让spuForm组件对象(更新)初始请求加载需要显示的数据
      this.$refs.spuForm.initLoadUpdateData(spu.id)
    },

    /* 
    显示spu详情信息的添加界面
    */
    showSpuAdd () { 
      // 显示SpuForm界面
      this.isShowSpuForm = true
      // 通知/让spuForm组件对象(添加)初始请求加载需要显示的数据
      this.$refs.spuForm.initLoadAddData(this.category3Id)
    },

    /* 
    处理分类发生改变的回调
    */
    handleCategoryChange ({categoryId, level}) {
      if (level===1) {
        // 重置数据(二/三级/列表数据)
        this.category2Id = ''
        this.category3Id = ''
        this.spuList = []
        this.total = 0
        // 保存到对应的分类ID上
        this.category1Id = categoryId
      } else if (level===2) {
        // 重置数据(三级/列表数据)
        this.category3Id = ''
        this.spuList = []
        this.total = 0
        // 保存到对应的分类ID上
        this.category2Id = categoryId
      } else {
        // 保存到对应的分类ID上
        this.category3Id = categoryId
        // 发请求获取SPU列表显示
        this.getSpuList(1)
      }
    },

    /* 
    异步获取指定页码SPU列表显示
    */
    async getSpuList (page=1) {
      this.page = page
      const result = await this.$API.spu.getList(page, this.limit, this.category3Id)
      const {records, total} = result.data
      this.spuList = records
      this.total = total
    },

    /* 
    每页数量改变的监听回调
    */
    handleSizeChange (limit) {
      this.limit = limit
      this.getSpuList()
    } 
  },

  components: {
    SpuForm
  }
}
</script>
