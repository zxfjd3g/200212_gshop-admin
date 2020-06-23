<template>
  <div>SpuList</div>
</template>

<script>
export default {
  name: 'SpuList',
  
  async mounted () {
    const result = await this.$API.spu.getList(1, 3, 61)
    console.log('result---', result)
  }
}
</script>
