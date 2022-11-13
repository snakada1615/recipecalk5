// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore, CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence, doc, getDocFromCache, getDocFromServer, getDocs, collection
} from 'firebase/firestore'

/**
 * データベースの設定情報
 * @type {{storageBucket: string, apiKey: string, messagingSenderId:
 *     string, appId: string, projectId: string, databaseURL: string, authDomain: string}}
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDH_RkqtAD6I-MQIcSVFVWDeeGzZUPI2pw',
  authDomain: 'ifnaapp01.firebaseapp.com',
  databaseURL: 'https://ifnaapp01-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'ifnaapp01',
  storageBucket: 'ifnaapp01.appspot.com',
  messagingSenderId: '419104702670',
  appId: '1:419104702670:web:94dc61759415cd134a909f'
}

/**
 * firebaseの初期化
 * @type {FirebaseApp}
 */
export const firebase = initializeApp(firebaseConfig)

/**
 * キャッシュサイズを最大化
 * @type {Firestore}
 */
const firestore = initializeFirestore(firebase, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
})

/**
 * オフラインキャッシュを有効化
 */
// enableIndexedDbPersistence(firestore)
/*
この関数は機能しない
firestore.enablePersistence({
  synchronizeTabs:true
}).then(() => {
  console.log('Persistence:true, synchronizeTabs:true')
}).catch((err)=>{throw err})
*/
enableMultiTabIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // eslint-disable-next-line no-console
      console.log(
        '// Multiple tabs open, persistence can only be enabled ' +
        '            // in one tab at a a time. '
      )
    } else if (err.code === 'unimplemented') {
      // eslint-disable-next-line no-console
      console.log(
        '// The current browser does not support all of the' +
        '// features required to enable persistence'
      )
    }
    throw err
  })

// firestore.enablePersistence({synchronizeTabs:true})

export const firestoreDb = firestore

/**
 * データを取得（ローカルキャッシュ → サーバーの順に確認）
 * @param collectionId
 * @param docId
 * @returns {Promise<string|DocumentData>}
 */
export async function fireGetDoc (collectionId, docId) {
  const ref = await doc(firestoreDb, collectionId, docId)
  const docSnap = await getDocFromCache(ref).catch(async () => {
    // eslint-disable-next-line no-console
    console.log('getData from server')
    return await getDocFromServer(ref)
  })
  if (docSnap.exists()) {
    // eslint-disable-next-line no-console
    console.log('getData from cache')
    return docSnap.data()
  } else {
    // eslint-disable-next-line no-console
    console.log('getData fail: no data in Cache')
    return ''
  }
}

export async function getFileList (myCollection, returnValue = 1) {
  const res = []
  const querySnapshot = await getDocs(collection(firestoreDb, myCollection)).order_by('id')
  querySnapshot.forEach((item) => {
    if (returnValue === 2) {
      res.push({
        id: item.id,
        name: item.data().user.displayName
      })
    } else {
      res.push(item.id)
    }
  })
  return res
}
