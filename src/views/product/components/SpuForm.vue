<template>
  <el-form label-width="100px" v-show="visible">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>

    <el-form-item label="品牌">
      <el-select v-model="spuInfo.tmId" placeholder="请选择品牌"> 
        <el-option :label="tm.tmName" :value="tm.id" v-for="tm in trademarkList" :key="tm.id"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input type="textarea" placeholder="SPU描述" rows="4" v-model="spuInfo.description"></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <!-- 
        file-list: 指定显示的图片列表数组 [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]
      -->
      <el-upload
        :file-list="spuImageList"
        action="https://jsonplaceholder.typicode.com/posts/"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove">
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </el-form-item>
    <el-form-item label="SPU图片">
      <el-select value="" placeholder="xxx">
        <el-option label="A" value="1"></el-option>
        <el-option label="B" value="2"></el-option>
      </el-select>

      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

      <el-table border style="margin-top: 20px">
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="属性名"></el-table-column>
        <el-table-column label="属性值名称列表"></el-table-column>
        <el-table-column label="操作">
          <hint-button title="删除" type="danger" icon="el-icon-delete" size="mini" />
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button @click="back">取消</el-button>
    </el-form-item>

  </el-form>
</template>

<script>
export default {
  name: 'SpuForm',

  props: {
    visible: Boolean
  },

  data () {
    return {
      dialogImageUrl: '',
      dialogVisible: false,

      spuId: '', // SPU ID
      spuInfo: { // SPU详情信息对象
        category3Id: null, // 3级分类ID
        spuName: '', // spu名称
        description: '', // spu描述
        tmId: null, // spu的品牌id
        spuSaleAttrList: [], // spu的销售属性列表
        spuImageList: [], // spu图片列表
      }, 
      spuImageList: [], // SPU图片列表
      trademarkList: [], // 品牌列表
      saleAttrList: [], // 销售属性列表
    }
  },

  methods: {

    /* 
    请求加载更新界面初始显示需要的数据
      1). 根据spuId请求获取spuInfo  spu.get(spuId)
      2). 根据spuId请求获取spuImageList  sku.getSpuImageList (spuId)
      3). 获取所有品牌的列表trademarkList trademark.getList()
      4). 获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
    */
    initLoadUpdateData (spuId) {
      // 保存spuId
      this.spuId = spuId
      // 发4个请求获取数据
      this.getSpuInfo()
      this.getSpuImageList()
      this.getTrademarkList()
      this.getSaleAttrList()
    },

    /* 
    请求加载添加界面初始显示需要的数据
      1). 获取所有品牌的列表trademarkList trademark.getList()
      2). 获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
    */
    initLoadAddData (category3Id) {
      // 保存category3Id到spuInfo
      this.spuInfo.category3Id = category3Id
      // 发2个请求获取数据
      this.getTrademarkList()
      this.getSaleAttrList()
    },

    // 1). 根据spuId请求获取spuInfo  spu.get(spuId)
		// 2). 根据spuId请求获取spuImageList  sku.getSpuImageList (spuId)
		// 3). 获取所有品牌的列表trademarkList trademark.getList()
    // 4). 获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
    /* 
    根据spuId请求获取spuInfo
    */
    async getSpuInfo () {
      // 发ajax请求获取数据
      const result = await this.$API.spu.get(this.spuId)
      // 取出data数据
      const spuInfo = result.data
      // 更新目标
      this.spuInfo = spuInfo
    },

    /* 
    根据spuId请求获取spuImageList  sku.getSpuImageList (spuId)
    */
    async getSpuImageList () { 
      // 发ajax请求获取数据
      const result = await this.$API.sku.getSpuImageList(this.spuId)
      // 取出data数据
      const spuImageList = result.data

      // 给spuImageList中每个图片对象都添加name和url属性, 属性值为对应的属性值
      spuImageList.forEach(item => {
        item.name = item.imgName
        item.url = item.imgUrl
      })

      // 更新目标
      this.spuImageList = spuImageList
    },

    /* 
    获取所有品牌的列表trademarkList trademark.getList()
    */
    async getTrademarkList () {
      // 发ajax请求获取数据
      const result = await this.$API.trademark.getList()
      // 取出data数据
      const trademarkList = result.data
      // 更新目标
      this.trademarkList = trademarkList
    },

    /* 
    获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
    */
    async getSaleAttrList () {
      // 发ajax请求获取数据
      const result = await this.$API.spu.getSaleAttrList()
      // 取出data数据
      const saleAttrList = result.data
      // 更新目标
      this.saleAttrList = saleAttrList
    },

    /* 
    返回
    */
    back () {
      // this.$parent.$parent.isShowSpuForm = false
      // 分发.sync内部绑定的update:visible的自定义事件
      this.$emit('update:visible', false)
    },

    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    }
  }
}
</script>

