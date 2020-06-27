<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" ref="cs"/>
    </el-card>
    <el-card style="margin-top:20px;">
      <div v-show="isShowList">
        <el-button type="primary" icon="el-icon-plus" @click="showAdd" :disabled="!category3Id">添加属性</el-button>
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
              
              <el-popconfirm :title="`确定删除 ${row.attrName} 吗?`" 
                @onConfirm="deleteAttr(row.id)">
                 <HintButton slot="reference" title="删除属性" type="danger" icon="el-icon-delete" size="mini"></HintButton>
              </el-popconfirm>
              
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

        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" 
          :disabled="!attr.attrName">添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>

        <el-table border style="margin: 20px 0" :data="attr.attrValueList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{row, $index}">
              <el-input :ref="$index" v-if="row.edit" v-model="row.valueName" placeholder="请输入名称"
                @blur="toList(row)" @keyup.enter.native="toList(row)" size="mini"/>
              <span v-else @click="toEdit(row, $index)" style="display: inline-block; width: 100%">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row, $index}">
              <el-popconfirm :title="`确定删除 ${row.valueName} 吗?`" 
                @onConfirm="attr.attrValueList.splice($index, 1)">
                 <hint-button slot="reference" title="删除" type="danger" icon="el-icon-delete" size="mini"></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" :disabled="!attr.attrName || attr.attrValueList.length===0"
          @click="addOrUpdate">保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </div>

    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
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

  watch: {
    // 监视isShowList的变化
    isShowList (value) {
      // 让分类列表组件(子组件)的disabled变为true/false
      // 父组件主动更新子组件的数据
      this.$refs.cs.disabled = !value
    }
  },

  async mounted () {
    // const result = await this.$API.attr.getList(2, 13, 61)
    // console.log('result', result)
    // this.category1Id = 2
    // this.category2Id = 13
    // this.category3Id = 61
    // this.getAttrs()
  },

  methods: {
    /* 
    删除属性
    */
    async deleteAttr (id) {
      const result = await this.$API.attr.remove(id)
      if (result.code===200) {
        this.$message.success('删除属性成功')
        this.getAttrs()
      } else {
        this.$message.error('删除属性失败')
      }
    },

    /* 
    添加/更新属性
    */
    async addOrUpdate () {
      // 准备数据 
      const {attr} = this

      // 在发请求需要对数据进行必要的整理与检查操作
      /* 
      没有指定属性值名称的属性也会提交给后台
      提交的数据中包含没必要的edit属性
      如果一个属性值名称都没有, 也提交了请求
      */
     // 对属性值列表进行过滤: 过滤掉属性值名称为''
      attr.attrValueList = attr.attrValueList.filter(attrValue => {
        if (attrValue.valueName) {
          // 删除attrValue对象中的edit属性
          delete attrValue.edit
          return true
        }
        return false
      })

      // 如果attr.attrValueList是空数组, 没有必要发请求, 直接提示
      if (attr.attrValueList.length===0) {
        this.$message.warning('至少指定一个属性值名称')
        return
      }

      try {
         // 发添加或更新的请求
        const result= await this.$API.attr.save(attr)  // attr中有id是更新, 没有id是保存
        // 提示成功
        this.$message.success('保存属性成功')
        // 显示列表界面
        this.isShowList = true
        // 重新获取属性列表显示
        this.getAttrs()
      } catch (error) { // 可以不用catch
        // 如果失败了, 提示请求失败
        // this.$message.error('保存属性失败')
      }
    },

    /* 
    将指定属性名称从编辑模式变为查看
    */
    toList (attrValue) {
      // 如果输入数据为空的, 那还是编辑模式
      if (attrValue.valueName.trim()==='') return
      // 如果当前输入的与原本已有重复了, 那还是编辑模式并提示
      const isRepeat = this.attr.attrValueList
            .filter(value => value.valueName===attrValue.valueName).length===2
      if (isRepeat) {
        this.$message.warning('属性名称不能重复')
        attrValue.valueName = '' // 清除输入
        return
      }

      // 更新edit属性为false
      attrValue.edit = false
    },

    /* 
    将指定属性名称从查看模式变为编辑
    attrValue中很有可能没有edit属性
    给响应式对象添加新属性
      如果直接添加, 这个属性不是响应 ==> 界面不会自动更新
      $set()/set()添加, 这个属性是响应式的  ==> 界面就会自动更新
    */
    toEdit (attrValue, index) {
      // 如果attrValue对象中有edit属性
      if (attrValue.hasOwnProperty('edit')) {
        attrValue.edit = true
      } else { // 如果没有
        this.$set(attrValue, 'edit', true)
      }

      // 让当前对应的Input组件对象, 通过调用其focus()来获得焦点
      // 必须在显示输入框后才去focus()
      this.$nextTick(() => this.$refs[index].focus())
    },

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

      // 让最后一个输入框自动获得焦点
      this.$nextTick(() => this.$refs[this.attr.attrValueList.length-1].focus())
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
      // this.attr = attr  // 有问题: 列表界面中的attrs与修改界面中的attr指向的是同一个平台属性对象
      // this.attr = {...attr} // 对列表中的attr进行浅拷贝后, 指定为修改界面的attr ==> 属性名修改可以取消了
      //  列表项的attr的attrValueList与修改界面的attr的attrValueList是同一个数组
      // attr.attrValueList===this.attr.attrValueList
      // console.log('---', attr.attrValueList===this.attr.attrValueList) // true
      this.attr =  cloneDeep(attr)  // 对列表项的attr进行深克隆并指定给修改界面的attr

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
        this.attrs = [] // 重置属性列表

        this.category1Id = categoryId
      } else if (level===2) {
        // 重置三级分类的数据
        this.category3Id = null
        this.attrs = [] // 重置属性列表

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
