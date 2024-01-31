<template>
    <div>
        <v-img :src="this.imageLink">
        
    </v-img>
    </div>
    
</template>

<script>
    
    export default{
        props:['questionName'],
        data(){
            return{
                imageLink: null,
            }
        },
        methods:{
            async fetchImageURL(questionName) {
            if(!questionName.includes(' ')) {
                try {
                    const response = await this.axios.get('/api/1.0/file-link/', {
                        params: {
                            id: parseInt(questionName, 10),
                        }
                    });
                    console.log('new it',response.data)
                    return response.data; 
                } catch (error) {
                    console.error('Error fetching image URL:', error);
                    return ''; 
                }
            }
            return ''; 
        },
        },
        async mounted(){
            const data = await this.fetchImageURL(this.questionName)
            this.imageLink = data
        },
    }

</script>

<style>

</style>