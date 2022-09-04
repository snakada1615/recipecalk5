// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore, CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence, doc, getDocFromCache, getDocFromServer
} from 'firebase/firestore'

/**
 * データベースの設定情報
 * @type {{storageBucket: string, apiKey: string, messagingSenderId:
 *     string, appId: string, projectId: string, databaseURL: string, authDomain: string}}
 */
const firebaseConfig = {
  apiKey: 'AIzaSyApC67MbBdfJTy3p79uBracs1CEmjgERuo',
  authDomain: 'ifna-nfa-app2.firebaseapp.com',
  projectId: 'ifna-nfa-app2',
  storageBucket: 'ifna-nfa-app2.appspot.com',
  messagingSenderId: '952618704950',
  appId: '1:952618704950:web:eb987399567bf4ffcb3897',
  measurementId: 'G-XMS497SG57'
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

export async function fireGetDoc (collectionId, docId) {
  const ref = await doc(firestoreDb, collectionId, docId)
  const docSnap = await getDocFromCache(ref).catch(async () => {
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
