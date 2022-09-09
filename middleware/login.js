export default async function ({
  store,
  redirect,
  route
}) {
  /**
   * ログイン状態をチェックし、ログインしていなければログイン画面にリダイレクト
   * ログイン○、myAppのfetch×、の場合にはfireStoreからfetch(initFirebaseAuthの機能)
   */
  await store.dispatch('fire/initFirebaseAuth').catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err)
    // eslint-disable-next-line no-console
    console.log('initFirebaseAuth: Error')
  })
  if (
    route.name !== 'loginApp' &&
    route.name !== 'index' &&
    route.name !== 'importDataCsv' &&
    route.name !== 'testInitial2' &&
    !store.state.fire.isLoggedIn
  ) {
    console.log(store.state.fire.isLoggedIn)
    alert('please login/register first')
    // eslint-disable-next-line no-console
    console.log('not login')
    return redirect('/')
  }
  // eslint-disable-next-line no-console
  console.log('autologin complete:')
}
