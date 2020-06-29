<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加</el-button>

    <el-table v-loading="loading" style="margin: 20px 0" :data="trademarks" border>
      <el-table-column label="序号" type="index" width="80" align="center" />

      <!-- 
        表格的一列显示的就是数据的属性值: prop来指定
        如果不是(需要显示一个特定的标签结构): 使用作用域插槽
      -->
      <el-table-column prop="tmName" label="品牌名称" />

      <el-table-column label="品牌LOGO">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" style="width: 100px; height:60px;" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="{row, $index}">
          <el-button type="warning" size="mini" icon="el-icon-edit" @click="showUpdate(row)">修改</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination style="text-align: center" :current-page="page" :page-sizes="[3, 6, 9]" :page-size="limit"
      :total="total" layout="prev, pager, next, jumper, ->, sizes, total" @current-change="getTrademarks"
      @size-change="handleSizeChange" />

    <el-dialog :title="form.id ? '修改品牌' : '添加品牌'" :visible.sync="isShowDialog">
      <el-form :model="form" :rules="rules" ref="ruleForm" style="width: 80%">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">

          <!-- 
            show-file-list: 指定是否显示上传图片的列表, 如果是false, 只显示一张
            action: 处理上传图片请求的地址  ==> 通过代理解决跨域的问题
            on-success: 用来指定上传成功时的回调函数
            before-upload: 在准备发上传请求前调用, 如果返回false不发请求, 用来检查文件类型和大小
          -->
          <el-upload class="avatar-uploader" 
            :action="`${$BASE_API}/admin/product/fileUpload`" 
            :show-file-list="false"
            :on-success="handleAvatarSuccess" 
            :before-upload="beforeAvatarUpload">
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过50kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'Trademark',

    data() {
      return {
        trademarks: [], // 当前页的品牌列表
        total: 0, // 总数量
        page: 1, // 当前页码
        limit: 3, // 每页数量

        isShowDialog: false, // 是否显示添加的对话框
        form: { // 用来收集品牌添加的数据
          tmName: '', // 品牌名称
          logoUrl: '', // 品牌logo的url
        },
        loading: false, // 是否正在请求中,

        /* 
         品牌名称:
            必须输入   输入过程中触发校验
            长度必须在2-10个之间   失去焦点时触发校验
        品牌LOGO:
            必须有    点击提交按钮
        */
        rules: {
          tmName: [{
              required: true,
              message: '请输入名称',
              // trigger: 'change'  // 默认就是change, 也就是输入过程中触发检查
            },
            // 使用内置校验规则实现
            /* 
            {
              min: 2,
              max: 10,
              message: '长度必须在2-10个之间',
              trigger: 'blur' // 触发校验的时机是失去焦点
            } */
            // 使用自定义验证
            {
              validator: this.validateTmName,
              trigger: 'blur' // 触发校验的时机是失去焦点
            }
          ],
          logoUrl: [{
            required: true,
            message: 'LOGO必须指定',
          }],

        }
      }
    },

    mounted() {
      // 异步获取第一页列表显示
      this.getTrademarks() // 如果不用this报错: getTrademarks is not defined
    },

    methods: {

      /* 
      自定义校验品牌名称
      value: 需要进行校验的数据值
      callback: 用来指定校验是否通过的函数, 如果执行没有传递参数代表通过, 如果传递了代表不通过, 且指定的就是错误信息

      长度必须在2-10个之间
      */
      validateTmName (rule, value, callback) {
        if (value.length<2 || value.length>10) {
          // callback(new Error('长度必须在2-10个之间'))
          callback('长度必须在2-10个之间2')  // 不通过
        } else {
          callback() // 通过
        }
      },

      /* 
      删除指定的品牌
      */
      remove(trademark) {
        this.$confirm(`确定删除 ${trademark.tmName} 吗?`, '提示', {
          type: 'warning'
        }).then(async () => { // 点击确定的回调
          // 发删除品牌的请求
          const result = await this.$API.trademark.remove(trademark.id)
          // 如果成功了, 提示成功, 重新获取列表(哪一页?)
          if (result.code === 200) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })

            // 哪一页?  显示上一页(当前页的列表数据只剩下1个)  否则显示当前页 
            // 如果当前是第1页且只剩下1条数据 ==> 请求第1页数据(当前页)
            this.getTrademarks(this.trademarks.length === 1 && this.page > 1 ? this.page - 1 : this.page)
          } else {
            // 如果失败了, 提示删除失败
            this.$message({
              type: 'error',
              message: '删除失败'
            })
          }
        }).catch(() => { // 点击取消的回调
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      /* 
      添加或更新
      */
      addOrUpdate() {
        // 对所有表单项进行统一校验
        this.$refs['ruleForm'].validate(async (valid) => { // 校验完成的回调
          // 如果通过, 才进行后面请求的操作
          if (valid) {
            // 准备数据
            const trademark = this.form
            let result
            // 提交请求
            if (trademark.id) { // 更新
              result = await this.$API.trademark.update(trademark)
            } else { // 添加
              result = await this.$API.trademark.add(trademark)
            }
            // 如果成功, 提示成功, 并获取新的列表显示
            if (result.code === 200) {
              this.$message.success(`${trademark.id ? '更新' : '添加'}成功!`)
              // 关闭当前dialog
              this.isShowDialog = false
              // 重新获取列表显示()
              // 哪一页?  更新显示当前页, 添加显示第一页
              this.getTrademarks(trademark.id ? this.page : 1)
            } else { // 如果失败, 提示失败
              this.$message.success(`${trademark.id ? '更新' : '添加'}失败!`)
            }
          } else { // 可以不用写
            console.log('校验不通过')
          }
        })
      },

      /* 
      上传成功时的回调函数
      res: 上传请求返回的响应体数据对象  {code: 200, data: 图片url}
      */
      handleAvatarSuccess(res, file) {
        // console.log('handleAvatarSuccess()', res)
        // 保存请求返回的图片url数据
        this.form.logoUrl = res.data
      },

      /* 
      在准备发上传请求前调用, 如果返回false不发请求, 用来检查文件类型和大小
      对图片的要求: 
        类型: jpg/png  ===> image/jpeg | image/png
        大小: <50K
      */
      beforeAvatarUpload(file) {
        // const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'   // 利用数组来判断
        const isJPGOrPNG = ['image/jpeg', 'image/png'].indexOf(file.type) >= 0
        const isLt50K = file.size / 1024 < 50

        if (!isJPGOrPNG) {
          this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
        }
        if (!isLt50K) {
          this.$message.error('上传头像图片大小不能超过 50K!');
        }
        return isJPGOrPNG && isLt50K
      },

      /* 
      显示修改界面
      trademark: 包含id/tmName/logoUrl的对象
      */
      showUpdate(trademark) {
        // 将trademark指定为form

        /* 
        2个引用变量(form/trademark)指向同一个对象, 
        如果通过一个(form)引用变量改变对象内部的属性(tmName)
        另一个引用变量(trademark)就看到了最新的属性值
        */
        // this.form = trademark  // 有问题
        /* 
        对trademark进行一个浅拷贝
        */
        this.form = {
          ...trademark
        }

        // 更新isShowDialog为true
        this.isShowDialog = true
      },

      /* 
      显示添加的界面
      */
      showAdd() {
        // 清除/重置form中的数据
        this.form = {
          tmName: '',
          logoUrl: '',
        }

        // 显示dialog
        this.isShowDialog = true  
        /* 
        数据变化必然导致界面变化
        但界面是数据改变后异步更新的  ===> 此时界面还没有变化(就是没有显示)
        */

        // 在显示了提示信息后, 立即清除提示信息
        // 此时dialog界面还没有显示 ==> 必须延迟到界面更新显示后再执行
        this.$nextTick(() => {// 回调函数是迟延到界面更新后执行的   面试说
          this.$refs.ruleForm.clearValidate()
        })
      },

      /* 
      当修改每页数量的监听回调
      */
      handleSizeChange(pageSize) {
        // 更新limit
        this.limit = pageSize
        // 重新获取第1页显示
        this.getTrademarks(1) // 也可不传1
      },

      /* 
      异步获取指定页码的列表数据显示
      */
      async getTrademarks(page = 1) {
        // 更新当前页码
        this.page = page
        this.loading = true // 显示loading
        // 调用接口请求函数发获取列表数据的请求
        const result = await this.$API.trademark.getList(page, this.limit)
        this.loading = false // 隐藏loading
        // 如果成功了, 更新数据显示
        if (result.code === 200) {
          const {
            records,
            total
          } = result.data
          this.trademarks = records
          this.total = total
        } else { // 如果失败, 提示
          /* 
          this.$message({
            type: 'error',
            message: '获取分页列表失败'
          }) */
          this.$message.error('获取分页列表失败')
        }
      }
    }
  }

</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

</style>
