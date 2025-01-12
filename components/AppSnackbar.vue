<template>
 <v-snackbar v-model="snackBarStatus" top>
      {{ snackBarMessage }}
      <template v-slot:actions>
        <v-btn color="pink" variant="text" @click="HideSnackbar()">
          Close
        </v-btn>
      </template>
</v-snackbar>
</template>

<script setup>
const {
  HideSnackbar,  snackBarMessage,
  snackBarStatus,
  snackBarcolor,
} = useSnackBar();

</script>