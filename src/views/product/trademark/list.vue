<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAdd">添加</el-button>

    <el-table
      style="margin: 20px 0"
      :data="trademarks"
      border
    >
      <el-table-column label="序号" type="index" width="80" align="center"/>

      <!-- 
        表格的一列显示的就是数据的属性值: prop来指定
        如果不是(需要显示一个特定的标签结构): 使用作用域插槽
      -->
      <el-table-column prop="tmName" label="品牌名称"/>
      
      <el-table-column label="品牌LOGO">
         <template slot-scope="scope">
           <img :src="scope.row.logoUrl" style="width: 100px; height:60px;"/>
        </template>
      </el-table-column>
      
      <el-table-column label="操作">
         <template slot-scope="{row, $index}">
           <el-button type="warning" size="mini" icon="el-icon-edit">修改</el-button>
           <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align: center"
      :current-page="page"
      :page-sizes="[3, 6, 9]"
      :page-size="limit"
      :total="total"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @current-change="getTrademarks"
      @size-change="handleSizeChange"
    />

    <el-dialog title="添加品牌" :visible.sync="isShowDialog">
      <el-form :model="form" style="width: 80%">
        <el-form-item label="品牌名称" label-width="100px">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过50kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="isShowDialog = false">确 定</el-button>
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

      imageUrl: '', // 上传的图片url
    }
  },

  mounted () {
    // 异步获取第一页列表显示
    this.getTrademarks() // 如果不用this报错: getTrademarks is not defined
  },

  methods: {

    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },

    /* 
    显示添加的界面
    */
    showAdd () {
      this.isShowDialog = true
    },

    /* 
    当修改每页数量的监听回调
    */
    handleSizeChange (pageSize) {
      // 更新limit
      this.limit = pageSize
      // 重新获取第1页显示
      this.getTrademarks(1) // 也可不传1
    },

    /* 
    异步获取指定页码的列表数据显示
    */
    async getTrademarks (page=1) {
      // 更新当前页码
      this.page = page
      // 调用接口请求函数发获取列表数据的请求
      const result = await this.$API.trademark.getList(page, this.limit)
      // 如果成功了, 更新数据显示
      if (result.code===200) {
        const {records, total} = result.data
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