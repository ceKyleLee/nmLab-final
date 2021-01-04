import { useState, useEffect } from 'react';

function Company(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [infos,setinfos] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 2:type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
            setname(name);
            settype(type);
            let n = await props.contract.methods.getCompanyNum().call();
            let infos_tmp = [];
            for(let i=0;i<n;i=i+1){
                let addr = await props.contract.methods.getCompanyAddr(i).call();
                let {0:name, 1:content} = await props.contract.methods.getAddrInfo(addr).call();
                let m = await props.contract.methods.getCompanyJobNum(addr).call();
                let jobs = []
                for(let j=0;j<m;j=j+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(addr,j).call();
                    jobs[j] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false};
                }
                infos_tmp[i] = {addr:addr, name:name, content:content, jobs:jobs};
            }
            setinfos(infos_tmp);
        }
        fetchData();
    });

    const apply = async (tar_addr,job_index) => {
        let msg = window.prompt("Please enter your message.","");
        if(msg!==null){
            await props.contract.methods.sendInvitation(tar_addr,job_index,msg,true).send({from:accounts[0]});
        }
    }

    return(
        <div className="App">
            <div className="header">
                <h1>去中心化人力銀行</h1>
                <h3>Username:{name}&nbsp;&nbsp;&nbsp;&nbsp;Account Type:{type? "Personal":"Company"}</h3>
            </div>
            <div className="body">
                <div className="nav">
                    <nav>
                        <ul>
                            <li><a onClick={()=>props.setpage("Profile")}>Profile</a></li>
                            <li><a onClick={()=>props.setpage("Applicant")}>Applicants' info</a></li>
                            <li><a onClick={()=>props.setpage("Company")}>Companies' info</a></li>
                            {type? <li><a onClick={()=>props.setpage("Upload")}>Upload resume</a></li>:<li><a onClick={()=>props.setpage("Upload")}>Upload intro</a></li>}
                            {type? null:<li><a onClick={()=>props.setpage("Job")}>Job manager</a></li>}
                        </ul>
                    </nav>
                </div>
                <div className="major-box">
                    {infos.map(e=>
                        <div>
                            <h1>{e.name}</h1>
                            <details>
                                <summary>Introduction</summary>
                                <h2>{e.content}</h2>
                            </details>
                            <details>
                                <summary>Job List</summary>
                                {e.jobs.map((j,index)=>
                                    <div>
                                        <h2>{j.title}&nbsp;&nbsp;&nbsp;&nbsp;{type&&j.status? <button onClick={()=>apply(e.addr,index)}>Apply</button>:null}</h2>
                                        <h2>Vacancy: {j.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {j.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={j.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                                        <h3>Description: {j.description}</h3>
                                    </div>
                                )}
                            </details>
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

export default Company;