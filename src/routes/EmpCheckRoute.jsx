import React, { useEffect, useState } from 'react'

export const EmpCheckRoute = ({element}) => {
    const role = localStorage.getItem("role");
    const [emp, setEmp] = useState(false)
    useEffect(() => {
        if (role !== "admin" || role != "admin") setEmp(true)
    }, [])
    return emp ? element : <></>
}