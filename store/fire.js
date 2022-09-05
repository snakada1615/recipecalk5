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
    }
  },
  /**
   * ページ変更の有無(beforeunloadをエラーなしで通すために必要)
   * https://www.uriports.com/blog/easy-fix-for-blocked-attempt-beforeunload-confirmation-panel/
   */
  hasDocumentChanged: false
})

export const mutations = {
  /**
   * ページ変更の状態をセット
   * @param state
   * @param payload
   */
  setHasDocumentChanged (state, payload) {
    state.hasDocumentChanged = payload
  }
}

export const actions = {
  /**
   * ページ変更の状態をセット
   * @param state
   * @param payload
   */
  setHasDocumentChanged ({ commit }, payload) {
    commit('setHasDocumentChanged', payload)
  }
}
