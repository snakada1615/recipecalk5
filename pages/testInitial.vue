<template>
  <b-container>
    test
    <div>{{ firstName }}</div>
    <b-button
      @click="$store.dispatch('fire/setHasDocumentChanged', !$store.state.fire.hasDocumentChanged)"
    >
      here
    </b-button>
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
