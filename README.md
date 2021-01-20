# Networking and Multimedia Lab (2020, Fall) Final Project - Decentralized Employment Agency 


## Prerequisite
- node.js
- npm
- ganache-cli(or ganache)
- truffle 
- yarn
- Metamask(browser add-ons)

```
~ $ sudo apt install nodejs
~ $ sudo apt install npm
~ $ npm install -g ganache-cli
~ $ npm install -g truffle
~ $ npm install -g yarn
```

## Quick Start

1. git clone https://github.com/1998Isabel/NMLabFinalProject.git
2. cd nmlab-final/
3. Start ganachi(or ganache-cli) at default port(7545)
4. Migrate contract, compile and start frontend webpage
```
sh migrate.sh
cd frontend/
yarn
yarn start
```

## Ussage

### Register and Sign in

1. Open https://localhost:3000
2. Import Ethereum accout from ganache and connect to the ganache chain
3. Enter account name and select account type to register
4. Click **register** and confirm matamask transaction

### Manage user profile
#### Upload Resume/Introduction (Applicant/Company)
1. Click *Upload resume/intro* at left panel
2. Type in applicant resume/company introduction
3. Click **submit** and confirm matamask transaction

#### Add new open job (Company)
1. Click *Job manager* at left panel
2. Type in job title, vacancy and job description
3. Click **ADD** and confirm matamask transaction

#### Modify job (Company)
1. Click *Job manager* at left panel
2. Click **Modify** at the bottom of the job in right side column
3. Type in new job title, vacancy and job description
4. Click **Update** and confirm matamask transaction

### Invitation Action
#### Apply job (Applicant)
1. Click *Profile* at left panel and click **open** in right side column (if not open)
2. Click *Companies' info* at left panel and open *Job list* at the bottom of Company account
3. Click **Apply** at the right of job title
4. Type in message and confirm matamask transaction

#### Interact with interview (Applicant)    
1. Click *Profile* at left panel
2. Click **Accept** or **Reject** and confirm matamask transaction

#### Invite for interview (Company)
1. Click *Job manager* at left panel and click *Open job* at the job in right side column (if not open)
2. Click *Applicants' info* at left panel and click *interview* at the bottom of Applicant account
3. Select job and Click **Send** right side column 
4. Type in message and confirm matamask transaction

#### Interact with applicant (Company)
1. Click *Profile* at left panel
2. Open *Application Recieved(Waiting)* at the job in right side column
3. Click **Accept** or **Reject** and confirm matamask transaction

### Offer Action
#### Send offer (Company)
1. Click *Job manager* at left panel and click **Open job** at the job in right side column (if not open)
2. Click *Applicants' info* at left panel and click **offer** at the bottom of Applicant account
3. Select job and Click **Submit** right side column 
4. Type in payment, message and confirm matamask transaction

#### Interact with offer (Applicant)
1. Click *Profile* at left panel
2. Click **Accept**/**Reject**/**Negotiate** and confirm matamask transaction

#### Update with offer (Company)
1. Click *Profile* at left panel
2. open *Offer (Negotiate)* at the job in right side column
3. Click **Change payment** 
4. Type in new payment and confirm matamask transaction

