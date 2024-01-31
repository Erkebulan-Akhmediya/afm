<template>
  <div class="d-flex flex-column">
    <div class="d-flex justify-space-around" width="100%">
      <v-btn 
        :class="{'disabled': currentPage <= 1}"
        @click="changePage(currentPage - 1)"
        aria-label="Previous Page"
        color="blue darken-3"
        style="color:white;"
        class="rounded-lg"
      >
      <v-icon
          left
        >
        mdi-arrow-left-bold
        </v-icon>
      Назад
      
        
        
      </v-btn>

      <v-btn 
        :class="{'disabled': currentPage >= totalPages}"
        @click="changePage(currentPage + 1)"
        aria-label="Next Page"
        color="blue darken-3"
        style="color:white;"
        class="rounded-lg"
      >
        Вперед
        <v-icon
          right
        >
        mdi-arrow-right-bold
        </v-icon>
    </v-btn>

    </div>
    <div class="custom-pagination">
      
  
      <button 
        v-for="page in paginatedRange" 
        :key="page" 
        :class="['pagination-item', { 'answered': isQuestionAnswered(page - 1), 'active': page === currentPage }]" 
        @click="changePage(page)"
        :aria-label="'Page ' + page"
        style="width: 50px;"
      >
        {{ page }}
      </button>
  
     
      
    </div>
  </div>
    
  </template>
  
  <script>
  export default {
    props: {
      totalPages: {
        type: Number,
        required: true
      },
      currentPage: {
        type: Number,
        required: true
      },
      isQuestionAnswered: {
        type: Function,
        required: true
      },
      visiblePages: {
        type: Number,
        default: 20
      }
    },
    computed: {
      paginatedRange() {
        let start = this.currentPage - Math.floor(this.visiblePages / 2);
        start = Math.max(start, 1);
        let end = start + this.visiblePages - 1;
        end = Math.min(end, this.totalPages);
        start = Math.max(end - this.visiblePages + 1, 1);
  
        let range = [];
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        return range;
      }
    },
    methods: {
      changePage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
          this.$emit('update:currentPage', page);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .custom-pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 10px;
    flex-wrap: wrap;
    max-height: 300px; /* Adjust the height as needed */
    overflow-y: auto;
  }
  
  .pagination-item {
    min-width: 35px;
    text-align: center;
    border: 1px solid #ddd;
    padding: 8px 12px;
    margin: 2px;
    cursor: pointer;
    background-color: #f5f5f5;
    color: #333;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.1s, color 0.1s, border-color 0.1s;
    user-select: none;
  }
  
  
  .pagination-item.answered:not(.disabled) {
    background-color: #4caf50;
    color: white;
  }
  
  .pagination-item.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .pagination-item.disabled {
    cursor: default;
    opacity: 0.6;
  }
  </style>
  