<template>
  <b-container>
    <p>ステータスコード：{{ error.statusCode }}</p>
    <p>メッセージ：{{ error.message }}</p>
  </b-container>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      default: null
    }
  }
}
</script>
