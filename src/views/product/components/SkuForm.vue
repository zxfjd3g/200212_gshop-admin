<template>
  <el-form label-width="100px">
    <el-form-item label="SPU 名称">
      <span>荣耀V30 Pro+-</span>
    </el-form-item>

    <el-form-item label="SKU 名称">
      <el-input type="text" placeholder="SKU 名称"></el-input>
    </el-form-item>
    
    <el-form-item label="价格(元)">
      <el-input type="number" placeholder="SKU 价格"></el-input>
    </el-form-item>

    <el-form-item label="重量(千克)">
      <el-input type="number" placeholder="SKU 重量"></el-input>
    </el-form-item>

    <el-form-item label="规格描述">
      <el-input type="textarea" placeholder="SKU 规格描述" rows="4"></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form inline label-width="100px">
        <el-form-item :label="attr.attrName" style="margin: 5px 0" v-for="attr in attrList" :key="attr.id">
          <el-select value='' placeholder="请输入">
            <el-option :label="value.valueName" :value="value.id" v-for="value in attr.attrValueList" :key="value.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form inline label-width="100px">
        <el-form-item :label="attr.saleAttrName" style="margin: 5px 0" 
          v-for="attr in spuSaleAttrList" :key="attr.id">
          <el-select value='' placeholder="请输入">
            <el-option :label="value.saleAttrValueName" :value="value.id" 
              v-for="value in attr.spuSaleAttrValueList" :key="value.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table border :data="spuImageList">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>

        <el-table-column label="图片">
          <template slot-scope="{row}">
            <img :src="row.imgUrl" alt="" style="width:100px;height:100px;">
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="imgName"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row, $index}">
            <el-button type="primary" size="small">设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button>取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'SkuForm',

  data () {
    return {
      spu: {}, // 所属的spu对象

      attrList: [], // 平台属性数组
      spuSaleAttrList: [], // spu销售属性数组
      spuImageList: [], // spu图片数组
    }
  },

  methods: {
    /* 
    初始化请求加载添加界面需要的数据
    */
    initLoadAddData (spu) {
      this.spu = spu

      // 请求获取数据显示
      this.getAddData()
    },

    /* 
    根据3个级别的分类ID获取所有平台属性列表: attr.getList (category1Id, category2Id, category3Id) 
		根据spuId获取SPU图片列表: sku.getSpuImageList(spuId)
    根据spuId获取spu销售属性列表: sku.getSpuSaleAttrList(spuId)
    
    只有当都成功时才更新数据显示  ===>  Promise.all(promises)
    */
    getAddData () {
      // 取出请求条件数据
      const {category1Id, category2Id, category3Id, id} = this.spu

      // 连续发送3个异步请求, 并得到其对应的promise
      const promise1 = this.$API.attr.getList (category1Id, category2Id, category3Id) 
      const promise2 = this.$API.sku.getSpuSaleAttrList(id)
      const promise3 = this.$API.sku.getSpuImageList(id)

      // 只有当都成功时才更新数据显示  ===>  Promise.all(promises)
      Promise.all([promise1, promise2, promise3]).then(results => {
        const attrList = results[0].data
        const spuSaleAttrList = results[1].data
        const spuImageList = results[2].data

        // 更新数据
        this.attrList = attrList
        this.spuSaleAttrList = spuSaleAttrList
        this.spuImageList = spuImageList
      })
    }
  }
}
</script>
