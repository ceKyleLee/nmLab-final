import { useState, useEffect } from 'react';

function Job(props){
    const accounts = props.accounts;
    const [name,setname] = useState("");
    const [type,settype] = useState("");
    const [jobs,setjobs] = useState([]);
    const [modify,setmodify] = useState(false);
    const [index,setindex] = useState(null);

    useEffect(()=>{
        async function fetchData(){
            let {0:name, 1:content, 2:type} = await props.contract.methods.getAddrInfo(accounts[0]).call();
            setname(name);
            settype(type);
            let n = await props.contract.methods.getCompanyJobNum(accounts[0]).call();
            let jobs_tmp = []
            for(let i=0;i<n;i=i+1){
                let {0:title, 1:description, 2:vacancy, 3:remain, 4:status} = await props.contract.methods.getJobContent(accounts[0],i).call();
                jobs_tmp[i] = {title:title, description:description, vacancy:vacancy, remain:remain, status:status==='0'?true:false};
            }
            setjobs(jobs_tmp);
        }
        fetchData();
    });

    const addjob = async () => {
        let yes = window.confirm('Are you sure to add the job?');
        if(yes){
            if(document.form.title.value!=="" && document.form.vacancy.value!=="" && document.getElementsByTagName("textarea")[0].value!==""){
                await props.contract.methods.AddJob(document.form.title.value,document.getElementsByTagName("textarea")[0].value,document.form.vacancy.value).send({from:accounts[0]});
                document.form.title.value = "";
                document.form.vacancy.value = "";
                document.getElementsByTagName("textarea")[0].value = "";
            }
            else{
                window.alert('Form is not complete!');
            }
        }
    }

    const updatejob = async () => {
        let yes = window.confirm('Are you sure to update the job?');
        if(yes){
            if(document.form.title.value!=="" && document.form.vacancy.value!=="" && document.getElementsByTagName("textarea")[0].value!==""){
                await props.contract.methods.updateJob(index,document.form.title.value,document.getElementsByTagName("textarea")[0].value,document.form.vacancy.value).send({from:accounts[0]});
                setmodify(false);
                setindex(null);
            }
            else{
                window.alert('Form is not complete!');
            }
        }
    }

    const entermodify = (index) => {
        setmodify(true);
        setindex(index);
    }

    const quitmodify = () => {
        setmodify(false);
        setindex(null);
    }

    const changeStatus = async (index) => {
        if(jobs[index].status){
            await props.contract.methods.updateJobStatus(index,1).send({from:accounts[0]});
        }
        else{
            await props.contract.methods.updateJobStatus(index,0).send({from:accounts[0]});
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
                <div className="left-box">
                    <h1>{modify? "Modify an exist job":"Add a new job"}</h1>
                    <form name="form">
                        <label>Title: </label>
                        <input type="text" name="title" defaultValue={modify? jobs[index].title:""} autoFocus required/>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <label>Vacancy: </label>
                        <input type="number" name="vacancy" required/>
                        <br></br>
                        <br></br>
                        <textarea cols="50" rows="25" defaultValue={modify? jobs[index].description:""} placeholder="Job description..." required></textarea>
                    </form>
                    {modify?
                        <div> 
                        <button onClick={()=>updatejob()}>Update</button>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <button onClick={()=>quitmodify()}>Quit</button>
                        </div>:<button onClick={()=>addjob()}>ADD</button>
                    }
                </div>
                <div className="right-box">
                    {jobs.map((e,index)=>
                        <div>
                            <h1>{e.title}</h1>
                            <h2>Vacancy: {e.vacancy}&nbsp;&nbsp;&nbsp;&nbsp;Remain: {e.remain}&nbsp;&nbsp;&nbsp;&nbsp;Status: <span className="dot" style={e.status? {backgroundColor:"green"}:{backgroundColor:"red"}}></span></h2>
                            <h3>Description:{e.description}</h3>
                            <button onClick={()=>entermodify(index)}>Modify</button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <button onClick={()=>changeStatus(index)}>{e.status? "Close job":"Open job"}</button>
                            <h2>----------------------------------------------------</h2>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Job;