<template>
  <div>
    <input type="file" @input="handle">
    <div v-if="showData">
      {{ data }}
    </div>
  </div>
</template>
<script>
/**
 * @desc csvファイルをjsonに変換して返す。
 */
export default {
  props: {
    /**
     * 取得後のCSVファイルを表示するかどうか判定するフラグ
     */
    showData: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      /**
       * 読み込んだCSVを配列に保存
       */
      data: []
    }
  },
  methods: {
    /**
     * ファイルが選択された際にトリガー
     * eventからファイル内容を受け取り、splitで分割して配列に返す
     * @param event formから入力されたfile
     */
    handle (event) {
      const file = event.target.files[0]

      file.text().then((csv) => {
        const array = csv.split(/\r\n|\n/)
        const header = array[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((item) => {
          return item.replaceAll(/"/g, '') // 二重引用符を削除する
        })
        const body = array.slice(1).map(arr => arr.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)).map((item) => {
          return item.map((item2) => {
            return item2.replaceAll(/"/g, '')// 二重引用符を削除する
          })
        })

        this.data = body.map((b) => {
          const result = {}

          header.forEach((head, index) => {
            result[[head]] = b[index]
          })

          return result
        })
        /**
         * CSV読み込み完了後にgetCsvで親コンポーネントに値を返す
         */
        this.$emit('getCsv', this.data)
      })
    }
  }
}
</script>
