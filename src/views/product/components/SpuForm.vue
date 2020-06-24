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
    <el-form-item label="销售属性">
      <el-select value="" 
        :placeholder="unUsedSaleAttrList.length===0 ? '没有啦!' : `还有${unUsedSaleAttrList.length}未选择`">
        <el-option :label="attr.name" :value="attr.id" v-for="attr in unUsedSaleAttrList" :key="attr.id"></el-option>
      </el-select>

      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

      <el-table border style="margin-top: 20px" :data="spuInfo.spuSaleAttrList">
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="属性名" prop="saleAttrName" width="150"></el-table-column>
        <el-table-column label="属性值名称列表">
          <template slot-scope="{row, $index}">
            <el-tag
              :key="attrValue.id"
              v-for="attrValue in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
              ><!-- @close="handleClose(tag)" -->
              {{attrValue.saleAttrValueName}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.edit"
              size="small"
            >
            <!-- @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm" -->
            </el-input>
            <el-button v-else class="button-new-tag" size="small">+ 添加</el-button>
            <!-- @click="showInput" -->
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
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

  computed: {
    /* 
    未使用的销售属性的数组
    */
    unUsedSaleAttrList () {
      // 1. 取出依赖数据
      // 所有销售属性列表 saleAttrList
      const {saleAttrList} = this
      // spu中已有销售属性列表 spuInfo.spuSaleAttrList
      const {spuSaleAttrList} = this.spuInfo

      // 2. 计算产生一个新数组
      // 对saleAttrList进行过滤, 去掉已经在spuInfo.spuSaleAttrList存在的
      // 判断的依据是: name与saleAttrName就否相同
      const arr = saleAttrList.filter(attr => {
        /* 
        {
          "name": "选择套装"
        }

        {
					"saleAttrName": "选择版本",
				}
        */
        // attr.name===spuSaleAttrList中任意一个元素对象的saleAttrName属性值
        // const spuAttr = spuSaleAttrList.find(spuAttr => spuAttr.saleAttrName===attr.name)
        // spuAttr 如果有就说明已存在了, attr就需要过滤掉(返回false)
        // return !spuAttr
        // 是否已在存在对应的销售属性
        const isExsit = spuSaleAttrList.some(spuAttr => spuAttr.saleAttrName===attr.name)
        return !isExsit
      })

      // 3. 返回它
      return arr
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

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>