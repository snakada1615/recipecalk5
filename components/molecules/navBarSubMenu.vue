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
        <!--ここから回想メニューの表示-->
        <b-nav-item-dropdown ref="rootMenu" text="Menu" right>
          <div
            v-for="(item, index) in myMenuList"
            :key="index"
          >
            <b-dropdown-item
              v-if="item.menuCategory !== 'subMenuTitle'"
            >
              {{ item.menuText }}
            </b-dropdown-item>
            <b-dropdown
              v-else
              :id="'subMenu-' + index"
              size="sm"
              :text="item.menuText"
              class="m-md-2"
              variant="light"
            >
              <b-dropdown-item
                v-for="(subItem, index2) in item.subMenu"
                :key="index2"
              >
                <b-dropdown-item
                  :to="subItem.menuTo"
                >
                  {{ subItem.menuText }}
                </b-dropdown-item>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </b-nav-item-dropdown>

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
    <loading-box
      :open-flag="$store.state.fire.loadingStatus"
    />
  </b-container>
</template>
<script>
import loadingBox from '@/components/atoms/loadingBox'

export default {
  components: {
    loadingBox
  },
  data () {
    return {
      /**
       * ドロップダウンメニューの開閉動作を抑制するためのフラグ
       */
      isSubMenuVisible: false,
      myMenu: {
        subMenuCategory: [
          'root', 'subMenu1', 'subMenu2', 'subMenu3', 'subMenu4'
        ],
        menuItems: [
          {
            menuCategory: 'root',
            menuText: '1st item',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu1',
            menuText: 'firestore edit',
            menuTo: '/importData/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu3',
            menuText: 'menu3-1',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu1',
            menuText: 'menu1-2',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'root',
            menuText: 'menu0-2',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu1',
            menuText: 'menu1-3',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu2',
            menuText: 'menu2-1',
            menuTo: '/',
            menuDisabled: false
          },
          {
            menuCategory: 'subMenu1',
            menuText: 'menu1-4',
            menuTo: '/',
            menuDisabled: false
          }
        ]
      }
    }
  },
  computed: {
    myMenuList () {
      const menuTemp = JSON.parse(JSON.stringify(this.myMenu.menuItems))
      if (menuTemp.length === 0) {
        return []
      }
      const res2 = []
      const res3 = []
      let groupIndex = -1
      let prevGroup = 'root'
      const resArray = menuTemp.sort((a, b) => {
        let res
        if ((a.menuCategory === 'root') && (b.menuCategory !== 'root')) {
          res = -1
        } else if ((a.menuCategory !== 'root') && (b.menuCategory === 'root')) {
          res = 1
        } else {
          res = (a.menuCategory < b.menuCategory) ? -1 : 1
        }
        return res
      })
      resArray.forEach((item) => {
        const currentGroup = item.menuCategory
        const currentMenuText = item.menuText
        const currentMenuTo = item.menuTo
        const currentMenuStatus = item.menuDisabled
        if (currentGroup === 'root') {
          res2.push(item)
        } else if (currentGroup === prevGroup) {
          res3[groupIndex].subMenu.push(item)
        } else {
          prevGroup = currentGroup
          if (groupIndex >= 0) {
            res2.push(res3[groupIndex])
          }
          groupIndex += 1
          res3.push({})
          res3[groupIndex].menuCategory = 'subMenuTitle'
          res3[groupIndex].menuText = currentGroup
          res3[groupIndex].subMenu = []
          res3[groupIndex].subMenu.push(
            {
              menuCategory: currentGroup,
              menuText: currentMenuText,
              menuTo: currentMenuTo,
              menuDisabled: currentMenuStatus
            }
          )
        }
      })
      if (res3[groupIndex].subMenu.length > 0) {
        res2.push(res3[groupIndex])
      }
      return res2
    },
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
