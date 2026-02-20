import React, { useEffect, useState } from 'react'

export const AdminCheckRoute = ({element}) => {
    const role = localStorage.getItem("role");
    const [admin, setAdmin] = useState(false)
    useEffect(() => {
        if (role === "admin" || role == "admin") setAdmin(true)
    }, [])
    return admin ? element : <></>
}
