export default async function ({
  store,
  redirect,
  route
}) {
  /**
   * ログイン状態をチェックし、ログインしていなければログイン画面にリダイレクト
   * ログイン○、myAppのfetch×、の場合にはfireStoreからfetch(initFirebaseAuthの機能)
   */
  await store.dispatch('fire/initFirebaseAuth').catch(() => {
    // eslint-disable-next-line no-console
    console.log('login-middleware: Error')
  })
  if (
    route.name !== 'login' &&
    route.name !== 'index' &&
    !store.state.fire.isLoggedIn
  ) {
    alert('please login/register first')
    // eslint-disable-next-line no-console
    console.log('not login')
    return redirect('/')
  }
  // eslint-disable-next-line no-console
  console.log('autologin complete:')
}
