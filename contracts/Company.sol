pragma solidity ^0.5.0;
import "./EventHelper.sol";

contract CompanyApp is EventHelper {

    struct Job {
        string Title;
        string Description;
        string Number;
        string Remain;
        uint16 status;
        uint   idx;
    }

    struct Company {
        string name;
        string intro;
        uint   idx;
        Job[]  joblist;
        bool   isValid;
    }

    mapping(address => Company  ) companies;
    address[] companyAddrs;

    // Modifier
    modifier isValidCompany(address addr) {
        require(isCompany(addr), "Address must be registered as Company.");
        _;
    }

    function isCompany(address addr) public view returns(bool) {
        return (companies[addr].isValid);
    }

    function addCompanyAcc(string memory _name) internal {
        companies[msg.sender].name = _name;
        companies[msg.sender].isValid = true;
        companies[msg.sender].idx = companyAddrs.push(msg.sender)-1;
        emit OnAccountAdd(msg.sender, "Company");
    }

    function getCompanyAcc(address _userAddr) internal view isValidCompany(_userAddr)
    returns(string memory _name, string memory _content, bool _type) {
        Company storage acc = companies[_userAddr];
        return (acc.name, acc.intro, false);
    }

    function updateCompanyAcc(string memory _content) internal isValidCompany(msg.sender) {
        Company storage acc = companies[msg.sender];
        acc.intro = _content;
        emit OnAccountUpdate(msg.sender, "Company");
    }

}