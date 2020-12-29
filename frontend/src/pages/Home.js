import { useState } from 'react';
import Profile from './Profile';
import Applicant from './Applicant';
import Company from './Company';
import Upload from './Upload';

function Home (props){
    const [page,setpage] = useState("Profile")

    const switchpage = (page) => {
        setpage(page);
    }
    
    if(page==="Profile"){
        return(
            <Profile contract={props.contract} accounts={props.accounts} setpage={switchpage}></Profile>
        );
    }

    if(page==="Applicant"){
        return(
            <Applicant contract={props.contract} accounts={props.accounts} setpage={switchpage}></Applicant>
        );
    }

    if(page==="Company"){
        return(
            <Company contract={props.contract} accounts={props.accounts} setpage={switchpage}></Company>
        )
    }

    if(page==="Upload"){
        return(
            <Upload contract={props.contract} accounts={props.accounts} setpage={switchpage}></Upload>
        );
    }
}

export default Home;