## 功能列表
    1.SPU的分页列表
    2.添加SPU
    3.修改SPU
    4.删除指定SPU
    5.给某个SPU添加SKU
    6.查看SPU下的SKU列表
    7.SKU的分页列表
    8.对SKU进行上架/下架处理
    9.查看SKU详情

## 理解区别2组业务概念
    1. SPU与SKU
      SPU: 某个商品所有相关信息的集合, 包括所有可选择的图片, 可选择的平台属性与销售属性
      SKU: SPU下确定了图片列表/平台属性与销售属性数据的信息集合, 商品唯一标识
      关系: 一个SPU下可以对应多个SKU
    2. 平台属性与销售属性
      平台属性: 用于(出现)商品搜索的商品描述信息, 包含属性名与一系列的属性值
      销售属性: 出现在商品详情界面的商品描述信息, 包含属性名与一系列的属性值

## SPU与SKU相关接口请求函数

## SPU的分页列表界面
	界面布局: Card / CategorySelector / Button / Table / HintButton / Pagination 
	异步获取分页列表数据显示

## SpuForm组件
	界面布局: Form / Input / Select / Upload / Table / Button / Tag
	控制SpuForm的显示隐藏
		在父组件中定义标识数据: isShowSpuForm=true/false
		通过子组件更新父组件的数据 ==>从而实现SpuForm的显示隐藏
			使用$parent ===> 不太好, 需要多次取$parent
			使用.sync
				父组件: <SpuForm :visible.sync="isShowSpuForm"></SpuForm>
				子组件: 
					props: {visible: Boolean}
					this.$emit('update:visible', false)