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
      :current-page="2"
      :page-sizes="[3, 6, 9]"
      :page-size="3"
      :total="15"
      layout="prev, pager, next, jumper, ->, sizes, total"
    />
    
  </div>
</template>

<script>
export default {
  name: 'Trademark',

  data() {
    return {
      trademarks: [
        {
          "id": 245,
          "tmName": "华为",
          "logoUrl": "http://182.92.128.115:8080/group1/M00/00/16/rBFUDF7sDuqAdTZ3AAE4yFxIm5Y002.png"
        },
        {
          "id": 246,
          "tmName": "索尼",
          "logoUrl": "http://182.92.128.115:8080/group1/M00/00/16/rBFUDF7sDwaAA_PWAABJbc_Rb7o222.png"
        },
        {
          "id": 247,
          "tmName": "长虹",
          "logoUrl": "http://182.92.128.115:8080/group1/M00/00/0D/rBFUDF7ItKmARAwgAAAGoVnFwgQ886.jpg"
        }
      ]
    }
  },

  async mounted () {
    const result = await this.$API.trademark.getList(1, 5)
    console.log('result', result)
  }
}
</script>

<style>
</style>