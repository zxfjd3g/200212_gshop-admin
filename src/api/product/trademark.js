/* 
包含品牌相关接口请求函数
*/
import request from '@/utils/request'  // 相当于前面我们封装的ajax

const api_name = '/admin/product/baseTrademark'

export default {

  /* 
  获取品牌分页列表
    GET /admin/product/baseTrademark/{page}/{limit}
  获取所有品牌列表
    GET /admin/product/baseTrademark/getTrademarkList
  */
  getList(page, limit) {
    /* 
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
    }) */
    if (page && limit) {
      return request.get(`${api_name}/${page}/${limit}`)
    }
    return request.get(`${api_name}/getTrademarkList`)
  },

  /* 
  根据ID获取品牌
  GET /admin/product/baseTrademark/get/{id}
  */
  get(id) {
    return request.get(`${api_name}/get/${id}`)
  },

  /* 
  删除指定id的品牌
    DELETE /admin/product/baseTrademark/remove/{id}
  */
  remove(id) {
    return request.delete(`${api_name}/remove/${id}`)
  },

  /* 
  添加品牌
    POST /admin/product/baseTrademark/save
    trademark: 没有id的品牌对象
  */
 
  add (trademark) {
    return request.post(`${api_name}/save`, trademark)
  },
  /* add({tmName, logoUrl}) {
    return request.post(`${api_name}/save`, {tmName, logoUrl})
  }, */

  /* 
  更新品牌
  PUT /admin/product/baseTrademark/update
  trademark: 有id的品牌对象
  */
  update (trademark) {
    return request.put(`${api_name}/update`, trademark)
  }
}
