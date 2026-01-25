import {ReactNode} from "react";
import useUser from "@/hooks/useUser";

export default function UserProvider({ children }: { children: ReactNode }) {
    const user = await useUser();
    
    return (
        <>{children}</>
    )
}