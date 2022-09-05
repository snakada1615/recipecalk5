<template>
  <b-container>
    <b-navbar type="dark" variant="info" class="mb-2" sticky>
      <b-navbar-brand to="/">
        <b-icon icon="BIconHouseFill" />
        <span class="small"> Nutrients App</span>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto" :small="true">
        <b-nav-item-dropdown ref="rootMenu" text="Menu" right>
          <b-dropdown-item to="/">
            top
          </b-dropdown-item>

          <!-- メニューグループ1 導入 -->
          <b-dropdown id="subMenu-0" size="sm" text="Introduction" class="m-md-2" variant="light">
            <b-dropdown-item to="/whatsNfa">
              what's NFA
            </b-dropdown-item>
            <b-dropdown-item to="/login">
              login/register
            </b-dropdown-item>
            <b-dropdown-item to="/userinfo">
              user info
            </b-dropdown-item>
            <b-dropdown-item to="/foodGroupInfo">
              about FoodGroup
            </b-dropdown-item>
          </b-dropdown>

          <!-- メニューグループ2 食事評価 -->
          <b-dropdown id="subMenu-1" size="sm" text="Diet Assessment" class="m-md-2" variant="light">
            <b-dropdown-item
              to="/dietcalk"
              :disabled="!isLoggedIn"
            >
              dietCalk
            </b-dropdown-item>
            <b-dropdown-item to="/summaryDiet">
              diet Summary
            </b-dropdown-item>
            <b-dropdown-item to="/setSupplyTarget">
              calculate Supply Target
            </b-dropdown-item>
          </b-dropdown>

          <!-- メニューグループ3 品目特定 -->
          <b-dropdown id="subMenu-2" size="sm" text="Identify Commodity" class="m-md-2" variant="light">
            <b-dropdown-item
              to="/feasibilityCheck"
              :disabled="!isLoggedIn"
            >
              crop feasibility
            </b-dropdown-item>
            <b-dropdown-item to="/summaryfeasibility">
              feasibility Summary
            </b-dropdown-item>
          </b-dropdown>

          <!-- メニューグループ4 その他 -->
          <b-dropdown id="subMenu-3" size="sm" text="Other function" class="m-md-2" variant="light">
            <!--
            <b-dropdown-item to="/editFct">edit current FCT</b-dropdown-item>
            <b-dropdown-item to="/importFct2">change FCT</b-dropdown-item>
            -->
            <b-dropdown-item to="/editQuestions">
              edit feasibility question
            </b-dropdown-item>
            <b-dropdown-item to="/copp0;0p0;pyAndPaste">
              copy & paste
            </b-dropdown-item>
            <b-dropdown-item-button
              :disabled="!isLoggedIn"
              @click="resetData"
            >
              reset Data
            </b-dropdown-item-button>
          </b-dropdown>
        </b-nav-item-dropdown>
        <div />

        <!--  ここからuser情報の表示  -->
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            <em>User</em>
          </template>
          <b-dropdown-item
            v-for="item in userInfo"
            :key="item.displayName"
            to="/"
            class="small"
          >
            <div class="d-flex justify-content-around">
              <div class="text-info">
                {{ Object.keys(item)[0] }}:
              </div>
              <div>{{ Object.values(item)[0] }}</div>
            </div>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <!-- saveボタンの表示 -->
      <b-button
        :disabled="!hasDocumentChanged"
        :class="{'border-white':true, 'btn-primary': !hasDocumentChanged, 'btn-warning': hasDocumentChanged, 'mx-2':true}"
        pill
        size="sm"
        style="font-size: 13px"
        @click="fireSaveAppdata"
      >
        save
      </b-button>

      <b-nav-text v-if="$nuxt.isOnline" class="text-light small">
        <b-icon icon="reception4" />
      </b-nav-text>
      <div v-if="$nuxt.isOffline" class="text-light small">
        <b-icon icon="reception0" />
      </div>
    </b-navbar>
  </b-container>
</template>
<script>

export default {
  data () {
    return {
      /**
       * ドロップダウンメニューの開閉動作を抑制するためのフラグ
       */
      isSubMenuVisible: false
    }
  },
  computed: {
    /**
     * データ更新の有無($store.state.fire.hasDocumentChanged)を確認
     * @returns {boolean}
     */
    hasDocumentChanged () {
      return this.$store.state.fire.hasDocumentChanged
    },
    /**
     * ログイン状態のフラグ
     * @returns {boolean}
     */
    isLoggedIn () {
      return this.$store.state.fire.isLoggedIn
    },
    userInfo () {
      return Object.entries(this.$store.state.fire.myApp.user).filter(([key]) => {
        return (
          ['displayName', 'country',
            'subnational1', 'subnational2',
            'subnational3',
            'organization', 'title'].includes(key)
        )
      }).map(([key, value]) => {
        const res = {}
        let myKey = key
        if (key === 'displayName') {
          myKey = 'ID'
        }
        res[myKey] = value
        return res
      }).filter((item) => {
        return item.displayName !== ''
      })
    }
  },
  watch: {
    /**
     * データが更新された場合（hasDocumentChanged）のみ、beforeunloadを追加
     * @param {boolean} value
     */
    hasDocumentChanged (value) {
      // eslint-disable-next-line no-console
      console.log(value)
      if (value) {
        addEventListener('beforeunload', this.beforeUnloadListener, { capture: true })
      } else {
        removeEventListener('beforeunload', this.beforeUnloadListener, { capture: true })
      }
    },
    $route () {
      // ページ移動前にメニューを折りたたむ
      this.$refs.rootMenu.hide()
    }
  },
  beforeDestroy () {
    // 破棄される前にイベントリスナーから削除
    removeEventListener('beforeunload', this.beforeUnloadListener, { capture: true })
  },
  mounted () {
    // メニューアイテムをクリックした際、idに'subMenu-'が含まれていればサブメニューを開く
    this.$root.$on('bv::dropdown::show', (bvEvent) => {
      if (bvEvent.componentId.includes('subMenu-')) {
        this.isSubMenuVisible = true
      }
    })
    this.$root.$on('bv::dropdown::hide', (bvEvent) => {
      if (bvEvent.componentId.includes('subMenu-')) {
        this.isSubMenuVisible = false
      }
      if (this.isSubMenuVisible) {
        bvEvent.preventDefault()
      }
    })
  },
  methods: {
    /**
     * ページの遷移前にユーザーに確認し、
     * @param event
     * @returns {string}
     */
    beforeUnloadListener (event) {
      // eslint-disable-next-line no-console
      console.log('trigger')
      event.preventDefault()
      event.returnValue = 'Are you sure you want to exit before saving your data?'
    },
    /**
     * myAppをfireStoreに保存
     */
    fireSaveAppdata () {
      this.$store.dispatch('fire/fireSaveAppdata')
    },
    async resetData () {
      const user = JSON.parse(JSON.stringify(this.$store.state.fire.myApp.user))
      await this.$store.dispatch('fire/fireResetAppdata', user).catch((err) => {
        throw err
      })
      this.$router.push('/')
    }
  }
}
</script>
