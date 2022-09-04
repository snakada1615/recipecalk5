<template>
  <b-container>
    test
    <div>{{ firstName }}</div>
  </b-container>
</template>
<script>
import { fireGetDoc } from '~/plugins/firebasePlugin'

export default {
  async asyncData () {
    const res = await fireGetDoc('testDb', 'fireDbFirstTest')
    return {
      firstName: res.firstName
    }
  }
}
</script>
