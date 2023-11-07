import { toast } from "react-toastify"
import { ToastType } from "@/types/enums"

/***
 * Toasts for success, error, warning, and info
 */

export default function displayToast(message: string, type: ToastType=ToastType.INFO) {
    switch (type) {
        case ToastType.SUCCESS:
            toast.success(message, {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "dark"
                })
            break;
        case ToastType.ERROR:
            toast.error(message, {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "dark"
            })
            break;
        case ToastType.WARNING:
            toast.warn(message, {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "dark"
            })
            break;
        default:
            toast.info(message, {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "dark"
            })
            break;
    }   
}

