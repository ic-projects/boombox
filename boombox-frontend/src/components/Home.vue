<template>
  <div>
    <div class="container">
      <h1 class="text-center">BOOMBox</h1>
      <b-card class="text-center">
        <h1 class="card-title">Join a party</h1>
        <b-form-input v-model="partyid"
                      type="text"
                      placeholder="Enter a party code"></b-form-input>
       <router-link :to="joinParty">
         <b-button size="lg" variant="primary">Join</b-button>
       </router-link>
      </b-card>

      <h3 class="text-center">or</h3>

      <b-card class="text-center">
        <h1 class="card-title">Create a party</h1>
        <b-form-input v-model="partyName"
                      type="text"
                      placeholder="Enter a party name"></b-form-input>
          <b-button @click="createParty" size="lg" variant="primary">Create</b-button>
      </b-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      partyid: '',
      partyName: '',
      isCreatingParty: false
    }
  },
  computed: {
    joinParty () {
      return "party/" + this.partyid;
    }
  },
  methods: {
    createParty () {
    //TODO CALL createParty API then router push to party


    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #35495E;
}
</style>
