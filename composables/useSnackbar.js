let snackBarStatus = ref(false);
let snackBarMessage = ref('');
let snackBarcolor = ref('success');

export const useSnackBar = () => {


    const ShowSnackbar = (message, color) => {
        console.log('showing snackbar');
        snackBarMessage.value = message;
        snackBarcolor.value = color;
        snackBarStatus.value = true;
        
    }

    const HideSnackbar = () => {
        snackBarStatus.value = false;
    }
    
    return {
        snackBarMessage,
        snackBarStatus,
        snackBarcolor,
        ShowSnackbar,
        HideSnackbar
    }
}