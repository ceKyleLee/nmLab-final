import { useState, useEffect } from 'react';

function Applicant(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [infos,setinfos] = useState([]);
    const [jobs,setjobs] = useState([]);
    const [formstate,setformstate] = useState({type:null,addr:null});

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 2:type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
            setname(name);
            settype(type);
            let n = await props.contract.methods.getApplicantsNum().call();
            let infos_tmp = [];
            for(let i=0;i<n;i=i+1){
                let addr = await props.contract.methods.getApplicantAddr(i).call();
                let {0:_name, 1: content} = await props.contract.methods.getAddrInfo(addr).call();
                let status = await props.contract.methods.getApplicantStatus(addr).call();
                let inv_num = await props.contract.methods.getApplincantInvNum(addr).call();
                let invs = [];
                for(let j=0;j<inv_num;j=j+1){
                    let inv_index = await props.contract.methods.getApplincantInvIdx(addr,j).call();
                    let {0: invApp, 1: invCom, 2: invJob, 3: invMsg, 4: invDir, 5:invStatus, 6: invTime, 7: invDur} = await props.contract.methods.getInvitationInfo(inv_index).call();
                    let {0: Com_name} = await props.contract.methods.getAddrInfo(invCom).call();
                    let {0: Job_title} = await props.contract.methods.getJobContent(invCom,invJob).call();
                    invs[j] = {invIdx:inv_index, invApp:invApp, invCom:Com_name, invJob:Job_title, invMsg:invMsg, invDir:invDir, invStatus:invStatus, invTime:parseInt(invTime,10), invDur:parseInt(invDur,10)};
                }
                infos_tmp[i] = {addr:addr, name:_name, content:content, status:status==='0', invs:invs};
            }
            setinfos(infos_tmp);
            if(!type){
                n = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
                let jobs_tmp = []
                for(let i=0;i<n;i=i+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(accounts[0],i).call();
                    let active = {};//{app_addr:true/false}
                    for(let j=0;j<infos_tmp.length;j=j+1){
                        let res = await props.contract.methods.existActiveInv(infos_tmp[j].addr,accounts[0],i).call();
                        //This part is used to handle cooldown bug
                        let flag = true;
                        infos_tmp[j].invs.forEach(e => {
                            if(e.invApp===infos_tmp[j].addr && e.invCom===name && e.invJob===title){
                                if(e.invTime+e.invDur>=Math.floor(+ new Date()/1000)){
                                   flag = false;
                                }
                            }
                        });
                        if(flag){
                            res = false;
                        }
                        //****************************************
                        active[infos_tmp[j].addr] = res;
                    }
                    jobs_tmp[i] = {index:i, title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false, active:active};
                }
                setjobs(jobs_tmp);
            }
        }
        fetchData();
    });

    const setform = (type, addr) => {
        setformstate({type:type,addr:addr});
    }

    const interview = async () => {
        if(document.form.job_index){
            if(document.form.job_index.value!==""){
                let msg = window.prompt("Please enter your message.","");
                let job_index = parseInt(document.form.job_index.value,10);
                if(msg!==null){
                    await props.contract.methods.sendInvitation(formstate.addr,job_index,msg,false).send({from:accounts[0]});
                }
            }
            else{
                window.alert('Please select one job!')
            }
        }
        setformstate({type:null,addr:null});
    }

    const offer = async () => {
        if(document.form.job_index.value!==""){
            let payment = window.prompt("Please enter your payment.","");
            if(payment!==null){
                payment = parseInt(payment,10);
                console.log(payment)
                if(isNaN(payment)){
                    window.alert('Please enter number!');
                }
                else{
                    let msg = window.prompt("Please enter your message.","");
                    if(msg!==null){
                        await props.contract.methods.sendOffer(formstate.addr,parseInt(document.form.job_index.value,10),payment,msg).send({from:accounts[0]});
                    }
                }
            }
        }
        else{
            window.alert('Please select one job!');
        }
        setformstate({type:null,addr:null});
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
                    {infos.map((e,index)=>
                        <div className="status">
                            <h1>{e.name}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h1>
                            <details className="history">
                                <summary>Resume</summary>
                                <h2>{e.content}</h2>
                            </details>
                            <details className="history">
                                <summary>History</summary>
                                <div className="history">
                                    <h2>Interview Invitation(Waiting)</h2>
                                    {e.invs.filter(e => e.invStatus==='0' && !e.invDir && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                                        <div className="section">
                                            <p>{e.invCom} invites the interview of job of {e.invJob}.</p>
                                            <p>Msg: {e.invMsg}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="history">
                                    <h2>Application Submitted(Waiting)</h2>
                                    {e.invs.filter(e => e.invStatus==='0' && e.invDir  && (Math.floor(+ new Date()/1000)<=e.invTime+e.invDur) ).map(e=>
                                        <div className="section">
                                            <p>Apply for the job of {e.invJob} in {e.invCom}.</p>
                                            <p>Msg: {e.invMsg}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="history">
                                    <h2>Interview Invitation(Finished)</h2>
                                    {e.invs.filter(e => e.invStatus!=='0' && !e.invDir).map(e=>
                                        <div className="section">
                                            {e.invStatus==='1'? <p>Accept {e.invCom}'s invitation to interview on the job of {e.invJob}.</p> : <p>Reject {e.invCom}'s invitation to interview on the job of {e.invJob}.</p>}
                                            <p>Msg: {e.invMsg}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="history">
                                <h2>Application Submitted(Finished)</h2>
                                {e.invs.filter(e => e.invStatus!=='0' && e.invDir).map(e=>
                                    <div className="section">
                                        {e.invStatus==='1'? <p>{e.invCom} accepted application.</p> : <p>{e.invCom} rejected application.</p>}
                                        <p>Msg: {e.invMsg}</p>
                                    </div>    
                                )}
                                </div>
                            </details>
                            {!type && e.status && jobs.filter(e=>e.status).length? 
                                <div>
                                    <button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>setform("interview",infos[index].addr)}>Interview</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>setform("offer",infos[index].addr)}>offer</button>
                                </div>:null
                            }
                        </div>
                    )}
                </div>
                <div className="minor-box">
                    {formstate.type===null? null:
                    <div className="inv">
                        <form name="form">
                            <p>Select one job</p>
                            {jobs.filter(e=>e.status&&!e.active[formstate.addr]).map(e=>
                                <div>
                                    <input type="radio" id={e.index} name="job_index" value={e.index} required></input>
                                    <label for={e.index}> {e.title}</label>
                                </div>
                            )}
                            <br></br>
                        </form>
                        {formstate.type==="interview"? <button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>interview()}>Send</button>:<button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>offer()}>Submit</button>}
                        <br></br>
                        <br></br>
                        <button class="w3-button w3-medium w3-blue w3-round-large" onClick={()=>setformstate({type:null,addr:null})}>Quit</button>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Applicant;