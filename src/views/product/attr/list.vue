<template>
  <div>AttrList</div>
</template>

<script>
export default {
  name: 'AttrList',

  async mounted () {
    const result = await this.$API.attr.getList(2, 13, 61)
    console.log('result', result)
  }
}
</script>
