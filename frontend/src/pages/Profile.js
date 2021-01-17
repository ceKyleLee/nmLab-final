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
                let app_off_num = await props.contract.methods.getApplincantOffNum(accounts[0]).call();
                let app_invs = [];
                let app_offs = [];
                for(let i=0;i<app_inv_num;i=i+1){
                    let app_inv_index = await props.contract.methods.getApplincantInvIdx(accounts[0],i).call();
                    let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7:invDur} = await props.contract.methods.getInvitationInfo(app_inv_index).call();
                    let {0: Com_name} = await props.contract.methods.getAddrInfo(invCom).call();
                    let {0: Job_title} = await props.contract.methods.getJobContent(invCom,invJob).call();
                    app_invs[i] = {invIdx:app_inv_index, invApp:invApp, invCom:Com_name, invJob:Job_title, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                }
                for(let i=0;i<app_off_num;i=i+1){
                    let app_off_index = await props.contract.methods.getApplincantOffIdx(accounts[0],i).call();
                    let {0: offApp, 1: offCom, 2: offJob, 3: offMsg, 4: offPay, 5:offStatus, 6: offcreateTime, 7:offupdateTime} = await props.contract.methods.getOfferInfo(app_off_index).call();
                    let {0: Com_name} = await props.contract.methods.getAddrInfo(offCom).call();
                    let {0: Job_title} = await props.contract.methods.getJobContent(offCom,offJob).call();
                    app_offs[i] = {offIdx:app_off_index, offApp:offApp, offCom:Com_name, offPay:offPay, offJob:Job_title, offMsg:offMsg, offStatus:offStatus, offcreateTime:offcreateTime, offupdateTime:offupdateTime};
                }
                let all = app_invs.concat(app_offs);
                setjobs(all);
            }
            else{
                let job_num = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
                let jobs_tmp = []
                for(let i=0;i<job_num;i=i+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(accounts[0],i).call();
                    let job_inv_num = await props.contract.methods.getJobInvNum(accounts[0],i).call();
                    let job_off_num = await props.contract.methods.getJobOffNum(accounts[0],i).call();
                    let job_invs = [];
                    let job_offs = [];
                    for(let j=0;j<job_inv_num;j=j+1){
                        let job_inv_index = await props.contract.methods.getJobInvIdx(accounts[0],i,j).call();
                        let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7:invDur} = await props.contract.methods.getInvitationInfo(job_inv_index).call();
                        let {0: App_name} = await props.contract.methods.getAddrInfo(invApp).call();
                        job_invs[j] = {invIdx:job_inv_index,invApp:App_name, invCom:invCom, invJob:invJob, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                    }
                    for(let j=0;j<job_off_num;j=j+1){
                        let job_off_index = await props.contract.methods.getJobOffIdx(accounts[0],i,j).call();
                        let {0: offApp, 1: offCom, 2: offJob, 3: offMsg, 4: offPay, 5:offStatus, 6: offcreateTime, 7:offupdateTime} = await props.contract.methods.getOfferInfo(job_off_index).call();
                        let {0: App_name} = await props.contract.methods.getAddrInfo(offApp).call();
                        job_offs[j] = {offIdx:job_off_index, offApp:App_name, offCom:offCom, offPay:offPay, offJob:offJob, offMsg:offMsg, offStatus:offStatus, offcreateTime:offcreateTime, offupdateTime:offupdateTime};
                    }
                    jobs_tmp[i] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false, invitation:job_invs, offer:job_offs};
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
    const changeOffStatus = async (offIdx, newStatus) => {
        await props.contract.methods.updateOfferStatus(parseInt(offIdx,10), newStatus).send({from:accounts[0]});
    }
    const changeOffPayment = async (offIdx,newStatus) => {
        let payment = window.prompt("Please enter your payment.","");
        if(payment!==null){
            console.log(payment)
            if(isNaN(payment)){
                window.alert('Please enter number!');
            }
        }
        await props.contract.methods.updateOfferPayment(parseInt(offIdx,10), payment).send({from:accounts[0]});
    }

    return(
        <div className="App">
            <div className="header">
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
                <div className="left-box">
                    <p className="profile-context">{text}</p>
                </div>
                {type? 
                <div className="right-box">
                    <div className="status">
                        <span className="dot" style={status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span>
                        <h2>You are {status? "opened":"closed"} to interview and offer.</h2>
                        <button onClick={changeStatus}>{status? "close":"open"}</button>
                    </div>
                    <div className="history">
                        <h2>Offer (Waiting)</h2>
                        {jobs.filter(e => e.offStatus==='0').map(e=>
                            <div className="section">
                                <p>{e.offCom} send you offer of {e.offJob}.</p>
                                <p>Payment: {e.offPay}</p>
                                <p>Msg: {e.offMsg}</p>
                                <button onClick={()=>changeOffStatus(e.offIdx,1)}>Accept</button>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <button onClick={()=>changeOffStatus(e.offIdx,2)}>Reject</button>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <button onClick={()=>changeOffStatus(e.offIdx,3)}>Negotiate</button>
                            </div>
                        )}
                    </div>
                    <div className="history">
                        <h2>Interview Invitation(Waiting)</h2>
                        {jobs.filter(e => e.invStatus==='0' && !e.invDir && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                            <div className="section">
                                <p>{e.invCom} invites you to the interview of job of {e.invJob}.</p>
                                <p>Msg: {e.invMsg}</p>
                                <button onClick={()=>changeInvStatus(e.invIdx,1)}>Accept</button>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <button onClick={()=>changeInvStatus(e.invIdx,2)}>Reject</button>
                            </div>
                        )}
                    </div>
                    <div className="history">
                        <h2>Application Submitted(Waiting)</h2>
                        {jobs.filter(e => e.invStatus==='0' && e.invDir && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                            <div className="section">
                                <p>You apply for the job of {e.invJob} in {e.invCom}.</p>
                                <p>Msg: {e.invMsg}</p>
                            </div>    
                        )}
                    </div>
                    <div className="history">
                        <h2>Offer (Negotiate)</h2>
                        {jobs.filter(e => e.offStatus=== '3' ).map(e=>
                            <div className="section">
                                <p>Offer of {e.offJob} is negotiating</p>
                                <p>Payment: {e.offPay}</p>
                                <p>Msg: {e.offMsg}</p>
                            </div>
                        )}
                    </div>
                    <div className="history">
                        <h2>Offer Result(Finished)</h2>
                        {jobs.filter(e => e.offStatus==='1'||e.offStatus==='2').map(e=>
                            <div className="section">
                                {e.offStatus==='1'? <p>You accepted {e.offCom}'s offer of {e.offJob}.</p> : <p>You rejected {e.offCom}'s offer of {e.offJob}.</p>}
                                <p>Payment: {e.offPay}</p>
                                <p>Msg: {e.offMsg}</p>
                            </div>
                        )}
                    </div>
                    <div className="history">
                        <h2>Interview Invitation(Finished)</h2>
                        {jobs.filter(e => e.invStatus!=='0' && !e.invDir).map(e=>
                            <div className="section">
                                {e.invStatus==='1'? <p>You accepted {e.invCom}'s invitation to interview on the job of {e.invJob}.</p> : <p>You rejected {e.invCom}'s invitation to interview on the job of {e.invJob}.</p>}
                                <p>Msg: {e.invMsg}</p>
                            </div>
                        )}
                    </div>
                    <div className="history">
                        <h2>Application Submitted(Finished)</h2>
                        {jobs.filter(e => e.invStatus!=='0' && e.invDir).map(e=>
                            <div className="section">
                                {e.invStatus==='1'? <p>{e.invCom} accepted your application on the job of {e.invJob}.</p> : <p>{e.invCom} rejected your application on the job of {e.invJob}.</p>}
                                <p>Msg: {e.invMsg}</p>
                            </div>    
                        )}
                    </div>
                </div>:
                <div className="right-box">
                    {jobs.map(e=>
                    <div className="jobs">
                        <h1>{e.title}</h1>
                        <h2>Vacancy: {e.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {e.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                        <details className="history">
                            <summary>Offer Sent(Waiting)</summary>
                            {e.offer.filter(i => i.offStatus==='0').map(i=>
                                <div className="section">
                                    <p>You send {i.offApp} an offer.</p>
                                    <p>Payment: {i.offPay}</p>
                                    <p>Msg: {i.offMsg}</p>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Application Recieved(Waiting)</summary>
                            {e.invitation.filter(i => i.invStatus==='0' && i.invDir && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                <div className="section">
                                    <p>{i.invApp} apply to this job.</p>
                                    <p>Msg: {i.invMsg}</p>
                                    <button onClick={()=>changeInvStatus(i.invIdx,1)}>Accept</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <button onClick={()=>changeInvStatus(i.invIdx,2)}>Reject</button>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Interview Invatation Sent(Waiting)</summary>
                            {e.invitation.filter(i => i.invStatus==='0' && !i.invDir && (Math.floor(+ new Date()/1000)<=i.invTime+i.invDur) ).map(i=>
                                <div className="section">
                                    <p>You invite {i.invApp} to interview.</p>
                                    <p>Msg: {i.invMsg}</p>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Offer (Negotiate)</summary>
                            {e.offer.filter(i => i.offStatus==='3' ).map(i=>
                                <div className="section">
                                <p>{i.offApp} want negotiate your offer.</p>
                                <p>Payment: {i.offPay}</p>
                                <p>Msg: {i.offMsg}</p>
                                <button onClick={()=>changeOffPayment(i.offIdx,0)}>Change Payment</button>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Offer Results(Finished)</summary>
                            {e.offer.filter(i => i.offStatus!=='0' && i.offStatus!=='3').map(i=>
                                <div className="section">
                                {i.offStatus==='1'? <p>{i.offApp} accepted your offer.</p> : <p>{i.offApp} rejected your offer.</p>}
                                <p>Payment: {i.offPay}</p>
                                <p>Msg: {i.offMsg}</p>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Application Recieved(Finished)</summary>
                            {e.invitation.filter(i => i.invStatus!=='0' && i.invDir).map(i=>
                                <div className="section">
                                    {i.invStatus==='1'? <p>You accepted {i.invApp}'s application.</p> : <p>You rejected {i.invApp}'s application.</p>}
                                    <p>Msg: {i.invMsg}</p>
                                </div>
                            )}
                        </details>
                        <details className="history">
                            <summary>Interview Invatation Sent(Finished)</summary>
                            {e.invitation.filter(i => i.invStatus!=='0' && !i.invDir).map(i=>
                                <div className="section">
                                    {i.invStatus==='1'? <p>{i.invApp} accepted your invitation to interview.</p> : <p>{i.invApp} rejected your invitation to interview.</p>}
                                    <p>Msg: {i.invMsg}</p>
                                </div>
                            )}
                        </details>
                    </div>)}
                </div>
                }
            </div>
        </div>
    );
}

export default Profile;