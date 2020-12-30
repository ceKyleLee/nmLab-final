import { useState, useEffect } from 'react';

function Applicant(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [infos,setinfos] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(props.accounts[0]).call();
            setname(name);
            settype(type);
            let n = await props.contract.methods.getApplicantsNum().call();
            let infos_tmp = [];
            for(let i=0;i<n;i=i+1){
                let addr = await props.contract.methods.getApplicantAddr(i).call();
                let {0:name, 1: content, 2:type} = await props.contract.methods.getAddrInfo(addr).call();
                infos_tmp[i] = {name:name,content:content};
            }
            setinfos(infos_tmp);
        }
        fetchData();
    },[name,type]);

    return(
        <div className="App">
            <div className="header">
                <h1>去中心化人力銀行</h1>
                <h3>Username:{name} Account Type:{type? "Personal":"Company"}</h3>
            </div>
            <div className="body">
                <div className="nav">
                    <nav>
                        <ul>
                            <li><a onClick={()=>props.setpage("Profile")}>Profile</a></li>
                            <li><a onClick={()=>props.setpage("Applicant")}>Applicants' info</a></li>
                            <li><a onClick={()=>props.setpage("Company")}>Companies' info</a></li>
                            {type? <li><a onClick={()=>props.setpage("Upload")}>Upload resume</a></li>:<li><a onClick={()=>props.setpage("Upload")}>Upload intro</a></li>}
                        </ul>
                    </nav>
                </div>
                <div className="major-box">
                    {infos.map(e=>
                        <div>
                            <h1>{e.name}</h1>
                            <h2>{e.content}</h2>
                            <h2>----------------------------------------------------</h2>
                        </div>
                    )}
                </div>
                <div className="minor-box">
                </div>
            </div>
        </div>
    );
}

export default Applicant;