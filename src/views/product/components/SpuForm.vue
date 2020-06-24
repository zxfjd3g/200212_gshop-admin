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
              v-for="(attrValue, index) in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
              @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
              {{attrValue.saleAttrValueName}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.edit"
              :ref="$index"
              v-model.trim="row.saleAttrValueName"
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
          <template slot-scope="{$index}">
            <hint-button title="删除" type="danger" icon="el-icon-delete" size="mini" 
              @click="spuInfo.spuSaleAttrList.splice($index, 1)"/>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
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
    重置数据
    */
    resetData () {
      this.dialogImageUrl = '' // 大图的url
      this.dialogVisible = false // 标识大图dilaog是否显示

      this.spuId = '' // SPU ID
      this.spuInfo =  { // SPU详情信息对象
        category3Id: null, // 3级分类ID
        spuName: '', // spu名称
        description: '', // spu描述
        tmId: null, // spu的品牌id
        spuSaleAttrList: [], // spu的销售属性列表
        spuImageList: [], // spu图片列表
      } 
      this.spuImageList = [] // SPU图片列表
      this.trademarkList = [] // 品牌列表
      this.saleAttrList = [] // 销售属性列表
      this.attrIdAttrName = '' // 用来收集销售属性id与name   id:name
    },

    /* 
    {
      "category3Id": 61,
      "spuName": "aa",
      "description": "aa描述",
      "tmId": 2,
      "spuSaleAttrList": [
        {
          "baseSaleAttrId": "1",
          "saleAttrName": "选择颜色",
          "spuSaleAttrValueList": [
            {
              "saleAttrValueName": "a",
              "baseSaleAttrId": "1"
            }
          ]
        }
      ],
      "spuImageList": [{
        "imgName": "下载 (1).jpg",
        "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
      }]
    }
    */
    /* 
    发请求保存数据
    */
    async save () {
      // 取出数据
      const {spuInfo, spuImageList} = this

      /* 在发请求前, 需要对参数数据做必要整理操作 */
      // 整理1: spuImageList
      /* 
      从后台获取的图片文件对象的结构
			{
			    "id": 333,
			    "spuId": 26,
			    "imgName": "rBHu8l6UcKyAfzDsAAAPN5YrVxw870.jpg",
			    "imgUrl": "http://47.93.148.192:8080/xxx.jpg",
				 "name": "rBHu8l6UcKyAfzDsAAAPN5YrVxw870.jpg",
				 "url":  "http://47.93.148.192:8080/xxx.jpg"
			}
		新上传的图片文件对象的结构
			{
				name: "e814ec6fd86c5a8c.jpg"
				response: {
					data: "http://182.92.128.115:8080/group1/xxx.jpg"
				}
				url: "blob:http://localhost:9529/a5199d82-0811-442d-9ec2-dafae83d9ed9"
			}
		提交保存/更新SPU请求的图片对象的结构(目标):
			 {
			    "imgName": "下载 (1).jpg",
			    "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
			 }
      */
      spuInfo.spuImageList = spuImageList.map(item => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.imgUrl
      }))

      // 整理2: spuSaleAttrList
      /* 
      1. 过滤掉没有属性值的属性对象
      2. 删除一些不必要的属性数据(为了界面显示而添加: saleAttrValueName/edit)
      */
      spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(attr => {
        delete attr.edit
        delete attr.saleAttrValueName
        
        return attr.spuSaleAttrValueList.length>0
      })

      // 发送ajax请求
      const result = await this.$API.spu.addUpdate(spuInfo)

      // 如果成功了
      if (result.code===200) {
        this.$message.success('保存SPU成功')
        // 显示列表界面
        this.$emit('update:visible', false)
        // 通知父组件保存成功了
        this.$emit('success')
        // 重置数据
        this.resetData()
      } else { // 如果失败了
        this.$message.error('保存SPU失败')
      }
    },

    /* 
    返回
    */
    back () {
      // this.$parent.$parent.isShowSpuForm = false
      // 分发.sync内部绑定的update:visible的自定义事件
      this.$emit('update:visible', false)
      // 通知父组件取消了
      this.$emit('cancel')
      // 重置数据
      this.resetData()
    },

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

      // 检查1: 必须有输入, 否则自动变为查看模式
      if (!saleAttrValueName) { // 可能为''或者undefined
        spuSaleAttr.edit = false
        return
      }
      // 检查2: 不能与已有重复
      const isRepeat = spuSaleAttr.spuSaleAttrValueList.some(value => value.saleAttrValueName==saleAttrValueName)
      if (isRepeat) {
        // 提示重复
        this.$message.warning('不能重复')
        // 让当前input自动获得焦点
        this.$nextTick(() => this.$refs[index].focus())
        return
      }
      
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