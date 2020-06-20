<template>
  <div>Trademark</div>
</template>

<script>
export default {
  name: 'Trademark',

  async mounted () {
    const result = await this.$API.trademark.getList(1, 5)
    console.log('result', result)
  }
}
</script>
