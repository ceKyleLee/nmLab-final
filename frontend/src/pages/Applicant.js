import { useState, useEffect } from 'react';

function Applicant(props){
    const [name,setname] = useState("")
    const [type,settype] = useState("")

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(props.accounts[0]).call();
            setname(name);
            settype(type);
        }
        fetchData();
    });

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
                <div className="left-box">
                    
                </div>
                <div className="right-box">
                    
                </div>
            </div>
        </div>
    );
}

export default Applicant;