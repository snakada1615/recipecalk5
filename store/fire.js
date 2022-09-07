// import firebase from '~/plugins/firebase'
// import {doc} from "firebase/firestore";
import { getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { firestoreDb, fireGetDoc } from '~/plugins/firebasePlugin'

// --------------------------------------------------------
// ここからstore内のみで使用する内部関数
// --------------------------------------------------------

/**
 * JSON -→ array of objectに変換
 * @param fct fct(JSON形式)
 * @returns {{}[]}
 */
function formatFct (fct) {
  const res = []
  for (const key of Object.keys(fct)) {
    const resObj = {}
    resObj.Carbohydrate = fct[key].Carbohydrate
    resObj.En = fct[key].Energy
    resObj.Fe = fct[key].FE
    resObj.Fat = fct[key].Fat
    resObj.Name = fct[key].Food_name
    resObj.Pr = fct[key].Protein
    resObj.Va = fct[key].VITA_RAE
    resObj.Group = fct[key].food_group_unicef
    resObj.food_grp_id = fct[key].food_grp_id
    resObj.id = fct[key].FCT_id
    res.push(resObj)
  }
  return res
}

/**
 * JSON -→ array of objectに変換
 * @param dri dri(JSON形式)
 * @returns {{}[]}
 */
function formatDri (dri) {
  const res = []
  for (const key of Object.keys(dri)) {
    const resObj = {}
    resObj.En = dri[key].energy
    resObj.Fe = dri[key].fe
    resObj.Pr = dri[key].protein
    resObj.Va = dri[key].vita
    resObj.Name = dri[key].nut_group
    resObj.id = dri[key].id
    resObj.max_vol = dri[key].max_vol
    res.push(resObj)
  }
  return res
}

/**
 * JSON -→ array of objectに変換
 * @param dat (JSON形式)
 * @returns {{}[]}
 */
function formatPortionUnit (dat) {
  const res = []
  for (const key of Object.keys(dat)) {
    const resObj = {}
    resObj.id = dat[key].id
    resObj.FCT_id = dat[key].FCT_id
    resObj.count_method = dat[key].count_method
    resObj.unit_weight = dat[key].unit_weight
    res.push(resObj)
  }
  return res
}

/**
 * JSON -→ array of objectに変換
 * @param dat (JSON形式)
 * @returns {{}[]}
 */
function formatQuestions (dat) {
  const res = []
  for (const key of Object.keys(dat)) {
    const resObj = {}
    resObj.id = dat[key].id
    resObj.categoryText = dat[key].categoryText
    resObj.questionText = dat[key].questionText
    resObj.answerList = JSON.parse(JSON.stringify(dat[key].answerList))
    res.push(resObj)
  }
  return res
}

// --------------------------------------------------------
// ここまで
// --------------------------------------------------------

export const state = () => ({
  myApp: {
    /**
     * 現在のユーザー
     */
    user: {
      displayName: '',
      email: '',
      country: '',
      subnational1: '',
      subnational2: '',
      subnational3: '',
      organization: '',
      title: '',
      uid: '',
      phoneNumber: ''
    },
    /**
     * 利用するデータセット：fctとdri
     */
    dataSet: {
      /**
       * fctのid
       */
      fctId: 'fct_eth',
      /**
       * driのid
       */
      driId: 'dri01',
      /**
       * CountryNamesのid(firestore)
       */
      CountryNamesId: 'countryNames',
      /**
       * regionのid(firestore)
       */
      regionId: 'eth_region',
      /**
       * portionUnitのid
       */
      portionUnitId: 'portionUnit1',
      /**
       * questionのid
       */
      questionsId: 'questions01',
      /**
       * fctのデータ
       */
      fct: [],
      /**
       * driのデータ
       */
      dri: [],
      /**
       * portionUnitのデータ
       */
      portionUnit: [],
      /**
       * feasibility Questionのデータ
       */
      questions: []
    },
    /**
     * 各シナリオに対応したデータ(family -> Eth向け)
     */
    familyCases: [],
    /**
     * 各シナリオに対応したデータ(community -> Eth向け)
     */
    communityCases: []
  },
  /**
   * ページ変更の有無(beforeunloadをエラーなしで通すために必要)
   * https://www.uriports.com/blog/easy-fix-for-blocked-attempt-beforeunload-confirmation-panel/
   */
  hasDocumentChanged: false,
  /**
   * ページ内容（myApp）がfirebaseからStoreに読み込まれたかどうか判定
   */
  isMyAppStored: false,
  /**
   * 現在対象になっている家族名
   */
  currentFamily: '',
  /**
   * 現在対象になっているコミュニティ名
   */
  currentCommunity: '',
  /**
   * 最後に保存した日時
   */
  saveDate: {
    jsDate: 0,
    date: ''
  }
})

export const mutations = {
  /**
   * ユーザー情報をfireAuthから得たログイン情報に基づいて初期化する
   * @param state
   * @param payload
   */
  storeUser (state, payload) {
    state.myApp.user.uid = payload.uid
    state.myApp.user.displayName = payload.displayName
    state.myApp.user.email = payload.email
    state.myApp.user.phoneNumber = payload.phoneNumber
    state.myApp.user.country = ''
    state.myApp.user.subnational1 = ''
    state.myApp.user.subnational2 = ''
    state.myApp.user.subnational3 = ''
    state.myApp.user.organization = ''
    state.myApp.user.title = ''
  },
  /**
   * myAppを更新
   * @param state
   * @param payload 更新する値（JSON）
   */
  updateMyApp (state, payload) {
    state.myApp = JSON.parse(JSON.stringify(payload))
  },
  /**
   * ページ変更の状態をセット
   * @param state
   * @param payload
   */
  setHasDocumentChanged (state, payload) {
    state.hasDocumentChanged = payload
  },
  /**
   * ユーザーデータ（myApp）が読み込まれたらTrueにセット
   * @param state
   */
  updateIsMyAppStored (state) {
    state.isMyAppStored = true
  },
  /**
   * ログイン状態を更新
   * @param state
   * @param {boolean} payload ログイン状態
   */
  updateIsLoggedIn (state, payload) {
    state.isLoggedIn = payload
  },
  /**
   * 保存した日付を記録
   * @param state
   */
  updateSaveDate (state) {
    const time = Date.now()
    state.myApp.saveDate.jsDate = time
    state.myApp.saveDate.date = new Date(time)
  }

}

export const actions = {
  /**
   * ページ遷移・リロードの度にログイン状態を確認(middleware:login.js → getAuth().onAuthStateChanged)、
   *     ログインされてる場合 → ユーザー情報がstoreに保存されているか確認（isMyAppStored）
   *     → storeに保存されていない場合はfireStoreからfetch
   *     → ログインされていない場合 → Topページに移動
   * @param commit
   * @param dispatch
   * @param state
   * @returns {Promise<unknown>}
   */
  initFirebaseAuth ({
    commit,
    dispatch,
    state
  }) {
    return new Promise((resolve, reject) => {
      // onAuthStateChanged：現在のログイン状態を返す（戻り値：null or user）
      const unsubscribe = getAuth().onAuthStateChanged(async (user) => {
        if (user) {
          commit('updateIsLoggedIn', true)
          // ログイン成功したら、ユーザーデータ(myApp)がすでに読み込まれているかチェック
          if (!state.isMyAppStored) {
            // ユーザーデータ(myApp)が読み込まれていない場合、fireStoreからfetch
            await dispatch('storeMyApp', user.uid).catch(async () => {
              alert('no data registered, load initial dataset')
              await dispatch('initAll', user)
              dispatch('updateIsMyAppStored')
              // eslint-disable-next-line no-console
              console.log('initFirebaseAuth: data fetch from fireStore')
            })
          }
          // eslint-disable-next-line no-console
          console.log('initFirebaseAuth:success')
          // user オブジェクトを resolve
          resolve(user)
        } else {
          if (state.myApp.length) {
            commit('clearMyApp')
          }
          commit('updateIsLoggedIn', false)
          reject(new Error('initFirebaseAuth:fail'))
        }

        // 登録解除
        unsubscribe()
      })
    })
  },
  /**
   * まとめて初期化
   * @param dispatch
   * @param state
   * @param payload
   * @param commit
   */
  async initAll ({
    dispatch,
    state,
    commit
  }, payload) {
    if (!payload) {
      throw new Error('Error: initAll → no registered user-info')
    }
    try {
      await commit('storeUser', payload)
      await dispatch('storeFct')
      await dispatch('storeDri')
      await dispatch('storePortionUnit')
      await dispatch('storeQuestions')
      await dispatch('fireSaveAppdata')
      // eslint-disable-next-line no-console
      console.log('initAll: all done')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Error: initAll')
      throw err
    }
  },
  /**
   * 現在のユーザーの全テータをfirestoreに保存
   * <ul>
   *   <li>client側のデータ：store-myApp以下の全ノード
   *   <li>collection：user
   *   <li>doc：ユーザーのuid
   * @param state
   * @param dispatch
   * @param commit
   * @returns {Promise<void>}
   */
  async fireSaveAppdata ({
    state,
    dispatch,
    commit
  }) {
    dispatch('updateSaveDate')
    const ref = await doc(firestoreDb, 'users', state.myApp.user.uid)
    await setDoc(ref, state.myApp).catch((err) => {
      throw new Error('Error in fireSaveAppdata:' + err)
    })
    // myAppの変更内容をfirestoreに保存できたらhasDocumentChangedをfalseにセット
    commit('setHasDocumentChanged', false)
    // eslint-disable-next-line no-console
    console.log('saveAppdata: success')
  },
  /**
   * fctの初期データをdataset/fct01から読み込んでstoreに反映
   *     データが存在しない場合はエラー
   * @param state
   * @param commit
   * @param dispatch
   * @returns {Promise<void>}
   */
  async storeFct ({
    commit,
    dispatch,
    state
  }) {
    const fct = await fireGetDoc('dataset', state.myApp.dataSet.fctId)
    if (fct) {
      // ObjectをArrayに変換
      const fctArray = formatFct(fct)
      commit('updateFct', fctArray)
    } else {
      throw new Error('storeFct fail: no data')
    }
  },
  /**
   * driの初期データをdataset/dri01から読み込んでstoreに反映
   *     データが存在しない場合はエラー
   * @param commit
   * @param dispatch
   * @param state
   * @returns {Promise<void>}
   */
  async storeDri ({
    commit,
    dispatch,
    state
  }) {
    const dri = await fireGetDoc('dataset', state.myApp.dataSet.driId)
    if (dri) {
      const driArray = formatDri(dri)
      commit('updateDri', driArray)
    } else {
      throw new Error('storeDri fail: no data')
    }
  },
  /**
   * PortionUnitのデータをfireStoreから取得して返す
   * @param state
   * @param commit
   * @param dispatch
   * @returns {Promise<void>}
   */
  async storePortionUnit ({
    state,
    commit,
    dispatch
  }) {
    // portionUnitをfireStoreからfetch (portionUnitIdを使う)
    const portionUnit = await fireGetDoc('dataset', state.myApp.dataSet.portionUnitId).catch((err) => {
      throw new Error(err)
    })

    // portionUnitをstoreに保存
    if (portionUnit) {
      const portionUnitArray = formatPortionUnit(portionUnit)
      commit('updatePortionUnit', portionUnitArray)
    } else {
      throw new Error('storePortionUnit fail: no data')
    }
  },
  /**
   * questionsのデータをfireStoreから取得して返す
   * @param state
   * @param commit
   * @param dispatch
   * @returns {Promise<void>}
   */
  async storeQuestions ({
    state,
    commit,
    dispatch
  }) {
    // questionsをfireStoreからfetch (questionsIdを使う)
    const questions = await fireGetDoc('dataset', state.myApp.dataSet.questionsId).catch((err) => {
      throw new Error(err)
    })

    // questionsをstoreに保存
    if (questions) {
      const questionsArray = formatQuestions(questions)
      commit('updateQuestions', questionsArray)
    } else {
      throw new Error('storeQuestions fail: no data')
    }
  },
  /**
   * CountryNamesのデータをfireStoreから取得して返す
   * @param state
   * @returns {Promise<*>}
   */
  async initCountryNames ({ state }) {
    const countries = await fireGetDoc('dataset', state.myApp.dataSet.CountryNamesId).catch((err) => {
      throw new Error(err)
    })
    if (countries) {
      return countries
    } else {
      throw new Error('initCountryNames fail: no data')
    }
  },
  /**
   * RegionのデータをfireStoreから取得して返す
   * @param state
   * @returns {Promise<*>}
   */
  async initRegion ({ state }) {
    const region = await fireGetDoc('dataset', state.myApp.dataSet.regionId).catch((err) => {
      throw new Error(err)
    })
    if (region) {
      return region
    } else {
      throw new Error('initRegion fail: no data')
    }
  },
  /**
   * myAppをStoreに保存したうえで、更新フラグをオン（setHasDocumentChanged）
   * @param commit
   * @param dispatch
   * @param payload
   */
  updateMyApp ({ commit }, payload) {
    commit('updateMyApp', payload)
    // myAppの変更時は、常に setHasDocumentChanged=true をセット
    commit('setHasDocumentChanged', true)
  },
  /**
   * myAppをfirestoreからfetchしてstoreに保存
   * @param state
   * @param commit
   * @param payload
   * @returns {Promise<void>}
   */
  async storeMyApp ({
    state,
    commit
  }, payload) {
    const myApp = await fireGetDoc('users', payload)
    if (myApp) {
      commit('updateMyApp', myApp)
      // 初期データ読み込み時のみ、hasDocumentChangedをfalseにセット
      commit('setHasDocumentChanged', false)
    } else {
      throw new Error('storeMyApp fail: no data on fireStore')
    }
  }
}
