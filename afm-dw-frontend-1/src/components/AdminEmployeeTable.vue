<script>
import axios from 'axios';

export default {
    data() {
        return {
            tableData: [],
            loader: false,
            headers: [
                { text: 'Фамилия', value: 'last_name_rus' },
                { text: 'Имя', value: 'first_name_rus' },
                { text: 'Отчество', value: 'middle_name_rus' },
                { text: 'Роль', value: 'role_name' },
            ],
        };
    },
    methods: {
        goToUser(data) {
            let cryptoid = "";
            do {
                cryptoid = this.$crypto(String(data.id))
            } while (cryptoid.includes('//'));
            this.$router.push('/employee/' + data.id);
        },
    },
    async created() {
        try {
            const { data } = await axios.get(
                'http://localhost:8000/api/1.0/employees',
                {
                    headers: {
                        'Authorization-header': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                },
            );
            this.tableData = data;
            console.log(this.tableData);
        } catch(err) {
            if (err.status == 401) {
                this.$router.push('/');
                this.$swal({
                    ...this.$optionAlert.fire,
                    icon: 'error',
                    title: 'Отказано в доступе',
                });
            }
            console.log('error in AdminEmployeeTable', err);
        }
    },
};
</script>

<template>
    <v-data-table
        :headers="headers"
        :items="tableData"
        :items-per-page="10"
        @click:row="goToUser"
        class="elevation-1"
    >

        <template v-slot:[`item.first_name_rus`]="{ item }">
            {{ item.first_name_rus }}
        </template>
        <template v-slot:[`item.last_name_rus`]="{ item }">
            {{ item.last_name_rus }}
        </template>
        <template v-slot:[`item.middle_name_rus`]="{ item }">
            {{ item.middle_name_rus }}
        </template>
        <template v-slot:[`item.role_name`]="{ item }">
            {{ item.role_name }}
        </template>

  </v-data-table>
</template>