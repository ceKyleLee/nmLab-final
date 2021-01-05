import { useState, useEffect } from 'react';

function Profile(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [text,settext] = useState("");
    const [status,setstatus] = useState(false);//false->close,true->open
    const [jobs,setjobs] = useState([]);//save invitation for personal type but save jobs for company type

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
            setname(name);
            settext(content);
            settype(type);
            if(type){
                let status = await props.contract.methods.getApplicantStatus(accounts[0]).call();
                setstatus(status==='0');
                let app_inv_num = await props.contract.methods.getApplincantInvNum(accounts[0]).call();
                let app_invs = [];
                for(let i=0;i<app_inv_num;i=i+1){
                    let app_inv_index = await props.contract.methods.getApplincantInvIdx(accounts[0],i).call();
                    let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7:invDur} = await props.contract.methods.getInvitationInfo(app_inv_index).call();
                    let {0: Com_name} = await props.contract.methods.getAddrInfo(invCom).call();
                    let {0: Job_title} = await props.contract.methods.getJobContent(invCom,invJob).call();
                    app_invs[i] = {invIdx:app_inv_index, invApp:invApp, invCom:Com_name, invJob:Job_title, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                }
                setjobs(app_invs);
            }
            else{
                let job_num = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
                let jobs_tmp = []
                for(let i=0;i<job_num;i=i+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(accounts[0],i).call();
                    let job_inv_num = await props.contract.methods.getJobInvNum(accounts[0],i).call();
                    let job_invs = [];
                    for(let j=0;j<job_inv_num;j=j+1){
                        let job_inv_index = await props.contract.methods.getJobInvIdx(accounts[0],i,j).call();
                        let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7:invDur} = await props.contract.methods.getInvitationInfo(job_inv_index).call();
                        let {0: App_name} = await props.contract.methods.getAddrInfo(invApp).call();
                        job_invs[j] = {invIdx:job_inv_index,invApp:App_name, invCom:invCom, invJob:invJob, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                    }
                    jobs_tmp[i] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false, invitation:job_invs};
                }
                setjobs(jobs_tmp);
            }
        }
        fetchData();
    });
    
    const changeStatus = async () => {
        if(status){
            await props.contract.methods.updateApplicantStatus(1).send({from:accounts[0]});
            setstatus(false);
        }
        else{
            await props.contract.methods.updateApplicantStatus(0).send({from:accounts[0]});
            setstatus(true);
        }
    }

    const changeInvStatus = async (invIdx, newStatus) => {
        await props.contract.methods.updateInvitationStatus(parseInt(invIdx,10), newStatus).send({from:accounts[0]});
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
                <div className="left-box">
                    <p className="profile-context">{text}</p>
                </div>
                {type? 
                <div className="right-box">
                    <span className="dot" style={status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span>
                    <h2>You are {status? "opened":"closed"} to {type? "interview and offer":"application"}.</h2>
                    <button onClick={changeStatus}>{status? "close":"open"}</button>
                    <h2>----------------------------------------------------</h2>
                    <h2>Interview Invitation(Waiting)</h2>
                    {jobs.filter(e => e.invStatus==='0' && !e.invDir && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                        <div>
                            <p>{e.invCom} invites you to the interview of job of {e.invJob}.</p>
                            <p>Msg: {e.invMsg}</p>
                            <button onClick={()=>changeInvStatus(e.invIdx,1)}>Accept</button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <button onClick={()=>changeInvStatus(e.invIdx,2)}>Reject</button>
                            <p>----------------------------------------------------</p>
                        </div>
                    )}
                    <h2>----------------------------------------------------</h2>
                    <h2>Application Submitted(Waiting)</h2>
                    {jobs.filter(e => e.invStatus==='0' && e.invDir && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                        <div>
                            <p>You apply for the job of {e.invJob} in {e.invCom}.</p>
                            <p>Msg: {e.invMsg}</p>
                            <p>----------------------------------------------------</p>
                        </div>    
                    )}
                    <h2>----------------------------------------------------</h2>
                    <h2>Interview Invitation(Finished)</h2>
                    {jobs.filter(e => e.invStatus!=='0' && !e.invDir).map(e=>
                        <div>
                            {e.invStatus==='1'? <p>You accepted {e.invCom}'s invitation to interview on the job of {e.invJob}.</p> : <p>You rejected {e.invCom}'s invitation to interview on the job of {e.invJob}.</p>}
                            <p>Msg: {e.invMsg}</p>
                            <p>----------------------------------------------------</p>
                        </div>
                    )}
                    <h2>----------------------------------------------------</h2>
                    <h2>Application Submitted(Finished)</h2>
                    {jobs.filter(e => e.invStatus!=='0' && e.invDir).map(e=>
                        <div>
                            {e.invStatus==='1'? <p>{e.invCom} accepted your application on the job of {e.invJob}.</p> : <p>{e.invCom} rejected your application on the job of {e.invJob}.</p>}
                            <p>Msg: {e.invMsg}</p>
                            <p>----------------------------------------------------</p>
                        </div>    
                    )}
                </div>:
                <div className="right-box">
                    {jobs.map(e=>
                    <div>
                        <h1>{e.title}</h1>
                        <h2>Vacancy: {e.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {e.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                        <details>
                            <summary>Application Recieved(Waiting)</summary>
                            {e.invitation.filter(i => i.invStatus==='0' && i.invDir && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                <div>
                                    <p>{i.invApp} apply to this job.</p>
                                    <p>Msg: {i.invMsg}</p>
                                    <button onClick={()=>changeInvStatus(i.invIdx,1)}>Accept</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <button onClick={()=>changeInvStatus(i.invIdx,2)}>Reject</button>
                                    <p>----------------------------------------------------</p>
                                </div>
                            )}
                        </details>
                        <details>
                            <summary>Interview Invatation Sent(Waiting)</summary>
                            {e.invitation.filter(i => i.invStatus==='0' && !i.invDir && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                <div>
                                    <p>You invite {i.invApp} to interview.</p>
                                    <p>Msg: {i.invMsg}</p>
                                    <p>----------------------------------------------------</p>
                                </div>
                            )}
                        </details>
                        <details>
                            <summary>Application Recieved(Finished)</summary>
                            {e.invitation.filter(i => i.invStatus!=='0' && i.invDir).map(i=>
                                <div>
                                    {i.invStatus==='1'? <p>You accepted {i.invApp}'s application.</p> : <p>You rejected {i.invApp}'s application.</p>}
                                    <p>Msg: {i.invMsg}</p>
                                    <p>----------------------------------------------------</p>
                                </div>
                            )}
                        </details>
                        <details>
                            <summary>Interview Invatation Sent(Finished)</summary>
                            {e.invitation.filter(i => i.invStatus!=='0' && !i.invDir).map(i=>
                                <div>
                                    {i.invStatus==='1'? <p>{i.invApp} accepted your invitation to interview.</p> : <p>{i.invApp} rejected your invitation to interview.</p>}
                                    <p>Msg: {i.invMsg}</p>
                                    <p>----------------------------------------------------</p>
                                </div>
                            )}
                        </details>
                        <h2>----------------------------------------------------</h2>
                    </div>)}
                </div>
                }
            </div>
        </div>
    );
}

export default Profile;