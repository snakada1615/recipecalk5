<template>
  <b-container>
    <b-card
      header="Copy and paste data within firebase"
      header-bg-variant="success"
      header-text-variant="light"
      class="my-2"
    >
      <b-card
        header="Copy from"
        class="my-1"
      >
        <div class="d-flex flex-row align-items-center">
          <div>collection</div>
          <b-select v-model="collection4" :options="collectionList" class="my-1 mx-1" />
        </div>
        <div class="d-flex flex-row align-items-center">
          <div>document</div>
          <b-select v-model="dbName4" :options="myDocListFiltered" class="my-1 mx-1" />
        </div>
        <b-button class="my-1" @click="getData(collection4, dbName4, 2)">
          load from firebase
        </b-button>
      </b-card>

      <b-card v-if="dataFire2" bg-variant="light">
        <json-viewer
          :value="dataFire2"
        />
      </b-card>

      <b-card
        header="Paste to"
        class="my-1"
      >
        <div class="d-flex flex-row align-items-center">
          <div>collection</div>
          <b-select v-model="collection5" :options="collectionList" class="my-1 mx-1" />
        </div>
        <div class="d-flex flex-row align-items-center">
          <div>document</div>
          <b-input v-model="dbName5" placeholder="Enter doc name" class="my-1 mx-1" />
        </div>
        <b-button class="my-1" :disabled="!dataFire2" @click="insertData(collection5, dbName5, dataFire2)">
          save to other collection
        </b-button>
      </b-card>
    </b-card>

    <b-card
      header="Load data from firebase and save to JSON"
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
      <b-button class="my-1" @click="getData(collection2, dbName2)">
        load from firebase
      </b-button>
      <b-button class="my-1" :disabled="!dataFire" @click="outputJson(dataFire)">
        save to JSON file
      </b-button>
    </b-card>
    <b-card v-if="dataFire" bg-variant="light">
      <json-viewer
        :value="dataFire"
      />
      <b-card>
        {{ dataFire2Csv }}
      </b-card>
    </b-card>
    <b-card
      header="Load data from CSV and import to firebase"
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
        :disabled="!Object.keys(dataJson).length"
        class="my-1"
        @click="insertData(collection1, dbName1, dataJson)"
      >
        import to firebase
      </b-button>
    </b-card>
    <b-card v-if="Object.keys(dataJson).length" bg-variant="light">
      <json-viewer
        :value="dataJson"
      />
    </b-card>
    <b-card
      header="Load data from firebase-JSON and import to firebase"
      header-bg-variant="success"
      header-text-variant="light"
      class="my-2"
    >
      <b-form-file v-model="fileJSON" plain @input="onJsonFileSelected" />
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
        :disabled="!dataJson3"
        class="my-1"
        @click="insertData(collection1, dbName1, dataJson3)"
      >
        import to firebase
      </b-button>
    </b-card>
    <b-card v-if="dataJson3" bg-variant="light">
      <json-viewer
        :value="dataJson3"
      />
    </b-card>
    <b-card
      header="get fileList from firebase"
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
import { doc, getDoc, setDoc, collection, getDocs, query } from 'firebase/firestore'
import JsonViewer from 'vue-json-viewer'
import csvImport from '@/components/molecules/csvImport'
import { firestoreDb } from '~/plugins/firebasePlugin'
import { json2Csv, makeToast } from '@/plugins/helper'

export default {
  components: {
    csvImport,
    JsonViewer
  },
  data () {
    return {
      collectionList: [
        {
          value: 'dataset',
          text: 'dataset'
        },
        {
          value: 'users',
          text: 'user data'
        },
        {
          value: 'nfaSharedData',
          text: 'nfa backend dataset'
        },
        {
          value: 'nfaUserData',
          text: 'nfa user data'
        }
      ],
      key1: '',
      key2: '',
      key3: '',
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
       * コレクション名(firebaseからの読み込み用)
       */
      collection4: '',
      /**
       * コレクション名(firebaseへの保存用)
       */
      collection5: '',
      /**
       * ドキュメント名(firebaseからの読み込み用)
       */
      dbName2: '',
      /**
       * ドキュメント名(firebaseからの読み込み用)
       */
      dbName4: '',
      /**
       * ドキュメント名(firebaseへの保存用)
       */
      dbName5: '',
      /**
       * キーフィールドの指定
       */
      keyCol: '',
      /**
       * firebaseから読み込んだデータ本体
       */
      dataFire: '',
      /**
       * firebaseから読み込んだデータ本体
       */
      dataFire2: '',
      /**
       * コレクション名(firebaseからの読み込み用)
       */
      collection3: '',
      fileJSON: [],
      dataJson3: '',
      myDocList: []
    }
  },
  computed: {
    /**
     * dataCsvをJsonに変換
     * @returns {{}}
     */
    dataJson () {
      const res = {}
      if (this.dataCsv.length !== 0) {
        this.dataCsv.forEach((val) => {
          const myKey = val[this.keyCol]
          if (myKey !== '') {
            res[myKey] = val
          }
        })
      }
      return res
    },
    dataJson2 () {
      if (this.dataCsv.length === 0) {
        return
      }
      return this.dataCsv.reduce((accum, item) => {
        const index1 = Object.keys(accum).indexOf(item.region1)
        if (index1 === -1) {
          accum[item.region1] = { [item.region2]: new Array(item.region3) }
        } else {
          const index2 = Object.keys(accum[item.region1]).indexOf(item.region2)
          if (index2 === -1) {
            accum[item.region1][item.region2] = new Array(item.region3)
          } else {
            accum[item.region1][item.region2].push(item.region3)
          }
        }
        return accum
      }, [])
    },
    /**
     * dataFireをCSVに変換
     * key0: [key1: value] 形式 → CSV (val1, val2, val3, val4)
     */
    dataFire2Csv () {
      return json2Csv(this.dataFire)
    },
    regions1 () {
      const res = Object.keys(this.dataJson2)
      return res || []
    },
    regions2 () {
      if (!this.key1) {
        return []
      }
      this.setBlank(2)
      this.setBlank(3)
      const res = Object.keys(this.dataJson2[this.key1])
      return res || []
    },
    regions3 () {
      if (!this.key1) {
        return []
      }
      if (!this.key2) {
        return []
      }
      this.setBlank(3)
      const res = this.dataJson2[this.key1][this.key2]
      return res || []
    },
    myListHtml () {
      let res = ''
      this.myList.forEach(function (item) {
        res += '<div>' + item + '<div>'
      })
      return res
    },
    myDocListFiltered: {
      get () {
        return this.myDocList.filter(item1 => item1.category === this.collection4).map((item2) => {
          return item2.id
        })
      }
    }
  },
  async created () {
    // set loading status
    await this.$store.dispatch('fire/updateLoadingState', true)

    for (const myCollection of this.collectionList) {
      const ref = collection(firestoreDb, myCollection.value)
      const q = query(ref)
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach((doc) => {
        this.myDocList.push({
          // id: (myCollection.value === 'users') ? doc.data().user.displayName : doc.id,
          id: doc.id,
          category: myCollection.value
        })
      })
    }
    // release loading status
    await this.$store.dispatch('fire/updateLoadingState', false)
  },
  methods: {
    /**
     * リスト項目が選択された際にリンクしたリストを初期化
     * @param index
     */
    setBlank (index) {
      switch (index) {
        case 2:
          this.key2 = ''
          break
        case 3:
          this.key3 = ''
          break
      }
    },
    /**
     * dataJsonをfirebaseに登録
     * @returns {Promise<void>}
     */
    async insertData (myCollection, myDoc, myDat) {
      // eslint-disable-next-line no-console
      console.log('insertData')
      const ref = doc(firestoreDb, myCollection, myDoc)
      await setDoc(ref,
        myDat
      ).catch((error) => {
        throw error
      }).then(() => {
        // eslint-disable-next-line no-console
        console.log('import complete: ' + this.dbName)
        makeToast(this, 'import complete')
      })
    },
    /**
     * collection, dbNameで指定したドキュメントをfirebaseから読み込み
     * @returns {Promise<void>}
     */
    async getData (myCollection, myDoc, myCase = 1) {
      const ref = await doc(firestoreDb, myCollection, myDoc)
      await getDoc(ref).then((doc) => {
        if (doc.exists()) {
          if (myCase === 1) {
            this.dataFire = doc.data()
          } else {
            this.dataFire2 = doc.data()
          }
        } else {
          alert('id does not match')
        }
      })
    },
    async getFileList (myCollection) {
      const ref = collection(firestoreDb, myCollection)
      const q = query(ref)
      const querySnapshot = await getDocs(q)
      this.myList.length = 0
      querySnapshot.forEach((doc) => {
        this.myList.push(doc.id)
      })
    },
    outputCsv (str) {
      const blob = new Blob([str], { type: 'text/csv' }) // 配列に上記の文字列(str)を設定
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'tempdate.csv'
      link.click()
    },
    outputJson (str) {
      const blob = new Blob([JSON.stringify(str)], { type: 'text/csv' }) // 配列に上記の文字列(str)を設定
      const link = document.createElement('a')
      const date = new Date()
      link.href = URL.createObjectURL(blob)
      link.download = 'exportData-' + date.getFullYear() + '-' + String(date.getMonth() + 1).slice(-2) +
        '-' + String(date.getDate()).slice(-2) + '.firebase.json'
      link.click()
    },
    async onJsonFileSelected () {
      this.dataJson3 = await this.fileJSON.text().then((value) => {
        return JSON.parse(value)
      })
    }
  }
}
</script>
