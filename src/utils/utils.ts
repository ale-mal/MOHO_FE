import { v4 } from "uuid";

export function getCID(): string | null {
    if (typeof window === "undefined" || !window.localStorage) {
        return null;
    }

    try {
        let cid = localStorage.getItem("cid");
        if (!cid) {
            cid = v4();
            localStorage.setItem("cid", cid);
        }
        return cid;
    } catch (e) {
        console.error("Error accessing localStorage:", e);
        return null;
    }
}