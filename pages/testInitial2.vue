<template>
  <b-container>
    test
    <div>{{ firstName }}</div>
    <b-button
      @click="$store.dispatch('fire/setHasDocumentChanged', !$store.state.fire.hasDocumentChanged)"
    >
      here
    </b-button>
    {{ myList }}
    <b-form-file v-model="fileJSON" plain />
    file:{{ fileJSON }}
  </b-container>
</template>
<script>
import { collection, getDocs } from 'firebase/firestore'
import { fireGetDoc, firestoreDb } from '~/plugins/firebasePlugin'

export default {
  async asyncData () {
    const res = await fireGetDoc('testDb', 'fireDbFirstTest')
    const querySnapshot = await getDocs(collection(firestoreDb, 'dataset'))
    const myList = []
    querySnapshot.forEach((doc) => {
      myList.push(doc.id)
    })
    return {
      firstName: res.firstName,
      myList
    }
  },
  data () {
    return {
      fileJSON: []
    }
  },
  methods: {
  }
}
</script>
