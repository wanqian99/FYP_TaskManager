import { useContext } from "react";
import { Context } from './ContextManager.js'

export const BackgroundCol = () => {
    const { theme, darkmode } = useContext(Context);

    return (
        `${theme}`
    )
}

export const TintCol = () => {
    const { darkmode } = useContext(Context);

    if(darkmode) {
        return ("#000000")
    }
    else {
        return ("#ffffff")
    } 
}