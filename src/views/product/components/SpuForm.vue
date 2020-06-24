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
        action: 指定上传图片的路径
        list-type: 指定图片列表的风格样式
        on-preview: 指定点击预览大图的回调函数
        on-remove: 点击删除的回调函数
      -->
      <el-upload
        :file-list="spuImageList"
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleUploadSuccess">
        <i class="el-icon-plus"></i>
      </el-upload>
      <!-- 显示大图的dialog -->
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="">
      </el-dialog>
    </el-form-item>
    <el-form-item label="销售属性">
      <el-select v-model="attrIdAttrName"
        :placeholder="unUsedSaleAttrList.length===0 ? '没有啦!' : `还有${unUsedSaleAttrList.length}未选择`">
        <el-option :label="attr.name" :value="attr.id+':'+attr.name" v-for="attr in unUsedSaleAttrList" :key="attr.id"></el-option>
      </el-select>

      <el-button type="primary" icon="el-icon-plus" :disabled="!attrIdAttrName" 
        @click="addSpuSaleAttr">添加销售属性</el-button>

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
              >
              {{attrValue.saleAttrValueName}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.edit"
              :ref="$index"
              v-model="row.saleAttrValueName"
              size="small"
              placeholder="名称"
              @keyup.enter.native="addSpuSaleAttrValue(row, $index)"
              @blur="addSpuSaleAttrValue(row, $index)"
            >
            </el-input>
            <el-button v-else class="button-new-tag" size="small" 
              @click="showInput(row, $index)">+ 添加</el-button>
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
      dialogImageUrl: '', // 大图的url
      dialogVisible: false, // 标识大图dilaog是否显示

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
      attrIdAttrName: '', // 用来收集销售属性id与name   id:name
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
    添加一个新的Spu销售属性值对象
    向当前属性对象的spuSaleAttrValueList中添加一个属性值对象
			 {
        saleAttrValueName: '',
        baseSaleAttrId: "1"
      }
    */
    addSpuSaleAttrValue (spuSaleAttr, index) {
      // 取出相关数据
      const {saleAttrValueName, baseSaleAttrId} = spuSaleAttr
      
      // 添加一个新的spu销售属性值对象
      spuSaleAttr.spuSaleAttrValueList.push({
        saleAttrValueName,
	      baseSaleAttrId
      })

      // 变为查看模式
      spuSaleAttr.edit = false
      // 清除输入数据
      spuSaleAttr.saleAttrValueName = ''
    },

    /* 
    显示当前行的输入框
    */
    showInput (spuSaleAttr, index) {
      // 指定edit为true ==> 显示输入框
      if (spuSaleAttr.hasOwnProperty('edit')) {
        spuSaleAttr.edit = true
      } else {
        this.$set(spuSaleAttr, 'edit', true)
      }

      // 让index对应的input自动获得焦点
      this.$nextTick(() => this.$refs[index].focus())
    },

    /* 
    添加一个新的SPU销售属性对象
    */
    addSpuSaleAttr () {
      // 取出销售属性的id和name
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(':')   // id:name ==> [id值, name值]
      // 创建一个spu销售属性对象
      const spuSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [], // 用于保存销售属性值对象的数组
      }
      // 添加到spuInfo.spuSaleAttrList中
      this.spuInfo.spuSaleAttrList.push(spuSaleAttr)

      // 删除收集的attrIdAttrName
      this.attrIdAttrName = ''
    },

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

    /* 
    上传图片成功后的回调
    response: 请求响应对象
    file: 当前上传成功的图片对象
    fileList: 所有已上传的图片对象的数组
    */
    handleUploadSuccess (response, file, fileList) {
      console.log('handleUploadSuccess', response, file, fileList)
      this.spuImageList = fileList
    },

    /* 
    点击删除图片的回调函数
    file: 被删除的图片对象
    fileList: 剩下的图片对象的数组
    */
    handleRemove(file, fileList) {
      console.log('handleRemove()', file, fileList)
      this.spuImageList = fileList
    },
    /* 
    显示指定的大图片
    file: 包含图片信息的对象
    */
    handlePictureCardPreview(file) {
      // 指定要显示的大图url
      this.dialogImageUrl = file.url
      // 显示大图dilaog
      this.dialogVisible = true
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