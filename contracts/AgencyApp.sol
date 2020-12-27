pragma solidity ^0.5.0;
import "./Applicant.sol";
import "./Company.sol";

contract AgencyApp is ApplicantApp, CompanyApp  {

    // Modifier
    modifier isValid(address addr) {
        require(isAccount(addr), "Address must be registered.");
        _;
    }

    function isAccount(address addr) public view returns(bool) {
        return (isApplicant(addr) || isCompany(addr));
    }


    function addAcc(string memory _name, bool _type) public {
        require(!isAccount(msg.sender), "Address should not be registered.");
        if (_type) { // Applicant
            addApplicantAcc(_name);
        }
        else { // Company
            addCompanyAcc(_name);
        }
    }

    function getAcc(address _userAddr) public view isValid(_userAddr)
    returns(string memory _name, string memory _content, bool _type) {
        string memory name;
        string memory content;
        if (isApplicant(_userAddr)) { // Applicant
            (name, content, ) = getApplicantAcc(_userAddr);
            return (name, content, true);
        } else { // Company
            (name, content) = getCompanyAcc(_userAddr);
            return (name, content, false);
        }
    } 
    
    function updataAccContent(string memory _content, bool _type) public isValid(msg.sender) {
        if (_type) { // Applicant
            updateApplicantAcc(_content);
        } else { // Company
            updateCompanyAcc(_content);
        }
    }

    function checkMsgsender() public view returns(address){
        return msg.sender;
    }

}