import { useEffect, useState } from "react";
import "./BursiyerListesi.css";
import BursiyerListesiAPI from "../API/BursiyerListesiAPI";
import { Table } from "antd";

const BursiyerListesi = () => {
    const [list, setList] = useState([]);

    useEffect(()=> {
        const fetchData = async () => {
            const response = await BursiyerListesiAPI();
            setList(response);
        }

        fetchData();
    }, []);

    return (
        <div>
            <Table dataSource={list}/>
        </div>
    )
}

export default BursiyerListesi;