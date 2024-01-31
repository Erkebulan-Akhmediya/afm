<template>
  <div class="text-center">
    <v-dialog
      v-model="isShow"
      width="500"
    >
      <v-card>
        <v-card-title :class="['text-h5', title == 'Ошибка' ? 'red' : 'blue', 'lighten-2']" style="color: #fff;">
          {{title}}
        </v-card-title>

        <v-card-text style="padding: 30px">
            <slot>
                <div v-html="body" style="color: #000;">
                </div>
            </slot>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
          outlined
            color="primary"
            text
            @click="$emit('hideDialog')"
          >
            Ок
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        dialog: false,
      }
    },
    props: ['title', 'body', 'isShow']
  }
</script>