<template>
  <div>
    <div class="container text-center">
      <div class="row">
        <div class="col-md-8 offset-md-2">
          <b-card header="Create a Party"
                  class="text-center">
                <b-input-group>
                  <b-form-input v-model="partyName"
                  type="text"
                  placeholder="Enter a party name"></b-form-input>
                  <b-input-group-button>
                    <b-button @click="createParty" variant="primary">Create</b-button>
                  </b-input-group-button>
                </b-input-group>
          </b-card>
        </div>
      </div>
      <br>
      <router-link to="/" id="join-party">Join a party!</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'createParty',
  data () {
    return {
      partyName: ''
    }
  },
  methods: {
    createParty () {
    //TODO CALL createParty API then router push to party
    this.$socket.emit("createParty" , {name: this.partyName})

    }
  },
  sockets: {
    createdParty(response) {
      console.log(response);
      let newPartyID = response.newPartyId
      let start = response.timeOfStart
      this.$router.push("party/"+newPartyID);
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
