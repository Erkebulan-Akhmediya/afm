<template>
  <v-container dense class="container-box" v-if="!isLoading">
    <!-- {{event}} -->
    <v-col class="mt-2">
      <h3>Обсуждения: </h3>

      <discussion-form
        class="mt-2 pb-6"
        :item="editingDiscussion"
        @add-comment="addComment"
        :appeal="appeal"
        :event="event"
        :is_private="is_private"
        :is_sending="is_sending"
      />
      
      <v-list dense three-line>
        <discussion-card
          v-for="(item, index) in allDiscussions"
          :key="index"
          :item="item"
          :event="event"
          :appeal="appeal"
          @set-parent-to-editing="setEditingParentId"
          @set-editing-discussion="setEditingDiscussion"
          @delete-discussion="deleteDiscussion"
          @save-comment="addComment"
        />
      </v-list>

      <v-btn
        v-if="!commentsIsDone"
        color="primary"
        text
        @click="loadMoreComments"
      >
        Загрузить еще
      </v-btn>
    </v-col>
  </v-container>
</template>
<script>
export default {
  props: {
    event: Object,
    appeal: Object,
    form_position: String,
    is_private: Boolean,
  },
  data() {
    return {
      allDiscussions: [],
      editingDiscussion: {
        discussion: "",
        parent_id: null,
      },
      show_input: false,
      animated_input: false,
      offset: 0,
      isLoading: true,
      commentsIsDone: false,
      currentId: null,
      is_sending: false,

          };
  },
  async mounted() {
    this.isLoading = true;
    await this.loadFirstComments();
    this.isLoading = false;
  },
  methods: {

    async loadFirstComments() {
      if (this.event) {
        this.allDiscussions = await this.loadComments(this.event);
      } else if (this.appeal) {
        this.allDiscussions = await this.loadComments(this.appeal);
      } 

      if (this.allDiscussions.length < 10) this.commentsIsDone = true;
    },
    setEditingParentId(event) {
      this.editingDiscussion.parent_id = event;
    },
    setEditingDiscussion(event) {
      this.editingDiscussion = event;
    },
    deleteDiscussion(event) {
      this.allDiscussions = this.allDiscussions.filter((d) => d.id != event);
    },
    fileUpload: async function (object_id, file) {
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("fileType", "discussion");
        form.append("file_type_id", 13);
        form.append("object_id", object_id);
        await this.axios.post(`/api/1.0/discussion-file`, form);
      }
    },
    async addComment(event) {
      this.is_sending = true;

      try {
        if (event.discussion || event.file) {
          let method = event.id ? "put" : "post";
          let locals = {
            object_id: this.event ? this.event.event_id : this.appeal.id,
            object_name: this.event ? 'EVENT' : 'APPEAL',
            discussion: event.discussion,
            parent_id: event.parent_id,
            is_private: this.is_private,
          };

          const responseCommentId = await this.axios[method](
            `/api/1.0/discussion${event.id ? "/" + event.id : ""}`,
            locals
          );

          const newCommentId = responseCommentId.data.id;

          if (method === "post") {
            await this.fileUpload(newCommentId, event.file);
          }
          let params = {
            is_private: this.is_private ? this.is_private : false,
            object_name: this.event ? 'EVENT' : 'APPEAL',
          };
          const responseData = await this.axios.get(
            `/api/1.0/discussion/${event.id ? event.id : newCommentId}`,
            { params }
          );
          const newComment = responseData.data[0];
          if (!event.id && !event.parent_id) {
            this.allDiscussions.unshift(newComment);
            this.offset += 1;
          }

          this.editingDiscussion = [];
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.is_sending = false;
      }
    },
    async loadMoreComments() {
      let newData
       if (this.event) {
       newData = await this.loadComments(this.event);
      } else if (this.appeal) {
        newData = await this.loadComments(this.appeal);
      } 
      if (newData.length < 4) this.commentsIsDone = true;
      this.allDiscussions = this.allDiscussions.concat(newData);
    },
    async loadComments(data) {
      let params = {
        object_id: data.event_id ? data.event_id : data.id,
        object_name: data.event_id ? 'EVENT' : 'APPEAL',
        offset: this.offset,
        is_private: this.is_private,
      };

      const responseData = await this.axios.get(`/api/1.0/discussion`, {
        params,
      });

      this.offset += 10;
      return responseData.data;
    },
  },
  watch: {
    allDiscussions() {
      if (this.allDiscussions.length) {
        this.allDiscussions.map(async (item) => {
          if (!item.src) {
            this.$set(
              item,
              "src",
              require("@/assets/img/default_employee.png")
            );
            let src = await this.$getVuexStoreFile(item.image_id, 1);
            this.$set(
              item,
              "src",
              src ? src : require("@/assets/img/default_employee.png")
            );
          }
        });
      }
    },
    async appeal() {
      if (this.appeal) {
        this.offset = 0;
        this.isLoading = true;
        await this.loadFirstComments(true);
        this.isLoading = false;
      }
    },
  },
};
</script><style scoped>
.discusion-form{
  position: sticky;
  background-color: white;
  bottom: -12px;
  padding-bottom: 12px;
  z-index: 10;
}
h3 {
  font-size: 1.2rem;
}
.container-box{
  position: relative;
}
.scroll{
  overflow-y: scroll;

}
</style>