<script>
import axios from 'axios';

export default {
    data() {
        return {
            candidateList: [],
            isLoading: true,
        };
    },
    methods: {
        goToCandidate(id) {    
            this.$router.push(`/candidate/${id}`);
        },
    },
    async created() {
        
        try {
            const { data } = await axios.get(
                'http://localhost:8000/api/1.0/candidates',
            );
            this.candidateList = data;
            console.log(this.candidateList);
            this.isLoading = false;
            
        } catch(err) {
            console.log('error in CandidateList component', err);
        }
        
    },
};
</script>

<template>
    <v-col>
        <v-overlay v-if="isLoading">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <div
            v-for="(candidate, index) in candidateList"
            :key="index"
        >
            <v-row 
                class="ma-1 d-flex justify-space-between align-center my-row"
                @click="goToCandidate(candidate.id)"
            >
                <h1>{{ candidate.secret_name }}</h1>
                <div class="d-flex justify-flex-start align-center status-sur">

                    <p class="ma-0 mr-15">
                        {{ `СУРы: ${candidate.surs.filter(item => item.status === true).length}` }}
                    </p>

                    <p 
                        v-if="candidate.status === 'Одобрено'" 
                        class="ma-0 green--text font-weight-bold"
                    >
                        {{ `Статус: ${candidate.status}` }}
                    </p>
                    <p 
                        v-else-if="candidate.status === 'Отказано'" 
                        class="ma-0 red--text font-weight-bold"
                    >
                        {{ `Статус: ${candidate.status}` }}
                    </p>
                    <p 
                        v-else
                        class="ma-0 orange--text font-weight-bold"
                    >
                        {{ `Статус: ${candidate.status}` }}
                    </p>
                    
                </div>
            </v-row>
            <v-divider></v-divider>
        </div>
    </v-col>
</template>

<style scoped>

.my-row {
    height: 50px;
}

.status-sur {
    width: 30%;
} 

</style>