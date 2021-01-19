import { useState, useEffect } from 'react';

function Company(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [infos,setinfos] = useState([]);
    const [status,setstatus] = useState(false);

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 2:type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
            setname(name);
            settype(type);
            if(type){
                let status = await props.contract.methods.getApplicantStatus(accounts[0]).call();
                setstatus(status==='0');
            }
            let n = await props.contract.methods.getCompanyNum().call();
            let infos_tmp = [];
            for(let i=0;i<n;i=i+1){
                let addr = await props.contract.methods.getCompanyAddr(i).call();
                let {0:_name, 1:content} = await props.contract.methods.getAddrInfo(addr).call();
                let m = await props.contract.methods.getCompanyJobNum(addr).call();
                let jobs = []
                for(let j=0;j<m;j=j+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(addr,j).call();
                    let job_inv_num = await props.contract.methods.getJobInvNum(addr,j).call();
                    let job_off_num = await props.contract.methods.getJobOffNum(addr,j).call();
                    let job_invs = [];
                    let job_offs = [];
                    for(let k=0;k<job_inv_num;k=k+1){
                        let job_inv_index = await props.contract.methods.getJobInvIdx(addr,j,k).call();
                        let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7: invDur} = await props.contract.methods.getInvitationInfo(job_inv_index).call();
                        let {0: App_name} = await props.contract.methods.getAddrInfo(invApp).call();
                        job_invs[k] = {invIdx:job_inv_index, invApp:App_name, invCom:invCom, invJob:invJob, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                    }
                    for(let k=0;k<job_off_num;k=k+1){
                        let job_off_index = await props.contract.methods.getJobOffIdx(addr,j,k).call();
                        let {0: offApp, 1: offCom, 2: offJob, 3: offMsg, 4: offPay, 5:offStatus, 6: offcreateTime, 7:offupdateTime} = await props.contract.methods.getOfferInfo(job_off_index).call();
                        let {0: App_name} = await props.contract.methods.getAddrInfo(offApp).call();

                        job_offs[k] = {offIdx:job_off_index, offApp:App_name, offCom:offCom, offPay:offPay, offJob:offJob, offMsg:offMsg, offStatus:offStatus, offcreateTime:offcreateTime, offupdateTime:offupdateTime};
                    }
                    let active = false;
                    if(type){
                        active = await props.contract.methods.existActiveInv(accounts[0],addr,j).call();
                        //This part is used to handle cooldown bug
                        let flag = true;
                        for(let k=0;k<job_inv_num;k=k+1){
                            if(job_invs[k].invApp===name && job_invs[k].invCom===addr && job_invs[k].invJob===j.toString()){
                                if(job_invs[k].invTime+job_invs[k].invDur>=Math.floor(+ new Date()/1000)){
                                    flag = false;
                                    break;
                                }
                            }
                        }
                        if(flag){
                            active = false;
                        }
                        //****************************************
                    }
                    jobs[j] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false, invs:job_invs, active:active, offs:job_offs};
                }
                infos_tmp[i] = {addr:addr, name:_name, content:content, jobs:jobs};
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
            <div>
                <h1 className="title1">Decentralized Employment Agency</h1>
                <h3 className="title2">Username:{name}&nbsp;&nbsp;&nbsp;&nbsp;Account Type:{type? "Personal":"Company"}</h3>
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
                        <div className="jobs">
                            <h1>{e.name}</h1>
                            <details className="history">
                                <summary>Introduction</summary>
                                <h2>{e.content}</h2>
                            </details>
                            <details className="history">
                                <summary>Job List</summary>
                                {e.jobs.map((j,index)=>
                                    <div className="jobs">
                                        <h2>{j.title}&nbsp;&nbsp;&nbsp;&nbsp;{type&&j.status&&status&&!j.active? <button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>apply(e.addr,index)}>Apply</button>:null}</h2>
                                        <h2>Vacancy: {j.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {j.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={j.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                                        <h3>Description: {j.description}</h3>
                                        <details className="history">
                                            <summary>Offer Sent(Waiting)</summary>
                                            {j.offs.filter(i => i.offStatus==='0').map(i=>
                                            <div className="section">
                                                <p>{i.offApp} get offer of this job.</p>
                                                <p>Payment: {i.offPay}</p>
                                                <p>Msg: {i.offMsg}</p>
                                            </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Application Recieved(Waiting)</summary>
                                            {j.invs.filter(i => i.invStatus==='0' && i.invDir && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                                <div className="section">
                                                    <p>{i.invApp} apply to this job.</p>
                                                    <p>Msg: {i.invMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Interview Invatation Sent(Waiting)</summary>
                                            {j.invs.filter(i => i.invStatus==='0' && !i.invDir  && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                                <div className="section">
                                                    <p>Invite {i.invApp} to interview.</p>
                                                    <p>Msg: {i.invMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Offer(Negotiate)</summary>
                                            {j.offs.filter(i => i.offStatus==='3' ).map(i=>
                                                <div className="section">
                                                <p>Offer is negotiating</p>    
                                                <p>Payment: {i.offPay}</p>
                                                <p>Msg: {i.offMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Offer Result(Finished)</summary>
                                            {j.offs.filter(i => i.offStatus==='1' || i.offStatus==='2' ).map(i=>
                                                <div className="section">
                                                {i.offStatus==='1'? <p>{i.offApp} accepted offer.</p> : <p>{i.offApp} rejected offer.</p>}
                                                <p>Payment: {i.offPay}</p>
                                                <p>Msg: {i.offMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Application Recieved(Finished)</summary>
                                            {j.invs.filter(i => i.invStatus!=='0' && i.invDir).map(i=>
                                                <div className="section">
                                                    {i.invStatus==='1'? <p>Accept {i.invApp}'s application.</p> : <p>Reject {i.invApp}'s application.</p>}
                                                    <p>Msg: {i.invMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                        <details className="history">
                                            <summary>Interview Invatation Sent(Finished)</summary>
                                            {j.invs.filter(i => i.invStatus!=='0' && !i.invDir).map(i=>
                                                <div className="section">
                                                    {i.invStatus==='1'? <p>{i.invApp} accepted your invitation to interview.</p> : <p>{i.invApp} rejected your invitation to interview.</p>}
                                                    <p>Msg: {i.invMsg}</p>
                                                </div>
                                            )}
                                        </details>
                                    </div>
                                )}
                            </details>
                        </div>
                    )}
                </div>
                <div className="minor-box">
                    {type?
                        <div className="status">
                            <h2>Status:&nbsp;&nbsp;<span className="dot" style={status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                        </div>:null
                    }
                </div>
            </div>
        </div>
    );
}

export default Company;