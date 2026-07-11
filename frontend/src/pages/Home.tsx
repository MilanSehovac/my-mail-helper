import {useState, useEffect} from "react";
import type {Agency} from "../types/Agency";
import API from "../api/axios";
export default function Home() {
    const [agencies, setAgencies] = useState<Agency[]>([])
    useEffect(() =>{
        const fetchAgencies = async () => {
            const response = await fetch ('/agency')
        }
    })
    return(
        <h1>TEST</h1>
    )
}