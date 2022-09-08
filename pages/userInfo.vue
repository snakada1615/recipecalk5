<template>
  <b-container>
    <b-card>
      <b-row class="my-1">
        <b-col cols="3">
          displayName
        </b-col>
        <b-col cols="9">
          {{ user.displayName }}
        </b-col>
      </b-row>
      <b-row class="my-1">
        <b-col cols="3">
          country
        </b-col>
        <b-col cols="9">
          <country-names :key1.sync="user.country" />
        </b-col>
        <region-select
          v-if="user.country === 'Ethiopia'"
          :key3.sync="user.subnational3"
          :key2.sync="user.subnational2"
          :key1.sync="user.subnational1"
        />
      </b-row>
      <b-row class="my-1">
        <b-col cols="3">
          organization
        </b-col>
        <b-col cols="9">
          <b-form-input
            v-model="user.organization"
            placeholder="Enter your organization"
          />
        </b-col>
      </b-row>
      <b-row class="my-1">
        <b-col cols="3">
          title
        </b-col>
        <b-col cols="9">
          <b-form-input
            v-model="user.title"
            placeholder="Enter your role in the organization"
          />
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
/**
 * @desc storeから読み込んだuserデータ（store.myApp.user）をformに落として
 * 更新、updateボタンでstore, fireStoreを同時に更新
 */
import regionSelect from '@/components/atoms/regionSelect'
import countryNames from '@/components/atoms/countryNames'

export default {
  components: {
    regionSelect,
    countryNames
  },
  data () {
    return {
      /**
       * state.fire.myApp.userのクローン
       */
      user: {
        displayName: '',
        country: '',
        organization: '',
        title: '',
        uid: '',
        phoneNumber: '',
        subnational1: '',
        subnational2: '',
        subnational3: ''
      },
      /**
       * 初回読み込みかどうかチェック
       */
      isInitialLoad: ''
    }
  },
  watch: {
    user: {
      deep: true,
      async handler () {
        // 初回読み込み時は何もしない（フラグを変更するのみ）
        if (this.isInitialLoad) {
          this.isInitialLoad = false
          return
        }
        // storeのアップデート
        await this.$store.dispatch('fire/updateUser', this.user)
        // userの変更時は、常に setHasDocumentChanged=true をセット
        await this.$store.dispatch('fire/setHasDocumentChanged', true)
      }
    }
  },
  created () {
    this.user = JSON.parse(JSON.stringify(this.$store.state.fire.myApp.user))
    this.isInitialLoad = true
  }
}
</script>
