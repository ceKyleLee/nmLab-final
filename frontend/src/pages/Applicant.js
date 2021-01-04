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
                let {0:name, 1: content} = await props.contract.methods.getAddrInfo(addr).call();
                let status = await props.contract.methods.getApplicantStatus(addr).call();
                infos_tmp[i] = {addr:addr, name:name, content:content, status:status==='0'};
            }
            setinfos(infos_tmp);
            if(!type){
                n = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
                let jobs_tmp = []
                for(let i=0;i<n;i=i+1){
                    let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(accounts[0],i).call();
                    jobs_tmp[i] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false};
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
                    {infos.map((e,index)=>
                        <div>
                            <h1>{e.name}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h1>
                            <details>
                                <summary>Resume</summary>
                                <h2>{e.content}</h2>
                            </details>
                            {!type && e.status && jobs.length? 
                                <div>
                                    <br></br>
                                    <button onClick={()=>setform("interview",infos[index].addr)}>Interview</button>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <button onClick={()=>setform("offer",infos[index].addr)}>offer</button>
                                </div>:null
                            }
                            <h2>----------------------------------------------------</h2>
                        </div>
                    )}
                </div>
                <div className="minor-box">
                    {formstate.type===null? null:
                    <div>
                        <form name="form">
                            <p>Select one job</p>
                            {jobs.map((e,index)=>
                                <div>
                                    <input type="radio" id={index} name="job_index" value={index} required></input>
                                    <label for={index}>{e.title}</label>
                                </div>
                            )}
                            <br></br>
                        </form>
                        {formstate.type==="interview"? <button onClick={()=>interview()}>Submit</button>:<button onClick={()=>offer()}>Submit</button>}
                        <br></br>
                        <br></br>
                        <button onClick={()=>setformstate({type:null,addr:null})}>Quit</button>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Applicant;