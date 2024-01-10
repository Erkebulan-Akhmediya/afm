import axios from "axios";

export default {
  state: {
    chats: [],
    writing: [],
    modal : false,
    chat_end: false,
    offset: 0,
    inserted_message: {},
    messages: [],
    selectedChat: {},
    messUsers: [],
    searchedUsers: [],
    loadingMessages: false,
    loadingChats: false,
    chatUsers: [],
    avatars: [],
    searchedChats: [],
    unReadedMess: [],
    last: [],
    notification: [],
    message_notification: false, 
    totalUnreadedMess: null,
    sending_files: []
  },
  mutations: {
    SET_SENDING_FILES(state, file){
      state.sending_files.push(file)
    },
    REMOVE_SENDING_FILES(state, file){
      state.sending_files.map((item, index) => {
        if(item['id'] == file['id']){
          state.sending_files.splice(index, 1)
        }
      })

    },
    SET_READED(state, chat_id){

          state.chats.map((item,index) => {
        if(item.chat_id == chat_id){
          var i = item
          i['is_readed'] = true
          state.chats[index]['is_readed'] = i

        }
      })
      if(state.messages[0] != undefined && state.messages[state.messages.length - 1][0].chat_id == chat_id){
        state.messages.map((day,day_index) => {
          if(!day[day.length - 1]['is_readed']){
            day.map((item, message_index) => {
              var i = item
              i['is_readed'] = true
              state.messages[day_index][message_index] = i

                         })
          }
        })
      }
    },
    SET_NOTIFICATION(state, message){
      if(state.notification.length < 3){
        state.notification.push(message)
        setTimeout(() => { 
          var index = state.notification.indexOf(message)     
          state.notification.splice(index, 1)

                  }, 3000)
      } else {
        state.notification.pop()
        state.notification.push(message)
      }
    },
    CLOSE_NOTIFICATION(state, key){
      state.notification.splice(key, 1)
    },
    SET_WRITING(state, writing){
      if(writing.user_name != null){
        state.writing.push(writing)
      } else {
        state.writing.map((item,index) => {
          if(item.chat_id == writing.chat_id){
            state.writing.splice(index, 1)
          }
        })
      }
    },
    SET_MODAL(state, modal){
      state.modal = modal
    },
    SET_OFFSET_CHAT(state, offset){
      state.offset = offset;
    },
    SET_INSERTED_MESSAGE(state, inserted_message){
      state.inserted_message = inserted_message;
    },
    SET_LAST_MESSAGES: (state, last) => {
        state.last = last;
    },
    SET_LOADING_MESSAGES: (state, isLoading) => {
      state.loadingMessages = isLoading;
    },
    SET_LOADING_CHATS: (state, isLoading) => {
      state.loadingChats = isLoading;
    },
    SET_CHATS_VUEX: (state, chats) => {
      let selected = state.selectedChat;
      let isSelectedInList = chats.some((el) => el.chat_id == selected.chat_id);
      if (!isSelectedInList){
        state.messages = [];
        state.chatUsers = [];
        state.selectedChat = {};
      }

      state.chats = chats;
    },
    SET_AVATARS: (state, avatar) => {
      if (state.avatars.find((item) => item.user_id == avatar.user_id)) {
        state.avatars;
      } else {
        state.avatars.push(avatar);
      }
    },

    SET_MESSAGES_TO_VUEX: async (state, message) => {
      state.messages = message;
    },
    UPDATE_MESSAGES_TO_VUEX: async (state, message) => {
        if(state.messages.length > 0){
          if(message.length > 0){
            var last_message_date = state.messages[0][0]['create_date'].split(' ')[0]
            var first_message_date = message[message.length - 1][0]['create_date'].split(' ')[0]
            if(last_message_date == first_message_date){
              var mess = message[message.length - 1]
              state.messages[0].unshift(...mess)
              message.pop()
            }
            state.messages.unshift(...message)
          } else {
            state.chat_end = true
          }
        }  
    },
    ADD_MESSAGE_TO_VUEX: (state, message) => {
      console.log(message)
      if (state.selectedChat.chat_id == message.chat_id) {
        if(state.messages.length > 0){
          var last_day = state.messages[state.messages.length - 1]
          if(last_day[last_day.length - 1].create_date.split(' ')[0] == message.create_date.split(' ')[0]){
            last_day.push(message)
            state.messages[state.messages.length - 1] = last_day
          } else { 
            state.messages.push([message]);
          }
        } else {
          state.messages.push([message])
        }
      }

    },
    SET_SELECTED_CHAT: (state, chat) => {
      state.selectedChat = chat;
      state.offset = 0;
    },
    SET_ROOMS: (state, room) => {
      if (state.rooms.some((item) => item.title == room.title)) {
        state.rooms == state.rooms;
      } else {
        state.rooms.push(room);
      }
    },

    SET_DB_ROOM_USERS: (state, users) => {
      state.chatUsers = users;
    },
    CLEAR_MESSAGE_SPACE: (state) => {
      state.messages = [];
    },

    SET_MESS_USERS: (state, users) => {
      state.messUsers = users;
    },
    SET_SEARCHED_USERS: (state, searchString) => {
        if(searchString!='') {
            searchString = searchString.toLowerCase().trim().replace(/\s+/g,'');
        }


             let result = []
      for (let item of state.messUsers) {
        let fullNameF =  item.first_name.toLowerCase() + item.last_name.toLowerCase()
        let fullNameL = item.last_name.toLowerCase() + item.first_name.toLowerCase()
        if (

                   fullNameL.includes(searchString)
                ||
          fullNameF.includes(searchString)

            ) {
          result.push(item)
        }}

        state.searchedUsers = result
    },
    CLEAR_SEARCHED_USERS: (state) => {
      state.searchedUsers = [];
    },
    REMOVE_UNREADED_MESS: (state) => {
      state.unReadedMess = []
    },
    SET_UNREADED_MESS: (state, data) => {
        const array = state.unReadedMess;
        const i = array.findIndex((item) => item.chat_id === data.chat_id);
        if (i > -1) array[i] = data;
        else array.push(data);

        state.unReadedMess = array;

        const arr = state.unReadedMess;
        let total = arr.reduce(function(sum, current) {
          return sum + current.count;
        }, 0);

        state.totalUnreadedMess = total;

    },
    SET_MESSAGE_DELETED: async (state, data) => {
      var mess = {}
      await state.messages.map((day, index) => {
        day.map((message, message_index) => {
            if (message.id == data.message_id) {
              mess = message
              mess["is_deleted"] = true;
              mess["deleted_date"] = data.deleted_date
              state.messages[index][message_index] = mess;
              if(mess.id == state.messages[state.messages.length - 1][day.length - 1].id){
                state.chats.map((chat) => {
                  if(chat.chat_id == state.selectedChat.chat_id){
                    chat['last_message_deleted'] = true;
                  }
                })
              }
              return;
            } 
        })
      });
    },
  },
  actions: {
    async READ_MARK({ commit  }, payload){
      commit("SET_READED", payload.chat_id)
    },
    async HIDE_CHAT({ state },payload){
      var data = state.selectedChat
      data.from_user = payload
      let url = '/api/1.0/messager/chat_hide'
      await axios.post(url, data)
    },

    async SHOW_CHAT({ state }, payload){
      let url = '/api/1.0/messager/hidden_chat_show'
      await axios.post(url, payload)
      console.log(state)
    },

    GET_AVATAR({ commit }, avatars) {
      commit("SET_AVATARS", avatars);
    },

        async GET_LAST_MESSAGES({ commit }, payload){
      let url = "/api/1.0/messanger/last"
      try {
        var data =  await axios.post(url, payload);
        commit("SET_LAST_MESSAGES", data.data.chats)
        return data.data.chats;
      } catch(error){
        console.log(error.message)
      }
    },

    async GET_CHATS_FROM_API({ commit }) {
      let url = "/api/1.0/messenger/chats";
      commit("SET_LOADING_CHATS", true);
      try {
        const chats = await axios.get(url);
        await commit("SET_CHATS_VUEX", chats.data);
        commit("SET_LOADING_CHATS", false);
      } catch (error) {
        commit("SET_LOADING_CHATS", false);
        throw error;
      }
    },
    async CREATE_CHAT({ commit }, payload) {
      let url = "/api/1.0/messenger/chats";
      try {
        await axios.post(url, payload);
        commit("CLEAR_MESSAGE_SPACE");
        commit("CLEAR_SEARCHED_USERS");
      } catch (error) {
        return error;
      }
    },

    async MARK_READED_MESSAGES({state}, payload){
      console.log(state)
        let url2 = "/api/1.0/messenger/messages/status/" + payload.chat_id;
        await axios.post(url2, payload);   
    },

    async GET_MESSAGES({ commit, state }, payload) {
      if(payload.chat_id){
        let url = "/api/1.0/messenger/messages/" + payload.chat_id;
        if(!payload.fetch){
          commit("SET_LOADING_MESSAGES", true);
          state.chat_end = false
        }
        try {
          let messages = await axios.get(url, {params: {
            offset: state.offset,
            limit: 30
          }});
          messages = messages.data;
          if(!payload.fetch){
            await commit("SET_MESSAGES_TO_VUEX", messages);
            if (state.unReadedMess.find((el) => el.chat_id == payload.chat_id && el.count != 0)) {
              let url2 = "/api/1.0/messenger/messages/status/" + payload.chat_id;
              await axios.post(url2, payload);
            }
            state.unReadedMess.map((item, index) => {
                if(item.chat_id == payload.chat_id){
                  state.unReadedMess.splice(index, 1)
                  state.totalUnreadedMess = state.totalUnreadedMess - item.count;
                }
            })
          } else {
            await commit("UPDATE_MESSAGES_TO_VUEX", messages)
          }
          await commit("SET_LOADING_MESSAGES", false);
        } catch (error) {
          return error;
        }
      }
    },
    async GET_UNREADED_MESSAGES({ commit }, payload) {

              let url = "/api/1.0/messenger/messages/status";
        try {
          let unreaded = await axios.post(url, payload);
          unreaded.data.map((item) => {
            let data = { chat_id: item[0].chat_id, count: item.length };
            console.log(data)
            commit("SET_UNREADED_MESS", data);
          })

                  } catch (error) {
          console.log(error);
          throw error;
        }

          },
    ADD_MESSAGE_FROM_SOCKET({ commit }, payload) {
      commit("ADD_MESSAGE_TO_VUEX", payload);
    },
    CHANGE_CHAT_ROOM({ commit }, payload) {
      commit("SET_SELECTED_CHAT", payload);

      commit("CLEAR_MESSAGE_SPACE");
    },

    async GET_CHAT_USERS_FROM_API({ commit }, payload) {
      try {
        let response = await axios("/api/1.0/messenger/chatusers/" + payload);
        commit("SET_DB_ROOM_USERS", response.data);
      } catch (err) {
        console.log(err);
      }
    },
    async EDIT_CHAT_USERS_FROM_API({ commit }, payload) {
      try {
        let response = await axios.put(
          "/api/1.0/messenger/chatusers/" + payload.chat_id,
          payload
        );
        commit("SET_DB_ROOM_USERS", response.data);
        commit("CLEAR_SEARCHED_USERS");
      } catch (err) {
        console.log(err);
      }
    },

    async GET_MESS_USERS({ commit }) {
      try {
        let response = await axios.get("/api/1.0/messenger/users");
        commit("SET_MESS_USERS", response.data);
      } catch (err) {
        console.log(err);
      }
    },
    SEARCH({ commit }, payload) {
      commit("SET_SEARCHED_USERS", payload);
    },
    async POST_MESSAGE({ commit }, payload) {
      let url = "/api/1.0/messenger/messages/";
      commit("SET_LOADING_MESSAGES", true);
      try {
        await axios.post(url, payload);
        commit("SET_LOADING_MESSAGES", false);

      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    DELETED_MESSAGE({ commit }, payload) {
      commit("SET_MESSAGE_DELETED", payload);
    },

  },
  getters: {
    SENDING_FILES(state){
      return state.sending_files;
    },
    NOTIFICATION(state){
      return state.notification;
    },
    WRITING(state ){
      return state.writing;
    },
    MODAL(state){
      return state.modal;
    },
    OFFSET_CHAT(state){
      return state.offset;
    },
    CHAT_END(state){
      return state.chat_end;
    },
    INSERTED_MESSAGE(state){
      return state.inserted_message;
    },
    LOADING_MESSAGES(state) {
      return state.loadingMessages;
    },
    LOADING_CHATS(state) {
      return state.loadingChats;
    },
    CHATS(state) {
      return state.chats;
    },
    SELECTED_CHAT(state) {
      return state.selectedChat;
    },
    USERS(state) {
      return state.messUsers;
    },
    SEARCHED_USERS(state) {
      return state.searchedUsers;
    },

    MESSAGES(state) {
      return state.messages;
    },
    CHAT_USERS(state) {
      return state.chatUsers;
    },
    CHAT_AVATARS(state) {
      return state.avatars;
    },
    UNREADED_MESS_SUMM(state) {
      return state.totalUnreadedMess;
    },
    UNREADED_MESSAGES(state) {
      return state.unReadedMess;
    },
    RECENT_CHATS(state) {
      let chats = state.chats;
      let data = chats.filter((el) => el.count > 0);
      return data;
    },
    PREV_CHATS(state) {
      let chats = state.chats;
      let data = chats.filter((el) => el.count < 1);
      return data;
    },
  },
};
