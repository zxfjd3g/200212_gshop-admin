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

## SpuForm组件布局界面
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

## SpuForm组件: 动态获取数据
    修改SPU
		1). 根据spuId请求获取spuInfo  spu.get(spuId)
		2). 根据spuId请求获取spuImageList  sku.getSpuImageList (spuId)
		3). 获取所有品牌的列表trademarkList trademark.getList()
		4). 获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
    添加SPU
    	1). 获取所有品牌的列表trademarkList trademark.getList()
		2). 获取所有销售属性的列表saleAttrList spu.getSaleAttrList()
	在父组件中通知子组件请求获取数据
		使用ref技术得到子组件对象, 并调用父组件对象方法

## SpuForm组件: 显示动态数据
	注意: 请求获取的数据可能不能直接用于显示, 需要先进行一定整理来再显示

	品牌下拉列表
		trademarkList: 所有品牌的数组
		spuInfo.tmId: 当前SPU的品牌id

	SPU图片列表: spuImageList
		请求返回的数据结构
			{
			    "id": 333,
			    "spuId": 26,
			    "imgName": "rBHu8l6UcKyAfzDsAAAPN5YrVxw870.jpg",
			    "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
			 }
		upload组件需要的数据结构:
			{
				name: 'food.jpg', 
				url: 'https://xxx.cdn.com/xxx.jpg'
			}
		如何处理/整理:
			给spuImageList中每个图片对象都添加name和url属性, 属性值为对应的属性值
		
## 编码任务列表
	1--实现: 定义SPU与SKU相关接口请求函数
	2--实现: SPU列表界面的布局和动态显示
	3--实现: SpuForm界面的布局
	4--实现: SpuForm显示隐藏的控制--使用.sync
	5--实现: 初始动态获取SpuForm添加/更新界面需要的数据
	6--实现: 动态显示品牌列表与SPU图片列表