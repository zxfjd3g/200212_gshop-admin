<template>
  <div>
    <el-button type="primary" icon="el-icon-plus">添加</el-button>

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
    }
  },

  mounted () {
    // 异步获取第一页列表显示
    this.getTrademarks() // getTrademarks is not defined
  },

  methods: {

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
</style>