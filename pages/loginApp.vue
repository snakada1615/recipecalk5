<template>
  <b-container>
    <b-button
      variant="primary"
      :disabled="!inputValidate"
      @click="register"
    >
      register
    </b-button>
    <b-button
      variant="primary"
      :disabled="!inputValidate"
      @click="login"
    >
      login
    </b-button>
    <b-button
      variant="warning"
      :disabled="logOutValidate"
      @click="logOut"
    >
      logout
    </b-button>
    <b-row class="my-2">
      <b-col cols="11">
        <b-form-input v-model="user" placeholder="Enter username" :state="stateName" />
      </b-col>
    </b-row>
    <b-row class="my-2">
      <b-col cols="11">
        <b-form-input v-model="pass" :type="typePass" placeholder="Enter password" :state="statePass" />
      </b-col>
      <b-col cols="1" class="py-1 px-0">
        <p class="h5">
          <b-icon v-if="typePass==='password'" icon="eye" @click="togglePass" />
          <b-icon v-if="typePass==='text'" icon="eyeSlash" @click="togglePass" />
        </p>
      </b-col>
    </b-row>
    <div v-if="errorMessage" class="text-warning" size="sm">
      ({{ errorMessage }})
    </div>
    <b-card bg-variant="light">
      <div>
        login status:
        <span v-if="$store.state.fire.isLoggedIn" class="text-success">on</span>
        <span v-else class="text-danger">off</span>
      </div>
      <div>name:{{ $store.state.fire.myApp.user.displayName }}</div>
      <div>uid:{{ $store.state.fire.myApp.user.uid }}</div>
    </b-card>
  </b-container>
</template>
<script>
export default {
  data () {
    return {
      user: '',
      pass: '',
      typePass: 'password',
      errorMessage: '',
      errorMessageList: [
        'login error: username or password does not match',
        'registration error: username already in use'
      ]
    }
  },
  computed: {
    stateName () {
      return (/^[\w]{3,30}?$/).test(this.user)
    },
    statePass () {
      return (this.pass.length >= 6 && this.pass.length <= 20)
    },
    inputValidate () {
      return this.statePass && this.stateName
    },
    logOutValidate () {
      return !this.$store.state.fire.isLoggedIn
    }
  },
  methods: {
    togglePass () {
      if (this.typePass === 'text') {
        this.typePass = 'password'
      } else {
        this.typePass = 'text'
      }
    },
    async register () {
      await this.$store.dispatch('fire/registerEmail', {
        name: this.user,
        password: this.pass
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err)
        if (err.message.indexOf('auth/email-already-in-use')) {
          this.user = ''
          this.pass = ''
          this.errorMessage = this.errorMessageList[1]
        }
      })
    },
    async login () {
      await this.$store.dispatch('fire/loginEmail', {
        name: this.user,
        password: this.pass
      })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err)
          if (err.message.indexOf('auth/internal-error')) {
            this.user = ''
            this.pass = ''
            this.errorMessage = this.errorMessageList[0]
          }
        })
    },
    google () {
      this.$store.dispatch('fire/loginGoogle')
    },
    anonymous () {
      this.$store.dispatch('fire/loginGuest')
    },
    logOut () {
      this.$store.dispatch('fire/logOut')
    }
  }
}
</script>
