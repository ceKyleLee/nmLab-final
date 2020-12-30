import { useState, useEffect } from 'react';

function Profile(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [text,settext] = useState("");
    const [status,setstatus] = useState(false);//false->close,true->open
    const [jobs,setjobs] = useState([]);

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(props.accounts[0]).call();
            setname(name);
            settext(content);
            settype(type);
            if(type){
                let status = await props.contract.methods.getApplicantStatus(props.accounts[0]).call();
                setstatus(status==='0');
            }
            else{
                let n = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
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
                </div>:
                <div className="right-box">
                    {jobs.map(e=>
                    <div>
                        <h1>{e.title}</h1>
                        <h2>Vacancy: {e.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {e.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                        <h2>----------------------------------------------------</h2>
                    </div>)}
                </div>
                }
            </div>
        </div>
    );
}

export default Profile;