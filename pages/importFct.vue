<template>
  <b-container>
    <!--   現在firestoreに含まれるドキュメントを抽出     -->
    <b-card
      header="check existing dataset on server and replace with current data"
      header-bg-variant="success"
      header-text-variant="light"
      class="my-2"
    >
      <div class="d-flex flex-row align-items-center">
        <div>collection</div>
        <b-select v-model="collection2" :options="collectionList" class="my-1 mx-1" />
      </div>
      <div class="d-flex flex-row align-items-center">
        <div>document</div>
        <b-input v-model="dbName2" placeholder="Enter doc name" class="my-1 mx-1" />
      </div>
      <div class="d-flex flex-row align-items-center">
        <b-button class="my-1 mx-1" @click="getData(collection2, dbName2)">
          load from firebase
        </b-button>
        <b-button
          class="my-1 mx-1"
          :disabled="!dataFire"
          @click="setNewFct(dbName2)"
        >
          use this FCT
        </b-button>
      </div>
    </b-card>
    <b-card v-if="dataFire" bg-variant="light">
      <json-viewer
        :value="dataFire"
      />
    </b-card>

    <!--  csvを読み込んでfireStoreに登録  -->
    <b-card
      header="import data from EXCEL/CSV and upload to server"
      header-bg-variant="success"
      header-text-variant="light"
      class="my-2"
    >
      <csv-import :show-data="false" class="my-1" @getCsv="dataCsv=$event" />
      <div class="d-flex flex-row align-items-center">
        <div>collection</div>
        <b-select v-model="collection1" :options="collectionList" class="my-1 mx-1" />
      </div>
      <div class="d-flex flex-row align-items-center">
        <div>document</div>
        <b-input v-model="dbName1" placeholder="Enter doc name" class="my-1 mx-1" />
      </div>
      <div class="d-flex flex-row align-items-center">
        <div>index_Col</div>
        <b-input v-model="keyCol" placeholder="Enter key column" class="my-1 mx-1" />
      </div>
      <b-button
        class="my-1"
        :disabled="!importOk"
        @click="insertData(collection1, dbName1, dataJson)"
      >
        import to firebase
      </b-button>
    </b-card>
    <b-card v-if="dataJson" bg-variant="light">
      <json-viewer
        :value="dataJson"
      />
      <div>{{ 'データはFCTに適合して' + (fctValidate ? 'います' : 'いません') }}</div>
      <div v-if="!fctValidate">
        足りない要素は、コンソールを確認してください
      </div>
    </b-card>

    <!--  指定したコレクション内に含まれるドキュメントの一覧  -->
    <b-card
      header="confirm fct/dri database currently registered on server"
      header-bg-variant="success"
      header-text-variant="light"
      class="my-2"
    >
      <div class="d-flex flex-row align-items-center">
        <div>collection</div>
        <b-select v-model="collection3" :options="collectionList" class="my-1 mx-1" />
      </div>
      <b-button @click="getFileList(collection3)">
        file list
      </b-button>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div><span v-html="myListHtml" /></div>
    </b-card>
  </b-container>
</template>

<script>
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import JsonViewer from 'vue-json-viewer'
import csvImport from '@/components/molecules/csvImport'
import { firestoreDb } from '~/plugins/firebasePlugin'
import { validateFct } from '@/plugins/helper'

export default {
  components: {
    csvImport,
    JsonViewer
  },
  data () {
    return {
      /**
       * アプリで利用するデータベースのcollection一覧（form-selectで利用）
       */
      collectionList: [
        { value: 'dataset', text: 'dataset' },
        { value: 'users', text: 'user data' }
      ],
      /**
       * collectionの下に登録されたdocumentの一覧
       */
      myList: [],
      /**
       * csvファイルから読み込んだデータ本体
       */
      dataCsv: '',
      /**
       * コレクション名(csv登録用)
       */
      collection1: '',
      /**
       * ドキュメント名(csv登録用)
       */
      dbName1: '',
      /**
       * コレクション名(firebaseからの読み込み用)
       */
      collection2: '',
      /**
       * ドキュメント名(firebaseからの読み込み用)
       */
      dbName2: '',
      /**
       * キーフィールドの指定
       */
      keyCol: '',
      /**
       * firebaseから読み込んだデータ本体
       */
      dataFire: '',
      /**
       * コレクション名(firebaseからの読み込み用)
       */
      collection3: ''
    }
  },
  computed: {
    /**
     * dataCsvをJsonに変換
     * @returns {{}}
     */
    dataJson () {
      if (this.dataCsv.length === 0) {
        return
      }
      const res = {}
      this.dataCsv.forEach((val) => {
        const myKey = val[this.keyCol]
        if (myKey !== '') {
          res[myKey] = val
        }
      })
      return res
    },
    /**
     * myListをhtmlに変換
     * @returns {string}
     */
    myListHtml () {
      let res = ''
      this.myList.forEach(function (item) {
        res += '<div>' + item + '<div>'
      })
      return res
    },
    /**
     * 読み込んだCSVがFCTの構造に必要なフィールドを含んでいるか検証
     * @returns {boolean}
     */
    fctValidate () {
      return validateFct(this.dataCsv[0])
    },
    /**
     * csvをfirebaseに読み込めるかどうかのフラグ
     */
    importOk () {
      return this.fctValidate && this.collection1 && this.dbName1 && this.keyCol
    }
  },
  methods: {
    /**
     * fctを別のファイルに切り替えて初期化
     * @param fctName
     * @returns {Promise<void>}
     */
    async setNewFct (fctName) {
      const res = window.confirm('this will delete and initialize data. is it ok?')
      if (res) {
        await this.$store.dispatch('fire/updateFctId', fctName)
        const user = JSON.parse(JSON.stringify(this.$store.state.fire.myApp.user))
        await this.$store.dispatch('fire/fireResetAppdata', user).catch((err) => {
          throw err
        })
        await this.$router.push('/')
      }
    },
    /**
     * dataJsonをfirebaseに登録
     * @returns {Promise<void>}
     */
    async insertData (myCollection, myDoc, myDat) {
      if (this.dbName === '' || this.dataCsv.length === 0) {
        return
      }
      const ref = doc(firestoreDb, myCollection, myDoc)
      await setDoc(ref,
        myDat
      ).catch((error) => {
        throw error
      }).then(() => {
        // eslint-disable-next-line no-console
        console.log('import complete: ' + this.dbName)
      })
    },
    /**
     * collection, dbNameで指定したドキュメントをfirebaseから読み込み
     * @returns {Promise<void>}
     */
    async getData (myCollection, myDoc) {
      const ref = await doc(firestoreDb, myCollection, myDoc)
      await getDoc(ref).then((doc) => {
        if (doc.exists()) {
          this.dataFire = doc.data()
        } else {
          alert('id does not match')
        }
      })
    },
    /**
     * 指定するコレクションに含まれるドキュメントの一覧を抽出
     * @param myCollection
     * @returns {Promise<void>}
     */
    async getFileList (myCollection) {
      const querySnapshot = await getDocs(collection(firestoreDb, myCollection))
      this.myList.length = 0
      querySnapshot.forEach((doc) => {
        this.myList.push(doc.id)
      })
    }
  }
}
</script>
