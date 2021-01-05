pragma solidity ^0.5.0;
import "./Applicant.sol";
import "./Company.sol";

contract AgencyApp is ApplicantApp, CompanyApp  {


    // Struct
    enum interStatus{
        wait,
        accept,
        reject,
        Last
    }
    struct Invitation {
        address applicant;
        address company;
        uint jobIdx;
        string message;
        bool direction; // true: from applicant, false: from company
        uint16 status;

        uint idx;
        uint256 timestamp;
    }
    uint256 constant invDeadline = 30 seconds;


    enum offerStatus{
        wait,
        accept,
        reject,
        Last
    }
    struct Offer {
        address applicant;
        address company;
        uint jobIdx;
        string message;
        uint16 status;
        uint payment;

        uint idx;
        uint256 createTime;
        uint256 updateTime;
    }
    uint256 constant offerDeadline = 14 days;
    uint256 constant offerCooldown = 1 days;

    Invitation[] invitations;
    Offer[] offers;

    // Modifier
    modifier isValid(address addr) {
        require(isAccount(addr), "Address must be registered.");
        _;
    }

    function isAccount(address addr) public view returns(bool) {
        return (isApplicant(addr) || isCompany(addr));
    }

    modifier modifiableInv(uint invIdx, address addr) {
        Invitation storage inv = invitations[invIdx];
        require(((inv.status == uint16(interStatus.wait)) && (inv.timestamp+invDeadline >= now)), "This invitation has been lock!");
        if (inv.direction) { // From applicant
            require(inv.company == addr, "Only company can update this invitation!");
        } else { // From company
            require(inv.applicant == addr, "Only applicant can update this invitation!");
        }
        _;
    }

    function existActiveInv(address _applicant, address _company, uint _jobIdx ) 
    public view isValidApplicant(_applicant) isValidCompany(_company) returns(bool){
        Job storage job = getJob(_company, _jobIdx);
        address invApp;
        uint16  invStatus;
        uint256 invTime;
        for(uint i=0;i < job.invitations.length;i++){
            Invitation storage inv = invitations[job.invitations[i]];
            invApp = inv.applicant;
            invStatus = inv.status;
            invTime = inv.timestamp;
            if (invApp== _applicant && 
                invStatus== uint16(interStatus.wait) && 
                invTime+invDeadline >= now ) {
                    return true;
            }
        }
        return false;
    }

    modifier modifiableOffer(uint offerIdx, address addr) {
        Offer storage offer = offers[offerIdx];
        require((offer.status == uint16(offerStatus.wait) && offer.createTime+offerDeadline >= now), "This offer has been lock!");
        require((offer.applicant == addr), "Only applicant can update this offer.");
        _;
    }


    function existActiveOffer(address _applicant, address _company, uint _jobIdx ) 
    public view isValidApplicant(_applicant) isValidCompany(_company) returns(bool){
        Job storage job = getJob(_company, _jobIdx);
        uint offerIdx;
        for(uint i=0;i < job.offers.length;i++){
            offerIdx = job.offers[i];
            if (offers[offerIdx].applicant == _applicant && 
                offers[offerIdx].status == uint16(offerStatus.wait) && 
                offers[offerIdx].createTime+offerDeadline <= now ) {
                    return true;
            }
        }
        return false;
    }


    // Account
    // Action
    function addAcc(string memory _name, bool _type) public {
        require(!isAccount(msg.sender), "Address should not be registered.");
        if (_type) { // Applicant
            addApplicantAcc(_name);
        }
        else { // Company
            addCompanyAcc(_name);
        }
    }

    function updataAccContent(string memory _content, bool _type) public isValid(msg.sender) {
        if (_type) { // Applicant
            updateApplicantAcc(_content);
        } else { // Company
            updateCompanyAcc(_content);
        }
    }

    // View
    function getAddrInfo(address _userAddr) public view isValid(_userAddr)
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
    


    // Invitation
    // Action
    function sendInvitation(address _tarAddr, uint _jobIdx, string memory _msg, bool _dir) public {
        address _companyAddr;
        address _applicantAddr;
        if (_dir) { // From Applicant
            _companyAddr = _tarAddr;
            _applicantAddr = msg.sender;
        } else { // From company
            _companyAddr = msg.sender;
            _applicantAddr = _tarAddr;
        }
        require(!existActiveInv(_applicantAddr, _companyAddr, _jobIdx), "Exist active invitation!");

        Invitation memory new_inv = Invitation({
            applicant: _applicantAddr,
            company: _companyAddr,
            jobIdx: _jobIdx,
            message: _msg,
            direction: _dir,
            status: uint16(interStatus.wait),
            idx: 0,
            timestamp: now
        });
        new_inv.idx = invitations.push(new_inv)-1;

        Job storage _job = getJob(_companyAddr, _jobIdx);
        _job.invitations.push(new_inv.idx);

        Applicant storage _applicant = applicants[_applicantAddr];
        _applicant.invitations.push(new_inv.idx);

        emit OnInvitationAdd(_applicantAddr, _companyAddr, _jobIdx, _dir);
    }

    function updateInvitationStatus(uint _invIdx, uint _newStatus) public modifiableInv(_invIdx, msg.sender) {
        require( _newStatus < uint(interStatus.Last), "New status is not valid!" );
        Invitation storage inv = invitations[_invIdx];
        inv.status = uint16(_newStatus);
        
        emit OnInvitationUpdate(inv.applicant, inv.company, inv.jobIdx, inv.direction, inv.status);
    }

    // View
    function getInvitationInfo(uint _invIdx) public view 
    returns (address _applicants, address _company, uint _jobIdx, 
    string memory _msg, bool _dir, uint _status, uint256 _timestamp, uint256 _timedur) {
        Invitation storage inv = invitations[_invIdx];
        return (inv.applicant, inv.company, inv.jobIdx, inv.message, inv.direction, uint(inv.status), inv.timestamp, invDeadline);
    }


    // Offer
    // Action
    function sendOffer(address _tarAddr, uint _jobIdx, uint _payment, string memory _msg) public {
        address _companyAddr = msg.sender;
        address _applicantAddr = _tarAddr;
        require(!existActiveOffer(_applicantAddr, _companyAddr, _jobIdx), "Exist active offer!");
        require(applicants[_applicantAddr].status == uint16(AppStatus.open), "Applicant is not open for offers!");

        Offer memory new_offer = Offer({
            applicant: _applicantAddr,
            company: _companyAddr,
            jobIdx: _jobIdx,
            message: _msg,
            status: uint16(interStatus.wait),
            payment: _payment,
            idx: 0,
            createTime: now,
            updateTime: now
        });
        new_offer.idx = offers.push(new_offer)-1;

        Job storage _job = getJob(_companyAddr, _jobIdx);
        _job.offers.push(new_offer.idx);

        Applicant storage _applicant = applicants[_applicantAddr];
        _applicant.offers.push(new_offer.idx);

        emit OnOfferAdd(_applicantAddr, _companyAddr, _jobIdx, _payment);
    }

    function updateOfferStatus(uint _offerIdx, uint _newStatus) public modifiableOffer(_offerIdx, msg.sender) {
        require( _newStatus < uint(offerStatus.Last), "New status is not valid!" );
        Offer storage offer = offers[_offerIdx];
        offer.status = uint16(_newStatus);
        
        emit OnOfferUpdate(offer.applicant, offer.company, offer.jobIdx, offer.payment, offer.status);
    }

    function updateOfferPayment(uint _offerIdx, uint _newPayment) public {
        Offer storage offer = offers[_offerIdx];
        require(offer.company == msg.sender, "Must be the comanpy account which sent the offer.");
        require(offer.updateTime + offerCooldown <= now, "Payment update still in cool down.");
        offer.payment = _newPayment;

        emit OnOfferUpdate(offer.applicant, offer.company, offer.jobIdx, offer.payment, offer.status);
    }

    // View
    function getOfferInfo(uint _offerIdx) public view 
    returns (address _applicants, address _company, uint _jobIdx, 
    string memory _msg, uint _payment, uint _status, uint256 _createTime, uint256 _updateTime) {
        Offer storage offer = offers[_offerIdx];
        return (offer.applicant, offer.company, offer.jobIdx, offer.message, offer.payment, uint(offer.status), offer.createTime, offer.updateTime);
    }
}